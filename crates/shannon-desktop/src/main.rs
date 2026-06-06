//! Shannon Code desktop application entry point.
//!
//! Uses Tauri v2 to wrap the Shannon AI assistant in a native desktop window
//! with a web-based chat UI. The Rust backend handles LLM communication,
//! tool execution, and state management via Tauri IPC commands.

#[cfg(feature = "tauri")]
fn main() {
    use shannon_desktop::commands;
    use tauri::{Emitter, Manager};
    use tauri::{
        menu::{MenuBuilder, MenuItemBuilder},
        tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    };
    use tauri_plugin_updater::UpdaterExt;

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::send_message,
            commands::get_conversation,
            commands::list_models,
            commands::get_status,
            commands::cancel_query,
            commands::list_tools,
            commands::configure,
            commands::switch_provider,
            commands::get_config,
            commands::new_session,
            commands::list_sessions,
            commands::search_sessions,
            commands::load_session,
            commands::switch_session,
            commands::delete_session,
            commands::rename_session,
            commands::duplicate_session,
            commands::request_permission,
            commands::respond_permission,
            commands::get_file_diff,
            commands::apply_diff,
            commands::add_mcp_server,
            commands::remove_mcp_server,
            commands::restart_mcp_server,
            commands::get_mcp_server_config,
            commands::list_mcp_servers,
            commands::list_skills,
            commands::get_skill_detail,
            commands::start_background_task,
            commands::get_background_tasks,
            commands::cancel_background_task,
        ])
        .setup(|app| {
            let state = commands::AppState::new();
            app.manage(state);

            // Register global shortcut handlers
            use tauri_plugin_global_shortcut::GlobalShortcutExt;

            // Show/hide window shortcut
            let _ = app
                .global_shortcut()
                .on_shortcut("show-hide", |app, _shortcut_id, _| {
                    if let Some(webview_window) = app.get_webview_window("main") {
                        let _ = if webview_window.is_visible().unwrap_or(false) {
                            webview_window.hide()
                        } else {
                            webview_window.show()
                        };
                        let _ = webview_window.set_focus();
                    }
                });

            // New session shortcut
            let _ = app
                .global_shortcut()
                .on_shortcut("new-session", |app, _shortcut_id, _| {
                    let _ = app.emit("new-session", ());
                });

            // Focus input shortcut
            let _ = app
                .global_shortcut()
                .on_shortcut("focus-input", |app, _shortcut_id, _| {
                    let _ = app.emit("focus-input", ());
                });

            // System tray configuration

            // System tray configuration
            let show_item = MenuItemBuilder::with_id("show", "Show Shannon").build(app)?;
            let new_session_item =
                MenuItemBuilder::with_id("new-session", "New Session").build(app)?;
            let quit_item = MenuItemBuilder::with_id("quit", "Quit").build(app)?;

            let menu = MenuBuilder::new(app)
                .items(&[&show_item, &new_session_item, &quit_item])
                .build()?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(move |app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(webview_window) = app.get_webview_window("main") {
                            let _ = webview_window.unminimize();
                            let _ = webview_window.show();
                            let _ = webview_window.set_focus();
                        }
                    }
                    "new-session" => {
                        // Trigger new session via event
                        let _ = app.emit("new-session", ());
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => (),
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(webview_window) = app.get_webview_window("main") {
                            let _ = webview_window.unminimize();
                            let _ = webview_window.show();
                            let _ = webview_window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // Auto-update check on startup
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Ok(Some(update_info)) = handle.updater()?.check().await {
                    println!(
                        "Update available: {} from {}",
                        update_info.version,
                        update_info
                            .date
                            .map(|d| d.to_string())
                            .unwrap_or_else(|| "unknown".to_string())
                    );
                    if let Some(body) = update_info.body {
                        println!("Release notes: {}", body);
                    }
                    // Note: Update installation UI notification will be handled by worker-2
                } else {
                    println!("No updates available or update check failed");
                }
                Ok::<(), tauri_plugin_updater::Error>(())
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(not(feature = "tauri"))]
fn main() {
    eprintln!("Shannon Desktop requires the `tauri` feature.");
    eprintln!("Build with: cargo build -p shannon-desktop --features tauri");
    std::process::exit(1);
}
