//! Tauri commands — the IPC surface the React frontend calls with `invoke()`.
//! These replace the Flask REST routes; there is no HTTP server anymore.
//!
//! Naming maps roughly onto the old routes:
//!   invoke('list_dir')       <- GET /api/projects/:id/browse
//!   invoke('read_file')      <- GET /api/file/:path
//!   invoke('parse_file')     <- (parsing half of the file routes)
//!   invoke('add_watch_root') <- POST /api/.../watches
//!   invoke('engine_status')  <- (new) drives the native menu status
//!   invoke('restart_engine') <- (new) native menu "Restart engine"

use std::path::{Path, PathBuf};

use serde_json::{json, Value};
use tauri::{AppHandle, State};

use crate::engine::scan;
use crate::engine::types::{DirEntry, DocNode, EngineStatus};
use crate::engine::parse;
use crate::state::AppState;
use crate::store;

/// Run blocking filesystem/CPU work on a dedicated blocking thread so the
/// webview main thread stays responsive. Flattens the join error and the
/// command's own `Result` into one `Result<T, String>`.
async fn run_blocking<T, F>(f: F) -> Result<T, String>
where
    F: FnOnce() -> Result<T, String> + Send + 'static,
    T: Send + 'static,
{
    tauri::async_runtime::spawn_blocking(f)
        .await
        .map_err(|e| e.to_string())?
}

// ---------------------------------------------------------------------------
// Data reads ported from the Flask CRUD/browse routes. These read the same
// ~/.fileviewer JSON the Python app owns, so existing data shows immediately.
// ---------------------------------------------------------------------------

/// GET /api/groups -> the groups array.
#[tauri::command]
pub fn get_groups() -> Vec<Value> {
    store::groups()
}

/// GET /api/settings -> merged settings object.
#[tauri::command]
pub fn get_settings() -> Value {
    store::settings()
}

/// GET /api/projects/:id/browse[/:subpath] -> `{ items: [...] }`.
///
/// `async` + `spawn_blocking`: the directory read runs on a blocking worker
/// thread so the webview's main thread never stalls (no beachball).
#[tauri::command]
pub async fn browse_project(
    project_id: String,
    subpath: Option<String>,
) -> Result<Value, String> {
    run_blocking(move || {
        let root = store::project_path(&project_id).ok_or("Project not found")?;
        let dir = match subpath {
            Some(sp) if !sp.is_empty() => root.join(sp),
            _ => root,
        };
        let items = scan::browse(&dir, &store::excluded_folders()).map_err(|e| e.to_string())?;
        Ok(json!({ "items": items }))
    })
    .await
}

/// GET /api/projects/:id/browse-all -> `{ cache, rootItems }`.
///
/// The recursive whole-project scan is the heaviest call; it MUST stay off the
/// main thread.
#[tauri::command]
pub async fn browse_all(project_id: String) -> Result<Value, String> {
    run_blocking(move || {
        let root = store::project_path(&project_id).ok_or("Project not found")?;
        let (cache, root_items) = scan::browse_all(&root, &store::excluded_folders());
        Ok(json!({ "cache": cache, "rootItems": root_items }))
    })
    .await
}

/// GET /api/file/:path -> `{ tree, content, html, junit, type }`.
#[tauri::command]
pub async fn get_file(path: String) -> Result<Value, String> {
    run_blocking(move || {
        // Access check: file must live inside a watched project.
        let inside = store::all_project_paths().iter().any(|p| path.starts_with(p));
        if !inside {
            return Err("File not in watched project".into());
        }

        let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
        let ext = Path::new(&path)
            .extension()
            .and_then(|e| e.to_str())
            .map(|e| format!(".{}", e.to_lowercase()))
            .unwrap_or_default();

        let tree = parse::parse(&ext, &content);
        let html = if ext == ".md" {
            Some(parse::markdown_to_html(&content))
        } else {
            None
        };

        Ok(json!({
            "tree": tree,
            "content": content,
            "html": html,
            "junit": Value::Null, // TODO(port): junit XML parsing
            "type": ext,
        }))
    })
    .await
}

/// GET /api/projects/:id/watched-files -> `{ watches: [...] }`.
///
/// TODO(port): implement watch/glob resolution from settings.json. Stubbed to
/// empty for now so the panel stops calling the (removed) Flask server — the
/// `ECONNREFUSED` spam and its jank on every project switch came from here.
#[tauri::command]
pub fn get_watched_files(_project_id: String) -> Value {
    json!({ "watches": [] })
}

// ---------------------------------------------------------------------------
// Engine commands (generic file access, watching, status).
// ---------------------------------------------------------------------------

/// Browse the immediate children of a folder, using the cache when warm.
#[tauri::command]
pub async fn list_dir(path: String, state: State<'_, AppState>) -> Result<Vec<DirEntry>, String> {
    if let Some(hit) = state.cache.get(&path) {
        return Ok(hit);
    }
    let cache = state.cache.clone();
    let p = path.clone();
    let entries = run_blocking(move || {
        scan::list_dir(Path::new(&p)).map_err(|e| e.to_string())
    })
    .await?;
    cache.put(path, entries.clone());
    Ok(entries)
}

/// Return a file's raw text content.
#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    run_blocking(move || std::fs::read_to_string(&path).map_err(|e| e.to_string())).await
}

/// Parse a file into a document tree, dispatching on its extension.
#[tauri::command]
pub fn parse_file(path: String) -> Result<Vec<DocNode>, String> {
    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let ext = PathBuf::from(&path)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| format!(".{}", e.to_lowercase()))
        .unwrap_or_default();
    Ok(parse::parse(&ext, &content))
}

/// Add a folder to the watch/serve set and start watching it.
#[tauri::command]
pub fn add_watch_root(
    path: String,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<EngineStatus, String> {
    state
        .add_root(&app, PathBuf::from(path))
        .map_err(|e| e.to_string())?;
    Ok(state.status())
}

/// Current engine health (also used by the native menu status item).
#[tauri::command]
pub fn engine_status(state: State<'_, AppState>) -> EngineStatus {
    state.status()
}

/// Restart the engine: clear cache, re-arm watchers, reset uptime.
#[tauri::command]
pub fn restart_engine(app: AppHandle, state: State<'_, AppState>) -> Result<EngineStatus, String> {
    state.restart(&app).map_err(|e| e.to_string())?;
    Ok(state.status())
}
