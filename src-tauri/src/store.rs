//! Reads the on-disk data the Python app owns: `~/.fileviewer/projects.json`
//! and `~/.fileviewer/settings.json`. Same files, same shapes — so the Rust
//! app shows the user's existing groups/settings with no migration.
//!
//! This is the READ half of the CRUD routes. Writes (create/update/delete
//! group, subproject, watch, settings) are still TODO ports.

use std::collections::HashSet;
use std::path::PathBuf;

use serde_json::{json, Value};

/// `~/.fileviewer`
pub fn config_dir() -> PathBuf {
    dirs_home().join(".fileviewer")
}

fn dirs_home() -> PathBuf {
    std::env::var_os("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("/"))
}

fn read_json(path: PathBuf) -> Option<Value> {
    let text = std::fs::read_to_string(path).ok()?;
    serde_json::from_str(&text).ok()
}

/// The `groups` array from projects.json (already in the frontend's shape).
pub fn groups() -> Vec<Value> {
    let data = read_json(config_dir().join("projects.json")).unwrap_or(json!({}));
    data.get("groups")
        .and_then(|g| g.as_array())
        .cloned()
        .unwrap_or_default()
}

/// The merged settings object from settings.json (with default keys filled in).
pub fn settings() -> Value {
    let mut s = read_json(config_dir().join("settings.json")).unwrap_or(json!({}));
    let obj = s.as_object_mut();
    if let Some(map) = obj {
        map.entry("excluded_folders").or_insert(json!(default_excluded()));
        map.entry("watches").or_insert(json!([]));
    }
    s
}

fn default_excluded() -> Vec<&'static str> {
    vec![
        "node_modules", ".git", "__pycache__", ".venv", "venv", "dist", "build",
        ".next", ".nuxt", "target", "out", ".gradle", ".idea", ".vscode",
        "coverage", ".cache", ".parcel-cache", ".turbo", "obj", "bin",
    ]
}

/// Folder names to skip while browsing, from settings.
pub fn excluded_folders() -> HashSet<String> {
    settings()
        .get("excluded_folders")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default()
}

/// Resolve a project identifier (id or slug) to its folder path, searching all
/// groups' subprojects — mirrors `get_project` / `get_project_by_slug`.
pub fn project_path(identifier: &str) -> Option<PathBuf> {
    for group in groups() {
        let subs = group.get("subprojects").and_then(|s| s.as_array());
        if let Some(subs) = subs {
            for sp in subs {
                let id = sp.get("id").and_then(|v| v.as_str());
                let slug = sp.get("slug").and_then(|v| v.as_str());
                if id == Some(identifier) || slug == Some(identifier) {
                    return sp
                        .get("path")
                        .and_then(|v| v.as_str())
                        .map(PathBuf::from);
                }
            }
        }
    }
    None
}

// --- Favourites (read + write settings.json) ---

fn settings_path() -> PathBuf {
    config_dir().join("settings.json")
}

/// Load settings.json as a mutable object (empty object if missing/invalid).
fn load_settings_object() -> serde_json::Map<String, Value> {
    read_json(settings_path())
        .and_then(|v| v.as_object().cloned())
        .unwrap_or_default()
}

/// Write the settings object back, pretty-printed (2-space, matching Python's
/// json.dump(indent=2)). Creates ~/.fileviewer if needed.
fn save_settings_object(map: serde_json::Map<String, Value>) -> Result<(), String> {
    let dir = config_dir();
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let text = serde_json::to_string_pretty(&Value::Object(map)).map_err(|e| e.to_string())?;
    std::fs::write(settings_path(), text).map_err(|e| e.to_string())
}

/// The favourited file paths from settings.json.
pub fn favourites() -> Vec<String> {
    settings()
        .get("favourites")
        .and_then(|v| v.as_array())
        .map(|arr| arr.iter().filter_map(|v| v.as_str().map(String::from)).collect())
        .unwrap_or_default()
}

/// Add a path to favourites (idempotent); returns the new list.
pub fn add_favourite(path: &str) -> Result<Vec<String>, String> {
    let mut list = favourites();
    if !list.iter().any(|p| p == path) {
        list.push(path.to_string());
        persist_favourites(&list)?;
    }
    Ok(list)
}

