//! Tests for shannon-desktop command logic.
//!
//! The commands module is gated behind `#[cfg(feature = "tauri")]` because the
//! handler signatures depend on `tauri::State`.  We replicate the pure-data
//! types and test the business logic without pulling in the Tauri runtime.
//!
//! The types and logic here mirror `src/commands.rs`. When the production code
//! changes, these tests must be updated to match.

use shannon_core::api::{Message, MessageContent};
use shannon_core::state::StateManager;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock, oneshot};
use tokio_util::sync::CancellationToken;

#[derive(Debug, Clone, Default)]
struct TestDesktopConfig {
    provider: Option<String>,
    api_key: Option<String>,
    base_url: Option<String>,
    model: Option<String>,
    working_dir: Option<String>,
    theme: Option<String>,
}

// ── Replicated types (mirror of commands.rs) ──────────────────────

#[derive(Debug, Clone)]
struct ChatMessage {
    role: String,
    content: String,
    timestamp: i64,
}

#[derive(Debug, Clone)]
struct StatusResponse {
    model: String,
    provider: String,
    querying: bool,
    message_count: usize,
    working_dir: String,
}

#[derive(Debug, Clone)]
struct ModelInfo {
    id: String,
    name: String,
    provider: String,
    context_window: usize,
}

#[derive(Debug, Clone)]
struct ToolInfo {
    name: String,
    description: String,
    enabled: bool,
}

#[derive(Debug, Clone)]
struct ConfigUpdate {
    key: String,
    value: String,
}

#[derive(Debug, Clone)]
struct ProviderSwitchRequest {
    provider: String,
    api_key: Option<String>,
    base_url: Option<String>,
    model: String,
}

#[derive(Debug, Clone)]
struct SendMessageResponse {
    query_id: String,
}

/// Session metadata for session list (mirrors commands.rs).
#[derive(Debug, Clone)]
struct SessionMeta {
    id: String,
    title: String,
    created_at: i64,
    _message_count: usize,
}

struct AppState {
    messages: Arc<Mutex<Vec<ChatMessage>>>,
    querying: Arc<Mutex<bool>>,
    model: Arc<Mutex<String>>,
    provider: Arc<Mutex<String>>,
    pending_permissions: Arc<Mutex<HashMap<String, oneshot::Sender<bool>>>>,
    sessions: Arc<Mutex<Vec<SessionMeta>>>,
    state_manager: Arc<StateManager>,
    cancellation_token: Arc<Mutex<Option<CancellationToken>>>,
    desktop_config: Arc<RwLock<TestDesktopConfig>>,
}

impl AppState {
    fn new() -> Self {
        Self {
            messages: Arc::new(Mutex::new(Vec::new())),
            querying: Arc::new(Mutex::new(false)),
            model: Arc::new(Mutex::new("claude-sonnet-4-6".into())),
            provider: Arc::new(Mutex::new("anthropic".into())),
            pending_permissions: Arc::new(Mutex::new(HashMap::new())),
            sessions: Arc::new(Mutex::new(Vec::new())),
            state_manager: Arc::new(StateManager::new()),
            cancellation_token: Arc::new(Mutex::new(None)),
            desktop_config: Arc::new(RwLock::new(TestDesktopConfig::default())),
        }
    }
}

fn chrono_timestamp() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

// ── Replicated logic (mirror of command bodies) ───────────────────

/// Mirrors send_message: adds user message, spawns "query", adds assistant message.
/// In tests we simulate the stream completing immediately.
async fn send_message(state: &AppState, message: String) -> Result<SendMessageResponse, String> {
    {
        let querying = state.querying.lock().await;
        if *querying {
            return Err("A query is already in progress".into());
        }
    }
    {
        let mut querying = state.querying.lock().await;
        *querying = true;
    }

    let now = chrono_timestamp();
    {
        let mut messages = state.messages.lock().await;
        messages.push(ChatMessage {
            role: "user".into(),
            content: message,
            timestamp: now,
        });
    }

    // Simulate a completed query (in production this streams from QueryEngine)
    let query_id = uuid::Uuid::new_v4().to_string();

    {
        let mut messages = state.messages.lock().await;
        messages.push(ChatMessage {
            role: "assistant".into(),
            content: format!("Simulated response for query {}", query_id),
            timestamp: chrono_timestamp(),
        });
    }

    {
        let mut querying = state.querying.lock().await;
        *querying = false;
    }

    Ok(SendMessageResponse { query_id })
}

async fn get_conversation(state: &AppState) -> Vec<ChatMessage> {
    state.messages.lock().await.clone()
}

