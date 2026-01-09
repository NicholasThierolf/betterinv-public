// src-tauri/src/main.rs
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs;
use std::fs::File;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::UNIX_EPOCH;

use tauri::{Emitter, Manager, State};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;

use zip::ZipArchive;

const PUBLIC_SERVER_URL: &str = env!("PUBLIC_SERVER_URL");

struct SidecarConnection {
    stdin: Mutex<Option<CommandChild>>,
}

fn append_log(log_path: &Path, line: &str) {
    if let Ok(mut f) = OpenOptions::new().create(true).append(true).open(log_path) {
        let _ = writeln!(f, "{line}");
    }
}

fn append_app_log(app_log: &Path, line: &str) {
    if let Ok(mut f) = OpenOptions::new().create(true).append(true).open(app_log) {
        let _ = writeln!(f, "{line}");
    }
}

#[tauri::command]
fn send_to_sidecar(state: State<'_, SidecarConnection>, message: String) -> Result<(), String> {
    let mut child_guard = state
        .stdin
        .lock()
        .map_err(|_| "Failed to lock sidecar handle")?;

    if let Some(child) = child_guard.as_mut() {
        let data = format!("{}\n", message);

        // If node already exited, writing will fail (e.g. Windows os error 232).
        if let Err(e) = child.write(data.as_bytes()) {
            *child_guard = None;
            return Err(format!(
                "Backend is not running anymore (stdin write failed): {e}"
            ));
        }

        Ok(())
    } else {
        Err("Backend process not running or stdin unavailable".into())
    }
}

#[tauri::command]
fn backend_status(state: State<'_, SidecarConnection>) -> Result<bool, String> {
    let guard = state
        .stdin
        .lock()
        .map_err(|_| "Failed to lock sidecar handle")?;
    Ok(guard.is_some())
}

/// Base folder containing `backend.zip` in dev/build.
///
/// Dev: `<CARGO_MANIFEST_DIR>` (src-tauri/)
/// Build: `resource_dir()` (and sometimes `resource_dir()/resources` depending on config/layout)
fn resources_base_dir(app: &tauri::App) -> Result<PathBuf, Box<dyn std::error::Error>> {
    if cfg!(debug_assertions) {
        return Ok(PathBuf::from(env!("CARGO_MANIFEST_DIR")));
    }

    let rd = app.path().resource_dir()?;

    // If your bundle.resources used a "resources/..." prefix, the runtime layout may be nested.
    let prefixed = rd.join("resources");
    if prefixed.exists() {
        Ok(prefixed)
    } else {
        Ok(rd)
    }
}

/// Read a file's "last modified" timestamp as unix seconds.
/// If it can't be read, return 0.
fn mtime_unix_seconds(path: &Path) -> u64 {
    fs::metadata(path)
        .and_then(|m| m.modified())
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

/// Extract a zip file into `dest_dir`.
/// (We do NOT delete `dest_dir` here to avoid Windows file-lock issues in dev.
///  We extract into a versioned dir, so the destination should be new.)
fn extract_zip(zip_path: &Path, dest_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    fs::create_dir_all(dest_dir)?;

    let zip_file = File::open(zip_path)?;
    let mut archive = ZipArchive::new(zip_file)?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i)?;

        let outpath = match file.enclosed_name() {
            Some(p) => dest_dir.join(p),
            None => continue, // skip suspicious paths
        };

        if file.is_dir() {
            fs::create_dir_all(&outpath)?;
            continue;
        }

        if let Some(parent) = outpath.parent() {
            fs::create_dir_all(parent)?;
        }

        let mut outfile = File::create(&outpath)?;
        std::io::copy(&mut file, &mut outfile)?;
    }

    Ok(())
}

