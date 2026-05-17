use crate::models::Annotation;
use crate::AppState;
use rusqlite::params;
use tauri::State;

#[tauri::command]
pub async fn get_annotations(
    book_id: i64,
    page_number: Option<i32>,
    state: State<'_, AppState>,
) -> Result<Vec<Annotation>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let sql = if page_number.is_some() {
        "SELECT id, book_id, page_number, annotation_type, selected_text, color,
                note_content, is_note_open, ink_path_data, position_data, created_at, updated_at
         FROM annotations WHERE book_id = ?1 AND page_number = ?2
         ORDER BY created_at ASC"
    } else {
        "SELECT id, book_id, page_number, annotation_type, selected_text, color,
                note_content, is_note_open, ink_path_data, position_data, created_at, updated_at
         FROM annotations WHERE book_id = ?1
         ORDER BY page_number ASC, created_at ASC"
    };

    let page = page_number.unwrap_or(0);
    let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;

    let map_row = |row: &rusqlite::Row| {
        Ok(Annotation {
            id: row.get(0)?,
            book_id: row.get(1)?,
            page_number: row.get(2)?,
            annotation_type: row.get(3)?,
            selected_text: row.get(4)?,
            color: row.get(5)?,
            note_content: row.get(6)?,
            is_note_open: row.get::<_, i32>(7)? != 0,
            ink_path_data: row.get(8)?,
            position_data: row.get(9)?,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
        })
    };

    let annotations = if page_number.is_some() {
        stmt.query_map(params![book_id, page], map_row)
    } else {
        stmt.query_map(params![book_id, 0], map_row)
    }
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(annotations)
}

#[tauri::command]
pub async fn save_annotation(
    book_id: i64,
    page_number: i32,
    annotation_type: String,
    selected_text: Option<String>,
    color: Option<String>,
    note_content: Option<String>,
    position_data: String,
    state: State<'_, AppState>,
) -> Result<Annotation, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO annotations
            (book_id, page_number, annotation_type, selected_text, color, note_content, position_data)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            book_id,
            page_number,
            annotation_type,
            selected_text,
            color,
            note_content,
            position_data
        ],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    conn.query_row(
        "SELECT id, book_id, page_number, annotation_type, selected_text, color,
                note_content, is_note_open, ink_path_data, position_data, created_at, updated_at
         FROM annotations WHERE id = ?1",
        params![id],
        |row| {
            Ok(Annotation {
                id: row.get(0)?,
                book_id: row.get(1)?,
                page_number: row.get(2)?,
                annotation_type: row.get(3)?,
                selected_text: row.get(4)?,
                color: row.get(5)?,
                note_content: row.get(6)?,
                is_note_open: row.get::<_, i32>(7)? != 0,
                ink_path_data: row.get(8)?,
                position_data: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_annotation(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM annotations WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn update_note_content(
    id: i64,
    note_content: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE annotations SET note_content = ?1, updated_at = datetime('now') WHERE id = ?2",
        params![note_content, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_all_highlights(state: State<'_, AppState>) -> Result<Vec<Annotation>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, book_id, page_number, annotation_type, selected_text, color,
                    note_content, is_note_open, ink_path_data, position_data, created_at, updated_at
             FROM annotations
             WHERE annotation_type IN ('highlight', 'underline', 'strikethrough')
             ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let annotations = stmt
        .query_map([], |row| {
            Ok(Annotation {
                id: row.get(0)?,
                book_id: row.get(1)?,
                page_number: row.get(2)?,
                annotation_type: row.get(3)?,
                selected_text: row.get(4)?,
                color: row.get(5)?,
                note_content: row.get(6)?,
                is_note_open: row.get::<_, i32>(7)? != 0,
                ink_path_data: row.get(8)?,
                position_data: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(annotations)
}