fn list_models(provider: &str) -> Vec<ModelInfo> {
    match provider {
        "anthropic" => vec![
            ModelInfo {
                id: "claude-sonnet-4-6".into(),
                name: "Claude Sonnet 4.6".into(),
                provider: "anthropic".into(),
                context_window: 200_000,
            },
            ModelInfo {
                id: "claude-opus-4-7".into(),
                name: "Claude Opus 4.7".into(),
                provider: "anthropic".into(),
                context_window: 200_000,
            },
            ModelInfo {
                id: "claude-haiku-4-5-20251001".into(),
                name: "Claude Haiku 4.5".into(),
                provider: "anthropic".into(),
                context_window: 200_000,
            },
        ],
        "openai" => vec![
            ModelInfo {
                id: "gpt-4.1".into(),
                name: "GPT-4.1".into(),
                provider: "openai".into(),
                context_window: 1_047_576,
            },
            ModelInfo {
                id: "gpt-4.1-mini".into(),
                name: "GPT-4.1 Mini".into(),
                provider: "openai".into(),
                context_window: 1_047_576,
            },
            ModelInfo {
                id: "o3".into(),
                name: "o3".into(),
                provider: "openai".into(),
                context_window: 200_000,
            },
        ],
        "deepseek" => vec![
            ModelInfo {
                id: "deepseek-chat".into(),
                name: "DeepSeek Chat".into(),
                provider: "deepseek".into(),
                context_window: 128_000,
            },
            ModelInfo {
                id: "deepseek-reasoner".into(),
                name: "DeepSeek Reasoner".into(),
                provider: "deepseek".into(),
                context_window: 128_000,
            },
        ],
        "ollama" => vec![ModelInfo {
            id: "qwen3:8b".into(),
            name: "Qwen3 8B (local)".into(),
            provider: "ollama".into(),
            context_window: 32_000,
        }],
        _ => vec![ModelInfo {
            id: "default".into(),
            name: "Default Model".into(),
            provider: provider.into(),
            context_window: 128_000,
        }],
    }
}

async fn get_status(state: &AppState) -> StatusResponse {
    let model = state.model.lock().await;
    let provider = state.provider.lock().await;
    let querying = state.querying.lock().await;
    let messages = state.messages.lock().await;
    let working_dir = std::env::current_dir()
        .map(|p| p.display().to_string())
        .unwrap_or_else(|_| ".".into());

    StatusResponse {
        model: model.clone(),
        provider: provider.clone(),
        querying: *querying,
        message_count: messages.len(),
        working_dir,
    }
}

async fn cancel_query(state: &AppState) {
    // Take the cancellation token and cancel it
    let token_opt = {
        let mut token_guard = state.cancellation_token.lock().await;
        token_guard.take()
    };

    if let Some(token) = token_opt {
        token.cancel();
    }

    // Clear querying flag
    {
        let mut querying = state.querying.lock().await;
        *querying = false;
    }
}

async fn configure(state: &AppState, update: ConfigUpdate) -> Result<(), String> {
    match update.key.as_str() {
        "model" => {
            let mut model = state.model.lock().await;
            *model = update.value.clone();
            let mut cfg = state.desktop_config.write().await;
            cfg.model = Some(update.value);
            Ok(())
        }
        "api_key" => {
            let mut cfg = state.desktop_config.write().await;
            cfg.api_key = Some(update.value);
            Ok(())
        }
        "base_url" => {
            let mut cfg = state.desktop_config.write().await;
            cfg.base_url = Some(update.value);
            Ok(())
        }
        "provider" => {
            let mut provider = state.provider.lock().await;
            *provider = update.value.clone();
            let mut cfg = state.desktop_config.write().await;
            cfg.provider = Some(update.value);
            Ok(())
        }
        "working_dir" => {
            let mut cfg = state.desktop_config.write().await;
            cfg.working_dir = Some(update.value);
            Ok(())
        }
        "theme" => {
            let mut cfg = state.desktop_config.write().await;
            cfg.theme = Some(update.value);
            Ok(())
        }
        _ => Err(format!("Unknown config key: {}", update.key)),
    }
}

async fn switch_provider(state: &AppState, req: ProviderSwitchRequest) {
    {
        let mut m = state.model.lock().await;
        *m = req.model;
    }
    {
        let mut p = state.provider.lock().await;
        *p = req.provider;
    }
}

fn list_tools() -> Vec<ToolInfo> {
    vec![
        ToolInfo {
            name: "bash".into(),
            description: "Execute shell commands".into(),
            enabled: true,
        },
        ToolInfo {
            name: "read".into(),
            description: "Read file contents".into(),
            enabled: true,
        },
        ToolInfo {
            name: "write".into(),
            description: "Write file contents".into(),
            enabled: true,
        },
        ToolInfo {
            name: "edit".into(),
            description: "Edit files with precise matching".into(),
            enabled: true,
        },
        ToolInfo {
            name: "grep".into(),
            description: "Search file contents by pattern".into(),
            enabled: true,
        },
        ToolInfo {
            name: "glob".into(),
            description: "Find files by glob pattern".into(),
            enabled: true,
        },
    ]
}

