//! Native filesystem watching. Replaces Python `watchdog` + the Flask SSE
//! `/api/events` stream.
//!
//! When files change, we (1) invalidate the affected cache entries and
//! (2) `emit` a `fs-change` event to the frontend. The React side listens with
//! `listen('fs-change', ...)` instead of subscribing to an EventSource — same
//! push model, no HTTP.

use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::Duration;

use notify::{RecursiveMode, Watcher as _};
use notify_debouncer_full::{new_debouncer, DebounceEventResult, Debouncer, FileIdMap};
use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::engine::cache::ScanCache;

/// Payload sent to the frontend on every debounced batch of fs changes.
#[derive(Debug, Clone, Serialize)]
pub struct FsChange {
    pub paths: Vec<String>,
}

/// Owns the live watcher. Dropping it stops watching.
pub struct Watcher {
    debouncer: Debouncer<notify::RecommendedWatcher, FileIdMap>,
    roots: Vec<PathBuf>,
}

impl Watcher {
    /// Start watching `roots` recursively, emitting `fs-change` on `app`.
    pub fn start(
        app: AppHandle,
        cache: Arc<ScanCache>,
        roots: Vec<PathBuf>,
    ) -> anyhow::Result<Self> {
        let cache_cb = cache.clone();
        let app_cb = app.clone();

        let mut debouncer = new_debouncer(
            Duration::from_millis(300),
            None,
            move |result: DebounceEventResult| match result {
                Ok(events) => {
                    let mut paths: Vec<String> = Vec::new();
                    for event in events {
                        for path in &event.paths {
                            // Invalidate the changed file's parent folder listing.
                            if let Some(parent) = path.parent() {
                                cache_cb.invalidate(&parent.to_string_lossy());
                            }
                            paths.push(path.to_string_lossy().to_string());
                        }
                    }
                    paths.sort();
                    paths.dedup();
                    let _ = app_cb.emit("fs-change", FsChange { paths });
                }
                Err(errors) => {
                    for e in errors {
                        eprintln!("[watch] error: {e:?}");
                    }
                }
            },
        )?;

        for root in &roots {
            if root.exists() {
                debouncer
                    .watcher()
                    .watch(root, RecursiveMode::Recursive)?;
            }
        }

        Ok(Self { debouncer, roots })
    }

    /// Add a new root to the live watch set.
    pub fn add_root(&mut self, root: &Path) -> anyhow::Result<()> {
        if root.exists() {
            self.debouncer
                .watcher()
                .watch(root, RecursiveMode::Recursive)?;
            self.roots.push(root.to_path_buf());
        }
        Ok(())
    }
}
