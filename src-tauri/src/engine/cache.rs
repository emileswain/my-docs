//! Concurrent in-memory cache of directory listings.
//!
//! Keyed by absolute path. The watcher invalidates entries when the underlying
//! folder changes, so reads are cheap and always fresh. `DashMap` gives us
//! lock-free-ish concurrent access without wrapping the whole thing in a Mutex.

use dashmap::DashMap;

use crate::engine::types::DirEntry;

#[derive(Default)]
pub struct ScanCache {
    entries: DashMap<String, Vec<DirEntry>>,
}

impl ScanCache {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn get(&self, path: &str) -> Option<Vec<DirEntry>> {
        self.entries.get(path).map(|v| v.clone())
    }

    pub fn put(&self, path: String, entries: Vec<DirEntry>) {
        self.entries.insert(path, entries);
    }

    /// Drop a single path (e.g. the folder that just changed).
    pub fn invalidate(&self, path: &str) {
        self.entries.remove(path);
    }

    /// Drop everything (used on engine restart).
    pub fn clear(&self) {
        self.entries.clear();
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }
}