fn provider_from_str(s: &str) -> String {
    match s {
        "anthropic" | "openai" | "ollama" | "deepseek" | "gemini" | "mistral" | "groq"
        | "openrouter" | "xai" => s.to_string(),
        _ => "custom".to_string(),
    }
}

// ── Session management (mirrors commands.rs) ──────────────────────

/// Mirrors new_session: creates session, persists to state_manager, returns UUID.
async fn new_session(state: &AppState) -> Result<String, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let title = format!("Session {}", id.split('-').next().unwrap_or(&id));
    let now = chrono_timestamp();

    let session_meta = SessionMeta {
        id: id.clone(),
        title: title.clone(),
        created_at: now,
        _message_count: 0,
    };

    {
        let mut sessions = state.sessions.lock().await;
        sessions.push(session_meta);
    }

    // Persist empty session to state_manager
    let uuid = uuid::Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    let metadata = shannon_core::state::SessionPersistMetadata {
        model: "test".to_string(),
        turn_count: 0,
        title: Some(title),
        ..Default::default()
    };
    state
        .state_manager
        .save_session(&uuid, &[], &metadata)
        .map_err(|e| e.to_string())?;

    Ok(id)
}

/// Mirrors list_sessions: returns session info.
async fn list_sessions(state: &AppState) -> Vec<SessionMeta> {
    state.sessions.lock().await.clone()
}

/// Mirrors load_session: finds session by ID, loads messages from state_manager.
async fn load_session(state: &AppState, id: &str) -> Result<Vec<ChatMessage>, String> {
    let sessions = state.sessions.lock().await;
    sessions
        .iter()
        .find(|s| s.id == id)
        .ok_or_else(|| format!("Session not found: {}", id))?;
    drop(sessions);

    let uuid = uuid::Uuid::parse_str(id).map_err(|e| e.to_string())?;
    let session_data = state
        .state_manager
        .load_session(&uuid)
        .map_err(|e| e.to_string())?;

    match session_data {
        Some(data) => {
            let messages: Vec<ChatMessage> = data
                .messages
                .into_iter()
                .map(|m| ChatMessage {
                    role: m.role,
                    content: match m.content {
                        shannon_core::api::MessageContent::Text(t) => t,
                        shannon_core::api::MessageContent::Blocks(blocks) => blocks
                            .into_iter()
                            .filter_map(|b| match b {
                                shannon_core::api::ContentBlock::Text { text } => Some(text),
                                _ => None,
                            })
                            .collect::<Vec<_>>()
                            .join(""),
                    },
                    timestamp: chrono_timestamp(),
                })
                .collect();
            Ok(messages)
        }
        None => Ok(vec![]),
    }
}

/// Mirrors delete_session: removes session by ID and deletes file.
async fn delete_session(state: &AppState, id: &str) -> Result<bool, String> {
    let mut sessions = state.sessions.lock().await;
    let original_len = sessions.len();
    sessions.retain(|s| s.id != id);
    let removed = sessions.len() < original_len;
    drop(sessions);

    if removed {
        if let Ok(uuid) = uuid::Uuid::parse_str(id) {
            let _ = state.state_manager.delete_session(uuid);
            // Also delete session file from disk (StateManager only removes from memory)
            let home = std::env::var("HOME")
                .or_else(|_| std::env::var("USERPROFILE"))
                .ok();
            if let Some(home) = home {
                let path = std::path::PathBuf::from(home)
                    .join(".shannon")
                    .join("sessions")
                    .join(format!("{}.json", uuid));
                let _ = std::fs::remove_file(&path);
            }
        }
    }

    Ok(removed)
}

// ── Permission bridge (mirrors commands.rs) ────────────────────────

/// Mirrors request_permission: creates channel, stores sender.
async fn request_permission_setup(
    state: &AppState,
    _tool: String,
    _input: serde_json::Value,
    _risk: String,
) -> (String, oneshot::Receiver<bool>) {
    let request_id = uuid::Uuid::new_v4().to_string();
    let (tx, rx) = oneshot::channel();

    {
        let mut pending = state.pending_permissions.lock().await;
        pending.insert(request_id.clone(), tx);
    }

    (request_id, rx)
}

/// Mirrors respond_permission: finds and sends response.
async fn respond_permission(state: &AppState, request_id: &str, allow: bool) -> Result<(), String> {
    let mut pending = state.pending_permissions.lock().await;
    if let Some(tx) = pending.remove(request_id) {
        let _ = tx.send(allow);
        Ok(())
    } else {
        Err(format!("Permission request not found: {}", request_id))
    }
}

// ═══════════════════════════════════════════════════════════════════
//  Tests
// ═══════════════════════════════════════════════════════════════════

// ── AppState::new ─────────────────────────────────────────────────

#[tokio::test]
async fn app_state_new_has_querying_false() {
    let state = AppState::new();
    assert!(!*state.querying.lock().await);
}

