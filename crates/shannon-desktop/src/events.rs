//! Typed event payloads for Tauri frontend events.
//!
//! These map directly from QueryEngine's QueryEvent variants to
//! JSON payloads emitted via `app_handle.emit()`.

use serde::Serialize;

/// A streaming text chunk from the LLM.
#[derive(Debug, Clone, Serialize)]
pub struct QueryTextPayload {
    pub query_id: String,
    pub content: String,
}

/// A tool call has started.
#[derive(Debug, Clone, Serialize)]
pub struct ToolStartPayload {
    pub query_id: String,
    pub tool_use_id: String,
    pub tool_name: String,
    pub tool_input: serde_json::Value,
}

/// A tool call has completed.
#[derive(Debug, Clone, Serialize)]
pub struct ToolResultPayload {
    pub query_id: String,
    pub tool_use_id: String,
    pub tool_name: String,
    pub result: String,
    pub is_error: bool,
}

/// Tool progress update (e.g., bash command output).
#[derive(Debug, Clone, Serialize)]
pub struct ToolProgressPayload {
    pub query_id: String,
    pub tool_use_id: String,
    pub tool_name: String,
    pub progress: f32,
    pub message: String,
}

/// Extended thinking content.
#[derive(Debug, Clone, Serialize)]
pub struct ThinkingPayload {
    pub query_id: String,
    pub content: String,
}

/// Token usage and cost update.
#[derive(Debug, Clone, Serialize)]
pub struct UsagePayload {
    pub query_id: String,
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub cost_usd: f64,
}

/// Query completed successfully.
#[derive(Debug, Clone, Serialize)]
pub struct QueryCompletedPayload {
    pub query_id: String,
}

/// Query failed.
#[derive(Debug, Clone, Serialize)]
pub struct QueryFailedPayload {
    pub query_id: String,
    pub error: String,
}

/// Tauri event names used in emit/listen.
pub mod event_names {
    pub const QUERY_TEXT: &str = "query:text";
    pub const QUERY_TOOL_START: &str = "query:tool-start";
    pub const QUERY_TOOL_RESULT: &str = "query:tool-result";
    pub const QUERY_TOOL_PROGRESS: &str = "query:tool-progress";
    pub const QUERY_THINKING: &str = "query:thinking";
    pub const QUERY_USAGE: &str = "query:usage";
    pub const QUERY_COMPLETED: &str = "query:completed";
    pub const QUERY_FAILED: &str = "query:failed";
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_query_text_payload_serialization() {
        let p = QueryTextPayload {
            query_id: "abc".into(),
            content: "hello".into(),
        };
        let json = serde_json::to_string(&p).unwrap();
        assert!(json.contains("abc"));
        assert!(json.contains("hello"));
    }

    #[test]
    fn test_tool_start_payload_serialization() {
        let p = ToolStartPayload {
            query_id: "q1".into(),
            tool_use_id: "t1".into(),
            tool_name: "bash".into(),
            tool_input: serde_json::json!({"command": "ls"}),
        };
        let json = serde_json::to_string(&p).unwrap();
        assert!(json.contains("bash"));
        assert!(json.contains("ls"));
    }

    #[test]
    fn test_event_names_are_valid() {
        // Ensure event names are non-empty and follow the namespaced format
        assert!(!event_names::QUERY_TEXT.is_empty());
        assert!(event_names::QUERY_TEXT.contains(':'));
        assert!(event_names::QUERY_TOOL_START.contains(':'));
        assert!(event_names::QUERY_COMPLETED.contains(':'));
        assert!(event_names::QUERY_FAILED.contains(':'));
    }
}
