//! Tauri app entry point (library half; `main.rs` just calls `run`).
//!
//! Responsibilities:
//!   - own the [`AppState`] (cache + watcher + roots),
//!   - build and wire the native menu bar,
//!   - start the file engine on launch,
//!   - keep the menu status item refreshed.

mod commands;
mod engine;
mod file_types;
mod menu;
mod state;
mod store;

use std::time::Duration;

use tauri::{Emitter, Manager, WindowEvent};

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default();

    // Single-instance must be registered first: a second launch focuses the
    // existing window instead of opening a new one, and forwards any mydocs://
    // URL it was invoked with (this is how Windows/Linux deliver deep links to
    // a running app — macOS delivers them via the OS).
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.show();
                let _ = w.set_focus();
            }
            let urls: Vec<String> = argv
                .into_iter()
                .filter(|a| a.starts_with("mydocs://"))
                .collect();
            if !urls.is_empty() {
                let _ = app.emit("deep-link-urls", urls);
            }
        }));
    }

    builder
        // Restore window position/size/monitor from the last session so a dev
        // reload (or normal relaunch) reopens exactly where it was.
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            // data reads (ported from Flask routes)
            commands::get_groups,
            commands::get_settings,
            commands::get_file_type_groups,
            commands::browse_project,
            commands::browse_all,
            commands::get_file,
            commands::get_watched_files,
            commands::list_project_watches,
            commands::get_project_watches,
            commands::add_project_watch,
            commands::update_project_watch,
            commands::delete_project_watch,
            commands::get_branch_issue,
            commands::get_global_watches,
            commands::add_global_watch,
            commands::update_global_watch,
            commands::delete_global_watch,
            commands::list_folder_images,
            commands::get_favourites,
            commands::add_favourite,
            commands::remove_favourite,
            commands::get_favourite_files,
            commands::get_notes,
            commands::save_notes,
            // engine
            commands::list_dir,
            commands::read_file,
            commands::parse_file,
            commands::watch_project,
            commands::add_watch_root,
            commands::engine_status,
            commands::restart_engine,
        ])
        .setup(|app| {
            let handle = app.handle().clone();

            // Native menu bar.
            let menu = menu::build(&handle)?;
            app.set_menu(menu)?;

            // The window starts hidden (visible:false) so it never paints at the
            // default centered position; the window-state plugin has restored its
            // saved geometry by now, so showing it here avoids the flash/jump.
            //
            // We deliberately DO NOT call set_focus here, and the window is
            // configured focus:false, so a dev-reload relaunch shows the window
            // in place without stealing keyboard focus or jumping in front of
            // whatever the user is working on.
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.show();
            }

            // Start the engine (watchers arm even with zero roots; the frontend
            // adds roots via `add_watch_root`).
            {
                let state = handle.state::<AppState>();
                if let Err(e) = state.restart(&handle) {
                    eprintln!("[setup] engine start failed: {e:?}");
                }
            }

            // Refresh the menu status item every 2s.
            let status_handle = handle.clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    tokio::time::sleep(Duration::from_secs(2)).await;
                    let status = status_handle.state::<AppState>().status();
                    menu::set_status_text(&status_handle, &menu::status_label(&status));
                }
            });

            Ok(())
        })
        .on_menu_event(|app, event| match event.id().as_ref() {
            menu::RESTART_ENGINE => {
                let state = app.state::<AppState>();
                match state.restart(app) {
                    Ok(()) => menu::set_status_text(app, &menu::status_label(&state.status())),
                    Err(e) => eprintln!("[menu] restart failed: {e:?}"),
                }
            }
            menu::SHOW_APP => {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.show();
                    let _ = w.set_focus();
                }
            }
            menu::COLLAPSE_ALL => {
                let _ = app.emit("collapse-all-folders", ());
            }
            _ => {}
        })
        .on_window_event(|window, event| {
            // Keep the app alive in the background when the window is closed;
            // "Show my-docs" brings it back. (Comment out to quit on close.)
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