#[tokio::test]
async fn app_state_new_has_empty_messages() {
    let state = AppState::new();
    assert!(state.messages.lock().await.is_empty());
}

#[tokio::test]
async fn app_state_new_default_model_is_claude_sonnet_4_6() {
    let state = AppState::new();
    assert_eq!(*state.model.lock().await, "claude-sonnet-4-6");
}

#[tokio::test]
async fn app_state_new_default_provider_is_anthropic() {
    let state = AppState::new();
    assert_eq!(*state.provider.lock().await, "anthropic");
}

// ── send_message ──────────────────────────────────────────────────

#[tokio::test]
async fn send_message_pushes_user_and_assistant_messages() {
    let state = AppState::new();
    let result = send_message(&state, "hello world".into()).await;
    assert!(result.is_ok());

    let messages = state.messages.lock().await;
    assert_eq!(messages.len(), 2);
    assert_eq!(messages[0].role, "user");
    assert_eq!(messages[0].content, "hello world");
    assert_eq!(messages[1].role, "assistant");
}

#[tokio::test]
async fn send_message_returns_query_id() {
    let state = AppState::new();
    let result = send_message(&state, "test".into()).await.unwrap();
    assert!(!result.query_id.is_empty());
    // UUID v4 format: 8-4-4-4-12
    assert_eq!(result.query_id.len(), 36);
    assert!(result.query_id.contains('-'));
}

#[tokio::test]
async fn send_message_toggles_querying_flag() {
    let state = AppState::new();
    assert!(!*state.querying.lock().await);
    let _ = send_message(&state, "test".into()).await;
    assert!(
        !*state.querying.lock().await,
        "querying should be false after completion"
    );
}

#[tokio::test]
async fn send_message_rejects_concurrent_query() {
    let state = AppState::new();
    *state.querying.lock().await = true;
    let result = send_message(&state, "test".into()).await;
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("already in progress"));
}

#[tokio::test]
async fn send_message_timestamps_are_positive() {
    let state = AppState::new();
    let _ = send_message(&state, "timing".into()).await;
    let messages = state.messages.lock().await;
    assert!(messages[0].timestamp > 0);
    assert!(messages[1].timestamp > 0);
}

// ── get_conversation ──────────────────────────────────────────────

#[tokio::test]
async fn get_conversation_returns_all_messages_in_order() {
    let state = AppState::new();
    let _ = send_message(&state, "first".into()).await;
    let _ = send_message(&state, "second".into()).await;

    let conv = get_conversation(&state).await;
    assert_eq!(conv.len(), 4, "two send_message calls = 4 messages");
    assert_eq!(conv[0].content, "first");
    assert_eq!(conv[0].role, "user");
    assert_eq!(conv[1].role, "assistant");
    assert_eq!(conv[2].content, "second");
    assert_eq!(conv[2].role, "user");
    assert_eq!(conv[3].role, "assistant");
}

#[tokio::test]
async fn get_conversation_empty_when_no_messages() {
    let state = AppState::new();
    assert!(get_conversation(&state).await.is_empty());
}

// ── list_models ───────────────────────────────────────────────────

#[tokio::test]
async fn list_models_anthropic_has_three_models() {
    let models = list_models("anthropic");
    assert_eq!(models.len(), 3);
    let ids: Vec<&str> = models.iter().map(|m| m.id.as_str()).collect();
    assert!(ids.contains(&"claude-sonnet-4-6"));
    assert!(ids.contains(&"claude-opus-4-7"));
    assert!(ids.contains(&"claude-haiku-4-5-20251001"));
}

#[tokio::test]
async fn list_models_openai_has_three_models() {
    let models = list_models("openai");
    assert_eq!(models.len(), 3);
    let ids: Vec<&str> = models.iter().map(|m| m.id.as_str()).collect();
    assert!(ids.contains(&"gpt-4.1"));
    assert!(ids.contains(&"gpt-4.1-mini"));
    assert!(ids.contains(&"o3"));
}

#[tokio::test]
async fn list_models_deepseek_has_two_models() {
    let models = list_models("deepseek");
    assert_eq!(models.len(), 2);
}

#[tokio::test]
async fn list_models_ollama_has_one_model() {
    let models = list_models("ollama");
    assert_eq!(models.len(), 1);
    assert_eq!(models[0].id, "qwen3:8b");
}

#[tokio::test]
async fn list_models_unknown_provider_returns_default() {
    let models = list_models("unknown");
    assert_eq!(models.len(), 1);
    assert_eq!(models[0].id, "default");
}

#[tokio::test]
async fn list_models_all_have_valid_fields() {
    for provider in &["anthropic", "openai", "deepseek", "ollama"] {
        let models = list_models(provider);
        for m in &models {
            assert!(!m.id.is_empty(), "model id empty for provider {}", provider);
            assert!(
                !m.name.is_empty(),
                "model name empty for provider {}",
                provider
            );
            assert_eq!(m.provider, *provider);
            assert!(m.context_window > 0, "context_window must be positive");
        }
    }
}

