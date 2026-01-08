use std::env;
use tauri::{AppHandle, Emitter, Manager};

// ✅ 1. Define the command so the macro can find it
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Helper to process deep links
fn handle_deep_link(app: &AppHandle, url: String) {
    println!("Deep link received: {}", url);
    // Emit to frontend
    let _ = app.emit("deep-link-received", url);

    // Bring window to front
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.show();
        let _ = w.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            {
                // register single-instance as early as possible
                app.handle()
                    .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
                        println!("Second instance triggered: {:?}", argv);
                        // focus existing window, forward deep link, etc.
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }))?;
            }
            Ok(())
        })
        // then other plugins
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        // .plugin(tauri_plugin_deep_link::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
