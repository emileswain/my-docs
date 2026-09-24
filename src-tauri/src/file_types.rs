//! The definitive, extensible list of file-type groups shown in the file-tree
//! filter popup. Add groups/extensions here; the frontend renders them as
//! grouped checkboxes and hides tree files whose extension is disabled.
//!
//! Note: the tree currently surfaces document/text types; entries for types the
//! tree doesn't yet list (e.g. code, images) are harmless — their checkboxes
//! simply have no effect until those types are surfaced.

use serde_json::{json, Value};

/// Grouped file types: `[{ label, types: [".md", ...] }]`.
pub fn groups() -> Value {
    json!([
        {
            "label": "Documents",
            "types": [".md", ".txt", ".pdf", ".doc", ".docx", ".rtf", ".odt"]
        },
        {
            "label": "Data & Config",
            "types": [".json", ".yml", ".yaml", ".xml", ".toml", ".csv", ".ini", ".env"]
        },
        {
            "label": "Diagrams",
            "types": [".mmd", ".drawio", ".svg"]
        },
        {
            "label": "Images",
            "types": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".ico", ".avif"]
        },
        {
            "label": "Code",
            "types": [
                ".js", ".ts", ".tsx", ".jsx", ".py", ".rs", ".go", ".java",
                ".c", ".cpp", ".h", ".hpp", ".sh", ".rb", ".php", ".sql"
            ]
        }
    ])
}