// ── get_status ────────────────────────────────────────────────────

#[tokio::test]
async fn get_status_initial_state() {
    let state = AppState::new();
    let status = get_status(&state).await;
    assert_eq!(status.model, "claude-sonnet-4-6");
    assert_eq!(status.provider, "anthropic");
    assert!(!status.querying);
    assert_eq!(status.message_count, 0);
    assert!(!status.working_dir.is_empty());
}

#[tokio::test]
async fn get_status_after_messages() {
    let state = AppState::new();
    let _ = send_message(&state, "hi".into()).await;
    let status = get_status(&state).await;
    assert_eq!(status.message_count, 2);
    assert!(!status.querying);
}

#[tokio::test]
async fn get_status_reflects_model_change() {
    let state = AppState::new();
    configure(
        &state,
        ConfigUpdate {
            key: "model".into(),
            value: "gpt-4.1".into(),
        },
    )
    .await
    .unwrap();
    let status = get_status(&state).await;
    assert_eq!(status.model, "gpt-4.1");
}

// ── cancel_query ──────────────────────────────────────────────────

#[tokio::test]
async fn cancel_query_sets_querying_false() {
    let state = AppState::new();
    *state.querying.lock().await = true;
    assert!(*state.querying.lock().await);
    cancel_query(&state).await;
    assert!(!*state.querying.lock().await);
}

#[tokio::test]
async fn cancel_query_when_already_false() {
    let state = AppState::new();
    assert!(!*state.querying.lock().await);
    cancel_query(&state).await;
    assert!(!*state.querying.lock().await);
}

// ── configure ─────────────────────────────────────────────────────

#[tokio::test]
async fn configure_updates_model() {
    let state = AppState::new();
    configure(
        &state,
        ConfigUpdate {
            key: "model".into(),
            value: "claude-opus-4-7".into(),
        },
    )
    .await
    .unwrap();
    assert_eq!(*state.model.lock().await, "claude-opus-4-7");
}

#[tokio::test]
async fn configure_unknown_key_returns_error() {
    let state = AppState::new();
    let result = configure(
        &state,
        ConfigUpdate {
            key: "unknown_key".into(),
            value: "v".into(),
        },
    )
    .await;
    assert!(result.is_err());
    assert!(matches!(result, Err(ref e) if e.contains("Unknown config key")));
}

// ── switch_provider ───────────────────────────────────────────────

#[tokio::test]
async fn switch_provider_updates_model_and_provider() {
    let state = AppState::new();
    switch_provider(
        &state,
        ProviderSwitchRequest {
            provider: "openai".into(),
            api_key: Some("sk-test".into()),
            base_url: None,
            model: "gpt-4.1".into(),
        },
    )
    .await;
    assert_eq!(*state.model.lock().await, "gpt-4.1");
    assert_eq!(*state.provider.lock().await, "openai");
}

#[tokio::test]
async fn switch_provider_to_ollama() {
    let state = AppState::new();
    switch_provider(
        &state,
        ProviderSwitchRequest {
            provider: "ollama".into(),
            api_key: None,
            base_url: Some("http://localhost:11434".into()),
            model: "qwen3:8b".into(),
        },
    )
    .await;
    assert_eq!(*state.provider.lock().await, "ollama");
    assert_eq!(*state.model.lock().await, "qwen3:8b");
}

// ── list_tools ────────────────────────────────────────────────────

#[tokio::test]
async fn list_tools_returns_expected_count() {
    assert_eq!(list_tools().len(), 6);
}

#[tokio::test]
async fn list_tools_all_enabled() {
    for tool in &list_tools() {
        assert!(tool.enabled, "tool '{}' should be enabled", tool.name);
    }
}

#[tokio::test]
async fn list_tools_has_expected_names() {
    let tools = list_tools();
    let names: Vec<&str> = tools.iter().map(|t| t.name.as_str()).collect();
    for expected in &["bash", "read", "write", "edit", "grep", "glob"] {
        assert!(names.contains(expected), "missing tool: {}", expected);
    }
}

#[tokio::test]
async fn list_tools_have_nonempty_descriptions() {
    for tool in &list_tools() {
        assert!(
            !tool.description.is_empty(),
            "tool '{}' needs description",
            tool.name
        );
    }
}

// ── provider_from_str ─────────────────────────────────────────────

#[test]
fn test_known_providers() {
    for p in &[
        "anthropic",
        "openai",
        "ollama",
        "deepseek",
        "gemini",
        "mistral",
        "groq",
        "openrouter",
        "xai",
    ] {
        assert_eq!(provider_from_str(p), *p);
    }
}