/// Ensure backend runtime is extracted and return (backend_dir, entry_js).
///
/// We extract into: app_local_data_dir()/betterinv-backend-runtime-<zip_mtime>
/// and reuse if already extracted.
fn ensure_backend_runtime(
    app: &tauri::App,
    backend_zip: &Path,
) -> Result<(PathBuf, PathBuf), Box<dyn std::error::Error>> {
    let data_dir = app.path().app_local_data_dir()?;
    fs::create_dir_all(&data_dir)?;

    let zip_mtime = mtime_unix_seconds(backend_zip);
    let runtime_dir = data_dir.join(format!("betterinv-backend-runtime-{}", zip_mtime));

    // If this version already exists and looks valid, reuse it.
    let entry_js = runtime_dir.join("dist-backend").join("index.js");
    if runtime_dir.exists() && entry_js.exists() {
        return Ok((runtime_dir, entry_js));
    }

    // Fresh extract into a new folder (no delete of old one -> avoids AccessDenied).
    extract_zip(backend_zip, &runtime_dir)?;

    let entry_js = runtime_dir.join("dist-backend").join("index.js");
    if !entry_js.exists() {
        return Err(format!(
            "Extracted backend entry JS not found at: {}",
            entry_js.display()
        )
        .into());
    }

    Ok((runtime_dir, entry_js))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
            // focus existing window, forward deep link, etc.
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.show();
                let _ = w.set_focus();
            }
        }))
        .plugin(tauri_plugin_deep_link::init())
        .manage(SidecarConnection {
            stdin: Mutex::new(None),
        })
        .setup(|app| {
            // App log (works even in release with windows_subsystem=windows)
            let log_dir = app.path().app_local_data_dir()?;
            fs::create_dir_all(&log_dir)?;
            let app_log = log_dir.join("app.log");

            append_app_log(&app_log, "=== app setup start ===");
            append_app_log(
                &app_log,
                &format!("resource_dir: {:?}", app.path().resource_dir()),
            );

            let result: Result<(), Box<dyn std::error::Error>> = (|| {
                let base = resources_base_dir(app)?;
                append_app_log(&app_log, &format!("resources_base_dir: {}", base.display()));

                let backend_zip = base.join("backend.zip");
                if !backend_zip.exists() {
                    return Err(format!("backend.zip not found at: {}", backend_zip.display()).into());
                }

                let (backend_dir, entry_js) = ensure_backend_runtime(app, &backend_zip)?;

                // Backend log
                let log_path = log_dir.join("backend.log");
                append_log(&log_path, "=== backend spawn ===");
                append_log(&log_path, &format!("backend_zip: {}", backend_zip.display()));
                append_log(&log_path, &format!("backend_dir: {}", backend_dir.display()));
                append_log(&log_path, &format!("entry_js: {}", entry_js.display()));

                // Spawn node via externalBin-resolved sidecar "node"
                let mut cmd = app.shell().sidecar("node").map_err(|e| {
                    let msg = format!("Failed to resolve node sidecar: {e}");
                    append_app_log(&app_log, &msg);
                    msg
                })?;

                cmd = cmd
                    .args([entry_js.to_string_lossy().to_string()])
                    .current_dir(backend_dir.to_string_lossy().to_string());

                cmd = cmd.env("PUBLIC_SERVER_URL", PUBLIC_SERVER_URL);

                let (mut rx, child) = cmd.spawn().map_err(|e| {
                    let msg = format!("Failed to spawn node sidecar: {e}");
                    append_app_log(&app_log, &msg);
                    msg
                })?;

                // Store handle for stdin writes
                {
                    let connection = app.state::<SidecarConnection>();
                    let mut guard = connection
                        .stdin
                        .lock()
                        .map_err(|_| "Failed to lock stdin")?;
                    *guard = Some(child);
                }

                // Forward stdout/stderr to file + frontend events
                let app_handle = app.handle().clone();
                let log_path_clone = log_path.clone();

                tauri::async_runtime::spawn(async move {
                    while let Some(event) = rx.recv().await {
                        match event {
                            CommandEvent::Stdout(bytes) => {
                                let line = String::from_utf8_lossy(&bytes).to_string();
                                append_log(&log_path_clone, &format!("[stdout] {line}"));
                                let _ = app_handle.emit("node-message", line);
                            }
                            CommandEvent::Stderr(bytes) => {
                                let line = String::from_utf8_lossy(&bytes).to_string();
                                append_log(&log_path_clone, &format!("[stderr] {line}"));
                                let _ = app_handle.emit("node-error", line);
                            }
                            CommandEvent::Terminated(payload) => {
                                append_log(&log_path_clone, &format!("[exit] {payload:?}"));

                                // Clear stale handle
                                let state = app_handle.state::<SidecarConnection>();
                                if let Ok(mut guard) = state.stdin.lock() {
                                    *guard = None;
                                }

                                let _ = app_handle.emit("node-exit", format!("{payload:?}"));
                            }
                            other => {
                                append_log(&log_path_clone, &format!("[event] {other:?}"));
                            }
                        }
                    }
                });

                Ok(())
            })();

            if let Err(e) = result {
                append_app_log(&app_log, &format!("SETUP ERROR: {e}"));
                return Err(e);
            }

            append_app_log(&app_log, "=== app setup done ===");
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Keep everything in a tight scope so borrows drop in the right order.
                {
                    if let Ok(mut guard) = window
                        .app_handle()
                        .state::<SidecarConnection>()
                        .stdin
                        .lock()
                    {
                        *guard = None;
                    }
                } // guard dropped here
            }
        })
        .invoke_handler(tauri::generate_handler![send_to_sidecar, backend_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
