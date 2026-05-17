use crate::models::ReadingProgress;
use crate::AppState;
use rusqlite::params;
use tauri::State;

#[tauri::command]
pub async fn get_progress(book_id: i64, state: State<'_, AppState>) -> Result<ReadingProgress, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Ensure a progress row exists
    conn.execute(
        "INSERT OR IGNORE INTO reading_progress (book_id) VALUES (?1)",
        params![book_id],
    )
    .map_err(|e| e.to_string())?;

    conn.query_row(
        "SELECT id, book_id, current_page, scroll_offset, zoom_level, last_updated
         FROM reading_progress WHERE book_id = ?1",
        params![book_id],
        |row| {
            Ok(ReadingProgress {
                id: row.get(0)?,
                book_id: row.get(1)?,
                current_page: row.get(2)?,
                scroll_offset: row.get(3)?,
                zoom_level: row.get(4)?,
                last_updated: row.get(5)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_progress(
    book_id: i64,
    current_page: i32,
    scroll_offset: f64,
    zoom_level: f64,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO reading_progress (book_id, current_page, scroll_offset, zoom_level, last_updated)
         VALUES (?1, ?2, ?3, ?4, datetime('now'))
         ON CONFLICT(book_id) DO UPDATE SET
             current_page = excluded.current_page,
             scroll_offset = excluded.scroll_offset,
             zoom_level = excluded.zoom_level,
             last_updated = excluded.last_updated",
        params![book_id, current_page, scroll_offset, zoom_level],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