#[test]
fn test_unknown_provider_returns_custom() {
    assert_eq!(provider_from_str("something-else"), "custom");
    assert_eq!(provider_from_str(""), "custom");
}

// ── list_models per-provider consistency ──────────────────────────

#[test]
fn test_anthropic_models_match_production_ids() {
    let models = list_models("anthropic");
    let ids: Vec<&str> = models.iter().map(|m| m.id.as_str()).collect();
    assert!(
        ids.contains(&"claude-sonnet-4-6"),
        "must match production model id"
    );
    assert!(
        ids.contains(&"claude-opus-4-7"),
        "must match production model id"
    );
}

// ── new_session ────────────────────────────────────────────────────

#[tokio::test]
async fn new_session_returns_uuid() {
    let state = AppState::new();
    let result = new_session(&state).await;
    assert!(result.is_ok());
    let id = result.unwrap();
    assert_eq!(id.len(), 36); // UUID v4 format
}

#[tokio::test]
async fn new_session_adds_to_sessions_list() {
    let state = AppState::new();
    let _ = new_session(&state).await.unwrap();
    let sessions = list_sessions(&state).await;
    assert_eq!(sessions.len(), 1);
    assert!(!sessions[0].id.is_empty());
}

#[tokio::test]
async fn new_session_title_contains_prefix() {
    let state = AppState::new();
    let _ = new_session(&state).await.unwrap();
    let sessions = list_sessions(&state).await;
    assert!(sessions[0].title.starts_with("Session "));
}

// ── list_sessions ───────────────────────────────────────────────────

#[tokio::test]
async fn list_sessions_empty_initially() {
    let state = AppState::new();
    let sessions = list_sessions(&state).await;
    assert!(sessions.is_empty());
}

#[tokio::test]
async fn list_sessions_returns_all_sessions() {
    let state = AppState::new();
    let _ = new_session(&state).await.unwrap();
    let _ = new_session(&state).await.unwrap();
    let sessions = list_sessions(&state).await;
    assert_eq!(sessions.len(), 2);
}

#[tokio::test]
async fn list_sessions_has_valid_timestamps() {
    let state = AppState::new();
    let _ = new_session(&state).await.unwrap();
    let sessions = list_sessions(&state).await;
    assert!(sessions[0].created_at > 1704067200); // After 2024-01-01
}

// ── load_session ─────────────────────────────────────────────────────

#[tokio::test]
async fn load_session_finds_existing_session() {
    let state = AppState::new();
    let id = new_session(&state).await.unwrap();
    let result = load_session(&state, &id).await;
    assert!(result.is_ok());
}

#[tokio::test]
async fn load_session_returns_error_for_unknown_session() {
    let state = AppState::new();
    let result = load_session(&state, "unknown-id").await;
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("not found"));
}

#[tokio::test]
async fn load_session_returns_empty_messages_mvp() {
    let state = AppState::new();
    let id = new_session(&state).await.unwrap();
    let messages = load_session(&state, &id).await.unwrap();
    assert!(messages.is_empty()); // MVP returns empty
}

// ── delete_session ───────────────────────────────────────────────────

#[tokio::test]
async fn delete_session_removes_existing_session() {
    let state = AppState::new();
    let id = new_session(&state).await.unwrap();
    let result = delete_session(&state, &id).await;
    assert!(result.is_ok());
    assert!(result.unwrap()); // Deleted
    assert!(list_sessions(&state).await.is_empty());
}

#[tokio::test]
async fn delete_session_returns_false_for_unknown_session() {
    let state = AppState::new();
    let result = delete_session(&state, "unknown").await;
    assert!(result.is_ok());
    assert!(!result.unwrap()); // Not deleted
}

#[tokio::test]
async fn delete_session_only_removes_targeted_session() {
    let state = AppState::new();
    let id1 = new_session(&state).await.unwrap();
    let id2 = new_session(&state).await.unwrap();
    let _ = delete_session(&state, &id1).await;
    let sessions = list_sessions(&state).await;
    assert_eq!(sessions.len(), 1);
    assert_eq!(sessions[0].id, id2);
}

// ── request_permission / respond_permission ───────────────────────

#[tokio::test]
async fn request_permission_creates_pending_entry() {
    let state = AppState::new();
    let (request_id, _rx) = request_permission_setup(
        &state,
        "bash".into(),
        serde_json::json!({"command": "ls"}),
        "medium".into(),
    )
    .await;
    let pending = state.pending_permissions.lock().await;
    assert!(pending.contains_key(&request_id));
}

#[tokio::test]
async fn respond_permission_allows_execution() {
    let state = AppState::new();
    let (request_id, rx) = request_permission_setup(
        &state,
        "bash".into(),
        serde_json::json!({"command": "ls"}),
        "low".into(),
    )
    .await;
    let _ = respond_permission(&state, &request_id, true).await;
    let allowed = rx.await.unwrap();
    assert!(allowed);
}

