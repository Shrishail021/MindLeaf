mod models;
mod commands;

use rusqlite::Connection;
use std::sync::Mutex;

pub struct AppState {
    pub db: Mutex<Connection>,
}

fn init_db(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(include_str!("../../db/schema.sql"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // Resolve the app data directory for the DB file
            let app_data = app.path().app_data_dir()
                .expect("Failed to resolve AppData dir");
            std::fs::create_dir_all(&app_data).expect("Failed to create AppData dir");

            let db_path = app_data.join("mindleaf.db");
            let conn = Connection::open(&db_path)
                .expect("Failed to open SQLite database");

            // Enable WAL mode for better concurrent read performance
            conn.pragma_update(None, "journal_mode", "WAL").ok();
            conn.pragma_update(None, "foreign_keys", "ON").ok();

            init_db(&conn).expect("Failed to run DB migrations");

            app.manage(AppState {
                db: Mutex::new(conn),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Books
            commands::books::get_books,
            commands::books::add_book,
            commands::books::delete_book,
            commands::books::update_book_last_opened,
            commands::books::toggle_favorite,
            // Progress
            commands::progress::get_progress,
            commands::progress::update_progress,
            // Annotations
            commands::annotations::get_annotations,
            commands::annotations::save_annotation,
            commands::annotations::delete_annotation,
            commands::annotations::update_note_content,
            commands::annotations::get_all_highlights,
            // Stats + Bookmarks + Sessions
            commands::stats::get_bookmarks,
            commands::stats::toggle_bookmark,
            commands::stats::start_session,
            commands::stats::end_session,
            commands::stats::get_reading_stats,
            commands::stats::get_heatmap_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
