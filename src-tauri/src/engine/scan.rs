//! Folder scanning — the hot path. Replaces the Python `os.listdir` / watchdog
//! directory walks with a fast native walk.
//!
//! `list_dir` is a single-level browse (like the old `/api/.../browse` routes).
//! Results are cached by path in [`crate::engine::cache::ScanCache`] and
//! invalidated by the watcher when the folder changes.

use std::collections::HashSet;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::engine::types::{DirEntry, FileItem, ImageItem, IMAGE_EXTENSIONS, TEXT_EXTENSIONS};

/// True if `dir` directly contains at least one image file (non-recursive).
pub fn folder_has_images(dir: &Path) -> bool {
    let Ok(rd) = std::fs::read_dir(dir) else {
        return false;
    };
    for entry in rd.flatten() {
        let path = entry.path();
        if path.is_file() && IMAGE_EXTENSIONS.contains(&extension_of(&path).as_str()) {
            return true;
        }
    }
    false
}

/// List image files directly inside `dir`, sorted by name (case-insensitive).
pub fn list_images(dir: &Path) -> Vec<ImageItem> {
    let mut images: Vec<ImageItem> = Vec::new();
    if let Ok(rd) = std::fs::read_dir(dir) {
        for entry in rd.flatten() {
            let path = entry.path();
            let Ok(meta) = entry.metadata() else { continue };
            if !meta.is_file() {
                continue;
            }
            let ext = extension_of(&path);
            if !IMAGE_EXTENSIONS.contains(&ext.as_str()) {
                continue;
            }
            images.push(ImageItem {
                name: entry.file_name().to_string_lossy().to_string(),
                path: path.to_string_lossy().to_string(),
                extension: Some(ext),
                modified: Some(secs(meta.modified())),
            });
        }
    }
    images.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    images
}

/// Document extensions surfaced in the file tree (mirrors the Python browse
/// routes, which only list these — not images).
const DOC_EXTENSIONS: &[&str] = &[".md", ".json", ".yml", ".yaml", ".mmd", ".xml"];

fn secs(t: std::io::Result<SystemTime>) -> f64 {
    t.ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs_f64())
        .unwrap_or(0.0)
}

/// One level of a project browse: folders (minus excluded) + document files.
/// Folders sorted by name asc; files sorted by created-time desc — matching
/// `browse_project` in the Python server.
pub fn browse(dir: &Path, excluded: &HashSet<String>) -> std::io::Result<Vec<FileItem>> {
    let mut folders: Vec<FileItem> = Vec::new();
    let mut files: Vec<FileItem> = Vec::new();

    for entry in std::fs::read_dir(dir)? {
        let entry = match entry {
            Ok(e) => e,
            Err(_) => continue,
        };
        let name = entry.file_name().to_string_lossy().to_string();
        let path = entry.path();
        let meta = match entry.metadata() {
            Ok(m) => m,
            Err(_) => continue,
        };

        if meta.is_dir() {
            if excluded.contains(&name) {
                continue;
            }
            folders.push(FileItem {
                name,
                path: path.to_string_lossy().to_string(),
                kind: "folder".into(),
                extension: None,
                modified: None,
                created: None,
                has_images: Some(folder_has_images(&path)),
            });
        } else if meta.is_file() {
            let ext = extension_of(&path);
            if !DOC_EXTENSIONS.contains(&ext.as_str()) {
                continue;
            }
            files.push(FileItem {
                name,
                path: path.to_string_lossy().to_string(),
                kind: "file".into(),
                extension: Some(ext),
                modified: Some(secs(meta.modified())),
                created: Some(secs(meta.created())),
                has_images: None,
            });
        }
    }

    folders.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    files.sort_by(|a, b| {
        b.created
            .partial_cmp(&a.created)
            .unwrap_or(std::cmp::Ordering::Equal)
    });
    folders.extend(files);
    Ok(folders)
}

/// Build a `FileItem` for a single existing file (returns None for
/// directories or unreadable paths). Used by the favourites resolver.
pub fn file_item(path: &Path) -> Option<FileItem> {
    let meta = std::fs::metadata(path).ok()?;
    if !meta.is_file() {
        return None;
    }
    let name = path.file_name()?.to_string_lossy().to_string();
    Some(FileItem {
        name,
        path: path.to_string_lossy().to_string(),
        kind: "file".into(),
        extension: Some(extension_of(path)),
        modified: Some(secs(meta.modified())),
        created: Some(secs(meta.created())),
        has_images: None,
    })
}

/// Recursive browse: returns (cache keyed by folder path, root items).
/// Mirrors `browse_all_folders`.
pub fn browse_all(
    root: &Path,
    excluded: &HashSet<String>,
) -> (std::collections::HashMap<String, Vec<FileItem>>, Vec<FileItem>) {
    let mut cache: std::collections::HashMap<String, Vec<FileItem>> = std::collections::HashMap::new();
    scan_recursive(root, excluded, &mut cache);
    let root_items = cache
        .get(&root.to_string_lossy().to_string())
        .cloned()
        .unwrap_or_default();
    (cache, root_items)
}

fn scan_recursive(
    dir: &Path,
    excluded: &HashSet<String>,
    cache: &mut std::collections::HashMap<String, Vec<FileItem>>,
) {
    let items = match browse(dir, excluded) {
        Ok(items) => items,
        Err(_) => Vec::new(),
    };
    for item in &items {
        if item.kind == "folder" {
            scan_recursive(Path::new(&item.path), excluded, cache);
        }
    }
    cache.insert(dir.to_string_lossy().to_string(), items);
}

fn modified_ms(meta: &std::fs::Metadata) -> u64 {
    meta.modified()
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

fn extension_of(path: &Path) -> String {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|e| format!(".{}", e.to_lowercase()))
        .unwrap_or_default()
}

/// True if this extension is something the app renders (document or image).
pub fn is_supported(ext: &str) -> bool {
    TEXT_EXTENSIONS.contains(&ext) || IMAGE_EXTENSIONS.contains(&ext)
}

/// List the immediate children of `dir`. Directories are always included;
/// files are included only when their extension is supported. Hidden entries
/// (dotfiles) are skipped, matching the Python behaviour.
pub fn list_dir(dir: &Path) -> std::io::Result<Vec<DirEntry>> {
    let mut out = Vec::new();
    for entry in std::fs::read_dir(dir)? {
        let entry = entry?;
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }
        let path = entry.path();
        let meta = match entry.metadata() {
            Ok(m) => m,
            Err(_) => continue,
        };
        let is_dir = meta.is_dir();
        let extension = if is_dir { String::new() } else { extension_of(&path) };

        if !is_dir && !is_supported(&extension) {
            continue;
        }

        out.push(DirEntry {
            name,
            path: path.to_string_lossy().to_string(),
            is_dir,
            extension,
            size: if is_dir { 0 } else { meta.len() },
            modified_ms: modified_ms(&meta),
        });
    }

    // Directories first, then files, each alphabetical (case-insensitive).
    out.sort_by(|a, b| match (a.is_dir, b.is_dir) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });
    Ok(out)
}