/// Remove a path from favourites; returns the new list.
pub fn remove_favourite(path: &str) -> Result<Vec<String>, String> {
    let mut list = favourites();
    let before = list.len();
    list.retain(|p| p != path);
    if list.len() != before {
        persist_favourites(&list)?;
    }
    Ok(list)
}

fn persist_favourites(list: &[String]) -> Result<(), String> {
    let mut map = load_settings_object();
    map.insert("favourites".into(), json!(list));
    save_settings_object(map)
}

// --- Document notes (~/.fileviewer/notes/<sha256(path)[:16]>.json) ---

fn note_file(file_path: &str) -> PathBuf {
    use sha2::{Digest, Sha256};
    let digest = Sha256::digest(file_path.as_bytes());
    // First 8 bytes -> 16 hex chars, matching the Python key.
    let key: String = digest.iter().take(8).map(|b| format!("{b:02x}")).collect();
    config_dir().join("notes").join(format!("{key}.json"))
}

/// Notes JSON for a document path, or `{ "notes": [] }` when none exist.
pub fn get_notes(file_path: &str) -> Value {
    read_json(note_file(file_path)).unwrap_or_else(|| json!({ "notes": [] }))
}

/// Persist notes for a document path. Stores `{ notes, file_path }`.
pub fn save_notes(file_path: &str, notes: Value) -> Result<(), String> {
    let path = note_file(file_path);
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let payload = json!({ "notes": notes, "file_path": file_path });
    let text = serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())?;
    std::fs::write(path, text).map_err(|e| e.to_string())
}

/// The subproject JSON object for an id (or slug), searching all groups.
pub fn subproject(identifier: &str) -> Option<Value> {
    for group in groups() {
        if let Some(subs) = group.get("subprojects").and_then(|s| s.as_array()) {
            for sp in subs {
                let id = sp.get("id").and_then(|v| v.as_str());
                let slug = sp.get("slug").and_then(|v| v.as_str());
                if id == Some(identifier) || slug == Some(identifier) {
                    return Some(sp.clone());
                }
            }
        }
    }
    None
}

/// Global watches from settings.json.
pub fn global_watches() -> Vec<Value> {
    settings()
        .get("watches")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default()
}

fn persist_global_watches(watches: Vec<Value>) -> Result<(), String> {
    let mut map = load_settings_object();
    map.insert("watches".into(), Value::Array(watches));
    save_settings_object(map)
}

/// Add a global watch (assigns an id); returns the stored watch.
pub fn add_global_watch(mut watch: Value) -> Result<Value, String> {
    if watch.get("id").and_then(|v| v.as_str()).unwrap_or("").is_empty() {
        watch["id"] = json!(generate_id());
    }
    let mut watches = global_watches();
    watches.push(watch.clone());
    persist_global_watches(watches)?;
    Ok(watch)
}

/// Merge updates into a global watch.
pub fn update_global_watch(watch_id: &str, updates: Value) -> Result<(), String> {
    let mut watches = global_watches();
    let mut found = false;
    for w in watches.iter_mut() {
        if w.get("id").and_then(|v| v.as_str()) == Some(watch_id) {
            if let (Some(wobj), Some(uobj)) = (w.as_object_mut(), updates.as_object()) {
                for (k, v) in uobj {
                    wobj.insert(k.clone(), v.clone());
                }
            }
            found = true;
            break;
        }
    }
    if !found {
        return Err("Watch not found".into());
    }
    persist_global_watches(watches)
}

/// Delete a global watch.
pub fn delete_global_watch(watch_id: &str) -> Result<(), String> {
    let mut watches = global_watches();
    let before = watches.len();
    watches.retain(|w| w.get("id").and_then(|v| v.as_str()) != Some(watch_id));
    if watches.len() == before {
        return Err("Watch not found".into());
    }
    persist_global_watches(watches)
}

// --- Project watch CRUD (writes projects.json) ---

fn projects_path() -> PathBuf {
    config_dir().join("projects.json")
}

/// Short unique-ish id for a new watch (matches the app's short-id style).
fn generate_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    format!("w{nanos:x}")
}

