use crate::models::Book;
use crate::AppState;
use rusqlite::params;
use tauri::State;

#[tauri::command]
pub async fn get_books(state: State<'_, AppState>) -> Result<Vec<Book>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, title, file_path, author, total_pages, file_size_bytes,
                    date_added, last_opened, is_favorite, cover_color
             FROM books ORDER BY last_opened DESC, date_added DESC",
        )
        .map_err(|e| e.to_string())?;

    let books = stmt
        .query_map([], |row| {
            Ok(Book {
                id: row.get(0)?,
                title: row.get(1)?,
                file_path: row.get(2)?,
                author: row.get(3)?,
                total_pages: row.get(4)?,
                file_size_bytes: row.get(5)?,
                date_added: row.get(6)?,
                last_opened: row.get(7)?,
                is_favorite: row.get::<_, i32>(8)? != 0,
                cover_color: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(books)
}

#[tauri::command]
pub async fn add_book(
    title: String,
    file_path: String,
    author: Option<String>,
    total_pages: i32,
    file_size_bytes: i64,
    cover_color: Option<String>,
    state: State<'_, AppState>,
) -> Result<Book, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO books (title, file_path, author, total_pages, file_size_bytes, cover_color)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![title, file_path, author, total_pages, file_size_bytes, cover_color],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    // Also create a reading_progress entry
    conn.execute(
        "INSERT OR IGNORE INTO reading_progress (book_id) VALUES (?1)",
        params![id],
    )
    .map_err(|e| e.to_string())?;

    let book = conn
        .query_row(
            "SELECT id, title, file_path, author, total_pages, file_size_bytes,
                    date_added, last_opened, is_favorite, cover_color
             FROM books WHERE id = ?1",
            params![id],
            |row| {
                Ok(Book {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    file_path: row.get(2)?,
                    author: row.get(3)?,
                    total_pages: row.get(4)?,
                    file_size_bytes: row.get(5)?,
                    date_added: row.get(6)?,
                    last_opened: row.get(7)?,
                    is_favorite: row.get::<_, i32>(8)? != 0,
                    cover_color: row.get(9)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(book)
}

#[tauri::command]
pub async fn delete_book(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM books WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn update_book_last_opened(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE books SET last_opened = datetime('now') WHERE id = ?1",
        params![id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn toggle_favorite(id: i64, state: State<'_, AppState>) -> Result<bool, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE books SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?1",
        params![id],
    )
    .map_err(|e| e.to_string())?;
    let is_fav: i32 = conn
        .query_row("SELECT is_favorite FROM books WHERE id = ?1", params![id], |r| r.get(0))
        .map_err(|e| e.to_string())?;
    Ok(is_fav != 0)
}
