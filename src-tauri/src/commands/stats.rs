use crate::models::{Bookmark, ReadingSession, ReadingStats};
use crate::AppState;
use rusqlite::params;
use tauri::State;

// ── Bookmarks ────────────────────────────────────────────────
#[tauri::command]
pub async fn get_bookmarks(book_id: i64, state: State<'_, AppState>) -> Result<Vec<Bookmark>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, book_id, page_number, label, created_at
             FROM bookmarks WHERE book_id = ?1 ORDER BY page_number ASC",
        )
        .map_err(|e| e.to_string())?;

    let bookmarks = stmt
        .query_map(params![book_id], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                book_id: row.get(1)?,
                page_number: row.get(2)?,
                label: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(bookmarks)
}

#[tauri::command]
pub async fn toggle_bookmark(
    book_id: i64,
    page_number: i32,
    label: Option<String>,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let exists: bool = conn
        .query_row(
            "SELECT COUNT(*) FROM bookmarks WHERE book_id=?1 AND page_number=?2",
            params![book_id, page_number],
            |r| r.get::<_, i32>(0),
        )
        .map(|c| c > 0)
        .map_err(|e| e.to_string())?;

    if exists {
        conn.execute(
            "DELETE FROM bookmarks WHERE book_id=?1 AND page_number=?2",
            params![book_id, page_number],
        )
        .map_err(|e| e.to_string())?;
        Ok(false) // removed
    } else {
        conn.execute(
            "INSERT INTO bookmarks (book_id, page_number, label) VALUES (?1, ?2, ?3)",
            params![book_id, page_number, label],
        )
        .map_err(|e| e.to_string())?;
        Ok(true) // added
    }
}

// ── Reading Sessions ──────────────────────────────────────────
#[tauri::command]
pub async fn start_session(
    book_id: i64,
    start_page: i32,
    state: State<'_, AppState>,
) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO reading_sessions (book_id, start_page, end_page) VALUES (?1, ?2, ?2)",
        params![book_id, start_page],
    )
    .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub async fn end_session(
    session_id: i64,
    end_page: i32,
    pages_read: i32,
    duration_seconds: i64,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE reading_sessions
         SET ended_at = datetime('now'), end_page = ?1, pages_read = ?2, duration_seconds = ?3
         WHERE id = ?4",
        params![end_page, pages_read, duration_seconds, session_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

// ── Reading Stats ─────────────────────────────────────────────
#[tauri::command]
pub async fn get_reading_stats(state: State<'_, AppState>) -> Result<ReadingStats, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Total books and completed books (progress = 100%)
    let (total_books, books_completed): (i64, i64) = conn
        .query_row(
            "SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN rp.current_page >= b.total_pages AND b.total_pages > 0 THEN 1 ELSE 0 END)
             FROM books b
             LEFT JOIN reading_progress rp ON rp.book_id = b.id",
            [],
            |r| Ok((r.get(0)?, r.get(1).unwrap_or(0))),
        )
        .map_err(|e| e.to_string())?;

    // Total pages read + time
    let (total_pages_read, total_time_seconds): (i64, i64) = conn
        .query_row(
            "SELECT COALESCE(SUM(pages_read), 0), COALESCE(SUM(duration_seconds), 0)
             FROM reading_sessions WHERE ended_at IS NOT NULL",
            [],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .map_err(|e| e.to_string())?;

    // Streak: consecutive days with ≥1 session ≥5 min (300 seconds)
    let streak_days = calculate_streak(&conn)?;

    Ok(ReadingStats {
        streak_days,
        total_pages_read,
        total_time_seconds,
        total_books,
        books_completed,
    })
}

fn calculate_streak(conn: &rusqlite::Connection) -> Result<i32, String> {
    let mut stmt = conn
        .prepare(
            "SELECT date(started_at) as read_date
             FROM reading_sessions
             WHERE ended_at IS NOT NULL AND duration_seconds >= 300
             GROUP BY date(started_at)
             ORDER BY read_date DESC",
        )
        .map_err(|e| e.to_string())?;

    let dates: Vec<String> = stmt
        .query_map([], |r| r.get(0))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    if dates.is_empty() {
        return Ok(0);
    }

    let today = chrono::Local::now().date_naive();
    let mut streak = 0i32;

    for (i, date_str) in dates.iter().enumerate() {
        let d = chrono::NaiveDate::parse_from_str(date_str, "%Y-%m-%d")
            .map_err(|e| e.to_string())?;
        let expected = today - chrono::Duration::days(i as i64);
        if d == expected {
            streak += 1;
        } else {
            break;
        }
    }
    Ok(streak)
}

#[tauri::command]
pub async fn get_heatmap_data(state: State<'_, AppState>) -> Result<Vec<(String, i64)>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT date(started_at), COALESCE(SUM(duration_seconds)/60, 0)
             FROM reading_sessions
             WHERE ended_at IS NOT NULL
               AND started_at >= date('now', '-365 days')
             GROUP BY date(started_at)",
        )
        .map_err(|e| e.to_string())?;

    let data = stmt
        .query_map([], |r| Ok((r.get(0)?, r.get(1)?)))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(data)
}
