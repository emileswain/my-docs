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
