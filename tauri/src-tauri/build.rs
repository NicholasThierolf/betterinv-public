fn main() {
    // Load .env if present (local dev)
    dotenvy::dotenv().ok();

    // Forward env var to Rust compiler
    if let Ok(val) = std::env::var("PUBLIC_SERVER_URL") {
        println!("cargo:rustc-env=PUBLIC_SERVER_URL={val}");
    }

    tauri_build::build()
}
