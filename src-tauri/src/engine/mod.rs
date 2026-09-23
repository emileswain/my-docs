//! The file engine: scanning, caching, watching and parsing.
//!
//! Everything performance-sensitive that used to live in the Python Flask
//! server lives here. The Tauri commands in `crate::commands` are thin wrappers
//! over these modules.

pub mod cache;
pub mod parse;
pub mod scan;
pub mod types;
pub mod watch;
