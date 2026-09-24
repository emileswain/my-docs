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

/// The definitive grouped file-type list for the tree filter popup.
#[tauri::command]
pub fn get_file_type_groups() -> Value {
    crate::file_types::groups()
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

/// GET /api/images?folder=... -> `{ folder, name, images: [...] }`.
/// Lists image files directly inside a folder (which must be within a project).
#[tauri::command]
pub async fn list_folder_images(folder: String) -> Result<Value, String> {
    run_blocking(move || {
        let sep = std::path::MAIN_SEPARATOR;
        let inside = store::all_project_paths()
            .iter()
            .any(|p| folder == *p || folder.starts_with(&format!("{p}{sep}")));
        if !inside {
            return Err("Folder not in watched project".into());
        }
        let dir = Path::new(&folder);
        if !dir.is_dir() {
            return Err("Folder not found".into());
        }
        let name = dir
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();
        let images = scan::list_images(dir);
        Ok(json!({ "folder": folder, "name": name, "images": images }))
    })
    .await
}

// --- Document notes (ported from the /api/notes routes) ---

/// GET /api/notes/:path -> the notes JSON (`{ notes: [...] }`).
#[tauri::command]
pub fn get_notes(file_path: String) -> Value {
    store::get_notes(&file_path)
}

/// PUT /api/notes/:path -> `{ success: true }`.
#[tauri::command]
pub fn save_notes(file_path: String, notes: Value) -> Result<Value, String> {
    store::save_notes(&file_path, notes)?;
    Ok(json!({ "success": true }))
}

// --- Favourites (ported from the /api/favourites routes) ---

/// GET /api/favourites -> `{ favourites: [...] }`.
#[tauri::command]
pub fn get_favourites() -> Value {
    json!({ "favourites": store::favourites() })
}

/// POST /api/favourites -> `{ success, favourites }`.
#[tauri::command]
pub fn add_favourite(path: String) -> Result<Value, String> {
    let favourites = store::add_favourite(&path)?;
    Ok(json!({ "success": true, "favourites": favourites }))
}

/// DELETE /api/favourites -> `{ success, favourites }`.
#[tauri::command]
pub fn remove_favourite(path: String) -> Result<Value, String> {
    let favourites = store::remove_favourite(&path)?;
    Ok(json!({ "success": true, "favourites": favourites }))
}

/// GET /api/projects/:id/favourite-files -> `{ files: [...] }`.
/// Resolves favourited paths that live under the project into file items.
#[tauri::command]
pub async fn get_favourite_files(project_id: String) -> Result<Value, String> {
    run_blocking(move || {
        let root = store::project_path(&project_id).ok_or("Project not found")?;
        let root_str = root.to_string_lossy().to_string();
        let sep = std::path::MAIN_SEPARATOR;

        let mut items = Vec::new();
        for path in store::favourites() {
            let under = path == root_str || path.starts_with(&format!("{root_str}{sep}"));
            if !under {
                continue;
            }
            match scan::file_item(Path::new(&path)) {
                Some(item) => items.push(item),
                None => continue,
            }
        }
        // Most recently modified first.
        items.sort_by(|a, b| {
            b.modified
                .partial_cmp(&a.modified)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        Ok(json!({ "files": items }))
    })
    .await
}

/// GET /api/projects/:id/watched-files -> `{ watches: [{ watch, files }] }`.
///
/// Resolves the project's active watches (global watches minus per-project
/// disables plus per-project enables, then project-specific watches), then for
/// each one lists the document files in its subfolder matching its glob
/// pattern. Mirrors the Python get_watched_files.
#[tauri::command]
pub async fn get_watched_files(project_id: String) -> Result<Value, String> {
    use crate::engine::types::TEXT_EXTENSIONS;
    use glob::{MatchOptions, Pattern};

    run_blocking(move || {
        let sub = store::subproject(&project_id).ok_or("Project not found")?;
        let root = PathBuf::from(sub.get("path").and_then(|v| v.as_str()).ok_or("Project has no path")?);

        // String set from a subproject array field (disabled_watches / enabled_watches).
        let id_set = |key: &str| -> std::collections::HashSet<String> {
            sub.get(key)
                .and_then(|v| v.as_array())
                .map(|a| a.iter().filter_map(|v| v.as_str().map(String::from)).collect())
                .unwrap_or_default()
        };
        let disabled = id_set("disabled_watches");
        let enabled_over = id_set("enabled_watches");

        // Resolve active watches.
        let mut active: Vec<Value> = Vec::new();
        for gw in store::global_watches() {
            let wid = gw.get("id").and_then(|v| v.as_str()).unwrap_or("");
            if disabled.contains(wid) {
                continue;
            }
            let globally_on = gw.get("enabled").and_then(|v| v.as_bool()).unwrap_or(false);
            if globally_on || enabled_over.contains(wid) {
                active.push(gw);
            }
        }
        if let Some(pws) = sub.get("watches").and_then(|v| v.as_array()) {
            for pw in pws {
                // Project watches default to enabled unless explicitly false.
                if pw.get("enabled").and_then(|v| v.as_bool()).unwrap_or(true) {
                    active.push(pw.clone());
                }
            }
        }

        // Case-insensitive fnmatch, matching Python's fnmatch on macOS.
        let opts = MatchOptions { case_sensitive: false, ..Default::default() };

        let mut results = Vec::new();
        for watch in active {
            let subfolder = watch.get("subfolder").and_then(|v| v.as_str()).unwrap_or("");
            let subfolder = subfolder.trim_matches('/');
            let pattern = watch.get("pattern").and_then(|v| v.as_str()).unwrap_or("*");
            let search = if subfolder.is_empty() { root.clone() } else { root.join(subfolder) };

            let mut files: Vec<crate::engine::types::FileItem> = Vec::new();
            if search.is_dir() {
                let pat = Pattern::new(pattern).ok();
                if let Ok(rd) = std::fs::read_dir(&search) {
                    for entry in rd.flatten() {
                        let path = entry.path();
                        let Ok(meta) = entry.metadata() else { continue };
                        if !meta.is_file() {
                            continue;
                        }
                        let name = entry.file_name().to_string_lossy().to_string();
                        let ext = path
                            .extension()
                            .and_then(|e| e.to_str())
                            .map(|e| format!(".{}", e.to_lowercase()))
                            .unwrap_or_default();
                        if !TEXT_EXTENSIONS.contains(&ext.as_str()) {
                            continue;
                        }
                        let matches = pat.as_ref().map(|p| p.matches_with(&name, opts)).unwrap_or(false);
                        if !matches {
                            continue;
                        }
                        if let Some(item) = scan::file_item(&path) {
                            files.push(item);
                        }
                    }
                }
                // Newest first.
                files.sort_by(|a, b| {
                    b.modified.partial_cmp(&a.modified).unwrap_or(std::cmp::Ordering::Equal)
                });
            }

            results.push(json!({ "watch": watch, "files": files }));
        }

        Ok(json!({ "watches": results }))
    })
    .await
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

/// Watch the given project's folder for live changes, replacing any previous
/// watch. The frontend calls this when the open project changes; fs changes
/// then arrive as `fs-change` events and refresh the tree.
#[tauri::command]
pub fn watch_project(
    project_id: String,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<EngineStatus, String> {
    let root = store::project_path(&project_id).ok_or("Project not found")?;
    state.watch_only(&app, root).map_err(|e| e.to_string())?;
    Ok(state.status())
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
