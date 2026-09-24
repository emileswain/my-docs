//! Native application menu bar (the macOS top bar).
//!
//! Items:
//!   - "Restart Engine": clears cache and re-arms the file watchers.
//!   - "Show my-docs": brings the window to the front.
//!   - "Status: …": a disabled item whose text reflects live engine health,
//!     refreshed by a background task in `lib.rs`.

use tauri::menu::{Menu, MenuBuilder, MenuItemBuilder, MenuItemKind, SubmenuBuilder};
use tauri::{AppHandle, Wry};

use crate::engine::types::EngineStatus;

pub const RESTART_ENGINE: &str = "restart_engine";
pub const SHOW_APP: &str = "show_app";
pub const STATUS: &str = "engine_status_label";
pub const COLLAPSE_ALL: &str = "collapse_all_folders";

/// Build the full menu bar.
pub fn build(app: &AppHandle) -> tauri::Result<Menu<Wry>> {
    let restart = MenuItemBuilder::with_id(RESTART_ENGINE, "Restart Engine")
        .accelerator("CmdOrCtrl+R")
        .build(app)?;
    let show = MenuItemBuilder::with_id(SHOW_APP, "Show my-docs").build(app)?;
    let status = MenuItemBuilder::with_id(STATUS, "Status: starting…")
        .enabled(false)
        .build(app)?;

    // macOS application menu (about / quit) — harmless no-op label on other OSes.
    let app_menu = SubmenuBuilder::new(app, "my-docs")
        .about(None)
        .separator()
        .quit()
        .build()?;

    let engine_menu = SubmenuBuilder::new(app, "Engine")
        .item(&restart)
        .item(&show)
        .separator()
        .item(&status)
        .build()?;

    let collapse_all = MenuItemBuilder::with_id(COLLAPSE_ALL, "Collapse All Folders")
        .accelerator("CmdOrCtrl+Shift+K")
        .build(app)?;
    let view_menu = SubmenuBuilder::new(app, "View")
        .item(&collapse_all)
        .build()?;

    MenuBuilder::new(app)
        .item(&app_menu)
        .item(&engine_menu)
        .item(&view_menu)
        .build()
}

/// Human-readable one-liner for the status menu item.
pub fn status_label(s: &EngineStatus) -> String {
    if s.running {
        format!(
            "Status: running · {} root(s) · {} cached · up {}s",
            s.watched_roots, s.cache_entries, s.uptime_secs
        )
    } else {
        "Status: stopped".to_string()
    }
}

/// Update the disabled status item's text in place.
pub fn set_status_text(app: &AppHandle, text: &str) {
    if let Some(menu) = app.menu() {
        if let Some(MenuItemKind::MenuItem(item)) = menu.get(STATUS) {
            let _ = item.set_text(text);
        }
    }
}
