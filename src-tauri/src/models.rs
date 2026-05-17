use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Book {
    pub id: i64,
    pub title: String,
    pub file_path: String,
    pub author: Option<String>,
    pub total_pages: i32,
    pub file_size_bytes: i64,
    pub date_added: String,
    pub last_opened: Option<String>,
    pub is_favorite: bool,
    pub cover_color: Option<String>, // stored as hex, generated on import
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ReadingProgress {
    pub id: i64,
    pub book_id: i64,
    pub current_page: i32,
    pub scroll_offset: f64,
    pub zoom_level: f64,
    pub last_updated: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Annotation {
    pub id: i64,
    pub book_id: i64,
    pub page_number: i32,
    pub annotation_type: String, // 'highlight' | 'underline' | 'strikethrough' | 'sticky_note' | 'ink'
    pub selected_text: Option<String>,
    pub color: Option<String>,
    pub note_content: Option<String>,
    pub is_note_open: bool,
    pub ink_path_data: Option<String>,
    pub position_data: String, // JSON string
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Bookmark {
    pub id: i64,
    pub book_id: i64,
    pub page_number: i32,
    pub label: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ReadingSession {
    pub id: i64,
    pub book_id: i64,
    pub started_at: String,
    pub ended_at: Option<String>,
    pub duration_seconds: i64,
    pub pages_read: i32,
    pub start_page: i32,
    pub end_page: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ReadingStats {
    pub streak_days: i32,
    pub total_pages_read: i64,
    pub total_time_seconds: i64,
    pub total_books: i64,
    pub books_completed: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSetting {
    pub key: String,
    pub value: String,
}