#[tokio::test]
async fn respond_permission_denies_execution() {
    let state = AppState::new();
    let (request_id, rx) = request_permission_setup(
        &state,
        "write".into(),
        serde_json::json!({"path": "/tmp/test"}),
        "high".into(),
    )
    .await;
    let _ = respond_permission(&state, &request_id, false).await;
    let allowed = rx.await.unwrap();
    assert!(!allowed);
}

#[tokio::test]
async fn respond_permission_returns_error_for_unknown_request() {
    let state = AppState::new();
    let result = respond_permission(&state, "unknown-id", true).await;
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("not found"));
}

#[tokio::test]
async fn permission_timeout_returns_false() {
    let state = AppState::new();
    let (request_id, rx) = request_permission_setup(
        &state,
        "bash".into(),
        serde_json::json!({"command": "sleep 10"}),
        "medium".into(),
    )
    .await;

    // Simulate timeout by dropping the sender without responding
    {
        let mut pending = state.pending_permissions.lock().await;
        pending.remove(&request_id);
    }

    let result = tokio::time::timeout(tokio::time::Duration::from_millis(100), rx).await;
    assert!(result.is_err() || result.unwrap().is_err()); // Timeout or error
}

// ── Session lifecycle integration ─────────────────────────────────────

#[tokio::test]
async fn session_lifecycle_create_list_delete() {
    let state = AppState::new();

    // Create session
    let id = new_session(&state).await.unwrap();

    // List sessions
    let sessions = list_sessions(&state).await;
    assert_eq!(sessions.len(), 1);
    assert_eq!(sessions[0].id, id);

    // Delete session
    let deleted = delete_session(&state, &id).await.unwrap();
    assert!(deleted);

    // Verify deletion
    let sessions = list_sessions(&state).await;
    assert!(sessions.is_empty());
}

#[tokio::test]
async fn multiple_sessions_independent() {
    let state = AppState::new();

    let id1 = new_session(&state).await.unwrap();
    let id2 = new_session(&state).await.unwrap();

    assert_ne!(id1, id2);

    let _ = delete_session(&state, &id1).await;

    let sessions = list_sessions(&state).await;
    assert_eq!(sessions.len(), 1);
    assert_eq!(sessions[0].id, id2);
}

// ── Session Persistence Tests ───────────────────────────────────────────

#[tokio::test]
async fn session_persistence_creates_file() {
    let state = AppState::new();
    let id = new_session(&state).await.unwrap();

    // Verify session file was created
    let session_uuid = uuid::Uuid::parse_str(&id).unwrap();
    let session_data = state.state_manager.load_session(&session_uuid).unwrap();
    assert!(
        session_data.is_some(),
        "Session file should exist after creation"
    );
}

#[tokio::test]
async fn session_persistence_loads_messages() {
    let state = AppState::new();

    // Create a session with some messages
    let id = new_session(&state).await.unwrap();
    let session_uuid = uuid::Uuid::parse_str(&id).unwrap();

    // Save some messages to the session
    let messages = vec![
        shannon_core::api::Message {
            role: "user".to_string(),
            content: shannon_core::api::MessageContent::Text("Hello".to_string()),
        },
        shannon_core::api::Message {
            role: "assistant".to_string(),
            content: shannon_core::api::MessageContent::Text("Hi there!".to_string()),
        },
    ];

    let metadata = shannon_core::state::SessionPersistMetadata {
        model: "test-model".to_string(),
        turn_count: 1,
        title: Some("Test Session".to_string()),
        ..Default::default()
    };

    state
        .state_manager
        .save_session(&session_uuid, &messages, &metadata)
        .unwrap();

    // Load the session
    let loaded_messages = load_session(&state, &id).await.unwrap();
    assert_eq!(loaded_messages.len(), 2);
    assert_eq!(loaded_messages[0].role, "user");
    assert_eq!(loaded_messages[0].content, "Hello");
    assert_eq!(loaded_messages[1].role, "assistant");
}

#[tokio::test]
async fn session_persistence_deletes_file() {
    let state = AppState::new();

    // Create session
    let id = new_session(&state).await.unwrap();
    let session_uuid = uuid::Uuid::parse_str(&id).unwrap();

    // Verify file exists
    let session_data = state.state_manager.load_session(&session_uuid).unwrap();
    assert!(session_data.is_some());

    // Delete session
    let deleted = delete_session(&state, &id).await.unwrap();
    assert!(deleted);

    // Verify file was deleted
    let session_data = state.state_manager.load_session(&session_uuid).unwrap();
    assert!(session_data.is_none(), "Session file should be deleted");
}

#[tokio::test]
async fn session_persistence_returns_error_for_invalid_uuid() {
    let state = AppState::new();
    let result = load_session(&state, "invalid-uuid").await;
    assert!(result.is_err(), "Should return error for invalid UUID");
}

