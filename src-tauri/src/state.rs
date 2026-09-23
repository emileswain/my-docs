//! Process-wide engine state, managed by Tauri and injected into commands.

use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::Instant;

use tauri::AppHandle;

use crate::engine::cache::ScanCache;
use crate::engine::types::EngineStatus;
use crate::engine::watch::Watcher;

pub struct AppState {
    pub cache: Arc<ScanCache>,
    /// The live filesystem watcher. `None` before the first start.
    pub watcher: Mutex<Option<Watcher>>,
    /// Roots the engine watches / serves.
    pub roots: Mutex<Vec<PathBuf>>,
    /// When the engine last (re)started, for uptime reporting.
    pub started_at: Mutex<Instant>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            cache: Arc::new(ScanCache::new()),
            watcher: Mutex::new(None),
            roots: Mutex::new(Vec::new()),
            started_at: Mutex::new(Instant::now()),
        }
    }

    /// (Re)initialize the watcher over the current root set. Clears the cache
    /// and resets uptime — this is what the "Restart engine" menu item calls.
    pub fn restart(&self, app: &AppHandle) -> anyhow::Result<()> {
        self.cache.clear();
        let roots = self.roots.lock().unwrap().clone();
        let watcher = Watcher::start(app.clone(), self.cache.clone(), roots)?;
        *self.watcher.lock().unwrap() = Some(watcher);
        *self.started_at.lock().unwrap() = Instant::now();
        Ok(())
    }

    /// Watch exactly one root (the currently-open project), replacing whatever
    /// was watched before. Keeps the watch set small — we only need live events
    /// for the project the user is looking at, mirroring the Python
    /// per-project watcher. Clears the cache since the old roots are no longer
    /// watched (and thus no longer invalidated).
    pub fn watch_only(&self, app: &AppHandle, root: PathBuf) -> anyhow::Result<()> {
        // No-op if we're already watching exactly this root.
        {
            let roots = self.roots.lock().unwrap();
            if roots.len() == 1 && roots[0] == root {
                return Ok(());
            }
        }
        self.cache.clear();
        *self.roots.lock().unwrap() = vec![root.clone()];
        let watcher = Watcher::start(app.clone(), self.cache.clone(), vec![root])?;
        *self.watcher.lock().unwrap() = Some(watcher);
        *self.started_at.lock().unwrap() = Instant::now();
        Ok(())
    }

    pub fn add_root(&self, app: &AppHandle, root: PathBuf) -> anyhow::Result<()> {
        {
            let mut roots = self.roots.lock().unwrap();
            if roots.contains(&root) {
                return Ok(());
            }
            roots.push(root.clone());
        }
        let mut guard = self.watcher.lock().unwrap();
        match guard.as_mut() {
            Some(w) => w.add_root(&root)?,
            None => {
                let roots = self.roots.lock().unwrap().clone();
                *guard = Some(Watcher::start(app.clone(), self.cache.clone(), roots)?);
            }
        }
        Ok(())
    }

    pub fn status(&self) -> EngineStatus {
        let running = self.watcher.lock().unwrap().is_some();
        let watched_roots = self.roots.lock().unwrap().len();
        let uptime_secs = self.started_at.lock().unwrap().elapsed().as_secs();
        EngineStatus {
            running,
            watched_roots,
            uptime_secs,
            cache_entries: self.cache.len(),
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}
