// RHOBEAR Designs — desktop shell (Tauri v2).
//
// Loads the prebuilt editor (../dist) offline, branded as "RHOBEAR Designs".
// Window close hides to the red-bear tray; "Quit" from the tray exits.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};

const WINDOW_LABEL: &str = "main";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Tray menu: re-open the editor, or quit.
            let show_item =
                MenuItem::with_id(app, "show", "Open RHOBEAR Designs", true, None::<&str>)?;
            let quit_item =
                MenuItem::with_id(app, "quit", "Quit RHOBEAR Designs", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            // Use the bundle window icon (the red constellation bear) for the tray.
            let icon = app
                .default_window_icon()
                .cloned()
                .expect("missing default window icon");

            TrayIconBuilder::with_id("main")
                .icon(icon)
                .tooltip("RHOBEAR Designs")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => show_and_focus(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_and_focus(tray.app_handle());
                    }
                })
                .build(app)?;

            Ok(())
        })
        // Close (×) hides to tray instead of quitting, so the editor keeps
        // running in the background and can be re-opened from the tray.
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == WINDOW_LABEL {
                    let _ = window.hide();
                    api.prevent_close();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running RHOBEAR Designs");
}

fn show_and_focus(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window(WINDOW_LABEL) {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}
