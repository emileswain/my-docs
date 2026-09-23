//! Shared data types that cross the Rust <-> frontend boundary.
//!
//! These are serialized to JSON by Tauri's IPC layer, so the field names here
//! are the field names the React frontend sees. Keep them aligned with the
//! shapes the old Flask API returned so the frontend migration stays small.

use serde::{Deserialize, Serialize};

/// Text file extensions rendered as documents (mirrors `TEXT_EXTENSIONS` in the
/// Python server).
pub const TEXT_EXTENSIONS: &[&str] = &[".md", ".json", ".yml", ".yaml", ".mmd", ".xml"];

/// Image file extensions surfaced via the folder image viewer (mirrors
/// `IMAGE_EXTENSIONS` in the Python server).
pub const IMAGE_EXTENSIONS: &[&str] = &[
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".ico", ".avif",
];

/// A single entry (file or directory) in a browsed folder.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DirEntry {
    pub name: String,
    /// Absolute path on disk.
    pub path: String,
    pub is_dir: bool,
    /// Lowercased extension including the dot (e.g. ".md"), empty for dirs.
    pub extension: String,
    /// Size in bytes (0 for directories).
    pub size: u64,
    /// Last-modified time, milliseconds since the Unix epoch.
    pub modified_ms: u64,
}

/// A file/folder entry in the shape the React frontend expects from the old
/// `/browse` routes: `{ name, path, type, extension?, modified?, created? }`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileItem {
    pub name: String,
    pub path: String,
    /// "file" or "folder".
    #[serde(rename = "type")]
    pub kind: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub extension: Option<String>,
    /// Modified time in seconds since epoch (float, matches Python st_mtime).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub modified: Option<f64>,
    /// Created time in seconds since epoch.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created: Option<f64>,
}

/// A node in a parsed document tree (headings, json keys, xml elements, ...).
///
/// This is the generic tree the Python `FileParser` produced. The `kind` field
/// tells the frontend how to render each node.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocNode {
    pub kind: String,
    pub label: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub children: Vec<DocNode>,
}

/// Health/status of the file engine, surfaced in the native menu bar.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineStatus {
    pub running: bool,
    /// Number of root folders currently being watched.
    pub watched_roots: usize,
    /// Seconds since the engine last (re)started.
    pub uptime_secs: u64,
    /// Number of entries currently held in the scan cache.
    pub cache_entries: usize,
}