#[tokio::test]
async fn session_persistence_nonexistent_session() {
    let state = AppState::new();
    let fake_id = uuid::Uuid::new_v4().to_string();
    let result = load_session(&state, &fake_id).await;
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("not found"));
}

// ── Cancellation Tests ───────────────────────────────────────────────────

#[tokio::test]
async fn cancellation_clears_querying_flag() {
    let state = AppState::new();

    // Set querying flag
    {
        let mut querying = state.querying.lock().await;
        *querying = true;
    }

    // Cancel query
    cancel_query(&state).await;

    // Verify flag is cleared
    assert!(!*state.querying.lock().await);
}

#[tokio::test]
async fn cancellation_clears_token() {
    let state = AppState::new();

    // Set a cancellation token
    let token = tokio_util::sync::CancellationToken::new();
    {
        let mut token_guard = state.cancellation_token.lock().await;
        *token_guard = Some(token.clone());
    }

    // Cancel query
    cancel_query(&state).await;

    // Verify token was taken
    let token_guard = state.cancellation_token.lock().await;
    assert!(
        token_guard.is_none(),
        "Token should be cleared after cancellation"
    );
}

#[tokio::test]
async fn cancellation_token_is_cancelled() {
    let state = AppState::new();

    // Set a cancellation token
    let token = tokio_util::sync::CancellationToken::new();
    {
        let mut token_guard = state.cancellation_token.lock().await;
        *token_guard = Some(token.clone());
    }

    // Cancel query
    cancel_query(&state).await;

    // Verify token is cancelled
    assert!(token.is_cancelled(), "Token should be cancelled");
}

// ── Config Persistence Tests ────────────────────────────────────────────

#[tokio::test]
async fn config_persistence_updates_model() {
    let state = AppState::new();

    // Update model
    configure(
        &state,
        ConfigUpdate {
            key: "model".to_string(),
            value: "gpt-4.1".to_string(),
        },
    )
    .await
    .unwrap();

    // Verify model was updated
    assert_eq!(*state.model.lock().await, "gpt-4.1");
}

#[tokio::test]
async fn config_persistence_updates_api_key() {
    let state = AppState::new();

    // Update API key
    configure(
        &state,
        ConfigUpdate {
            key: "api_key".to_string(),
            value: "sk-test-key".to_string(),
        },
    )
    .await
    .unwrap();

    // Verify API key was persisted
    let desktop_cfg = state.desktop_config.read().await;
    assert_eq!(desktop_cfg.api_key, Some("sk-test-key".to_string()));
}

#[tokio::test]
async fn config_persistence_updates_base_url() {
    let state = AppState::new();

    // Update base URL
    configure(
        &state,
        ConfigUpdate {
            key: "base_url".to_string(),
            value: "https://api.example.com".to_string(),
        },
    )
    .await
    .unwrap();

    // Verify base URL was persisted
    let desktop_cfg = state.desktop_config.read().await;
    assert_eq!(
        desktop_cfg.base_url,
        Some("https://api.example.com".to_string())
    );
}

#[tokio::test]
async fn config_persistence_updates_provider() {
    let state = AppState::new();

    // Update provider
    configure(
        &state,
        ConfigUpdate {
            key: "provider".to_string(),
            value: "openai".to_string(),
        },
    )
    .await
    .unwrap();

    // Verify provider was persisted
    assert_eq!(*state.provider.lock().await, "openai");
    let desktop_cfg = state.desktop_config.read().await;
    assert_eq!(desktop_cfg.provider, Some("openai".to_string()));
}

#[tokio::test]
async fn config_persistence_updates_working_dir() {
    let state = AppState::new();

    // Update working directory
    configure(
        &state,
        ConfigUpdate {
            key: "working_dir".to_string(),
            value: "/home/user/projects".to_string(),
        },
    )
    .await
    .unwrap();

    // Verify working dir was persisted
    let desktop_cfg = state.desktop_config.read().await;
    assert_eq!(
        desktop_cfg.working_dir,
        Some("/home/user/projects".to_string())
    );
}

#[tokio::test]
async fn config_persistence_updates_theme() {
    let state = AppState::new();

    // Update theme
    configure(
        &state,
        ConfigUpdate {
            key: "theme".to_string(),
            value: "dark".to_string(),
        },
    )
    .await
    .unwrap();

    // Verify theme was persisted
    let desktop_cfg = state.desktop_config.read().await;
    assert_eq!(desktop_cfg.theme, Some("dark".to_string()));
}

#[tokio::test]
async fn config_persistence_unknown_key_returns_error() {
    let state = AppState::new();

    // Try to update unknown key
    let result = configure(
        &state,
        ConfigUpdate {
            key: "unknown_key".to_string(),
            value: "value".to_string(),
        },
    )
    .await;

    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Unknown config key"));
}