fn load_projects() -> Value {
    read_json(projects_path()).unwrap_or_else(|| json!({ "version": 2, "groups": [] }))
}

fn save_projects(mut doc: Value) -> Result<(), String> {
    if let Some(obj) = doc.as_object_mut() {
        obj.entry("version").or_insert(json!(2));
    }
    std::fs::create_dir_all(config_dir()).map_err(|e| e.to_string())?;
    let text = serde_json::to_string_pretty(&doc).map_err(|e| e.to_string())?;
    std::fs::write(projects_path(), text).map_err(|e| e.to_string())
}

/// Run `f` against the mutable subproject object with `project_id`, then persist.
fn with_subproject<F, T>(project_id: &str, f: F) -> Result<T, String>
where
    F: FnOnce(&mut serde_json::Map<String, Value>) -> Result<T, String>,
{
    let mut doc = load_projects();
    let groups = doc
        .get_mut("groups")
        .and_then(|g| g.as_array_mut())
        .ok_or("No groups")?;
    for group in groups.iter_mut() {
        if let Some(subs) = group.get_mut("subprojects").and_then(|s| s.as_array_mut()) {
            for sp in subs.iter_mut() {
                if sp.get("id").and_then(|v| v.as_str()) == Some(project_id) {
                    let obj = sp.as_object_mut().ok_or("Bad subproject")?;
                    let result = f(obj)?;
                    save_projects(doc)?;
                    return Ok(result);
                }
            }
        }
    }
    Err("Project not found".into())
}

/// The project's own (project-specific) watches, for editing.
pub fn project_watches(project_id: &str) -> Vec<Value> {
    subproject(project_id)
        .and_then(|sp| sp.get("watches").and_then(|v| v.as_array()).cloned())
        .unwrap_or_default()
}

/// Add a project watch (assigns an id); returns the stored watch.
pub fn add_project_watch(project_id: &str, mut watch: Value) -> Result<Value, String> {
    if watch.get("id").and_then(|v| v.as_str()).unwrap_or("").is_empty() {
        watch["id"] = json!(generate_id());
    }
    let stored = watch.clone();
    with_subproject(project_id, move |sp| {
        let watches = sp.entry("watches").or_insert_with(|| json!([]));
        watches
            .as_array_mut()
            .ok_or("watches not an array")?
            .push(watch);
        Ok(())
    })?;
    Ok(stored)
}

/// Merge `updates` into a project watch.
pub fn update_project_watch(project_id: &str, watch_id: &str, updates: Value) -> Result<(), String> {
    with_subproject(project_id, move |sp| {
        let watches = sp
            .get_mut("watches")
            .and_then(|v| v.as_array_mut())
            .ok_or("Watch not found")?;
        for w in watches.iter_mut() {
            if w.get("id").and_then(|v| v.as_str()) == Some(watch_id) {
                if let (Some(wobj), Some(uobj)) = (w.as_object_mut(), updates.as_object()) {
                    for (k, v) in uobj {
                        wobj.insert(k.clone(), v.clone());
                    }
                }
                return Ok(());
            }
        }
        Err("Watch not found".into())
    })
}

/// Delete a project watch.
pub fn delete_project_watch(project_id: &str, watch_id: &str) -> Result<(), String> {
    with_subproject(project_id, move |sp| {
        let watches = sp
            .get_mut("watches")
            .and_then(|v| v.as_array_mut())
            .ok_or("Watch not found")?;
        let before = watches.len();
        watches.retain(|w| w.get("id").and_then(|v| v.as_str()) != Some(watch_id));
        if watches.len() == before {
            return Err("Watch not found".into());
        }
        Ok(())
    })
}

/// All project paths (for the "is this file inside a watched project?" check).
pub fn all_project_paths() -> Vec<String> {
    let mut out = Vec::new();
    for group in groups() {
        if let Some(subs) = group.get("subprojects").and_then(|s| s.as_array()) {
            for sp in subs {
                if let Some(p) = sp.get("path").and_then(|v| v.as_str()) {
                    out.push(p.to_string());
                }
            }
        }
    }
    out
}
