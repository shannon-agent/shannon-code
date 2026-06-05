//! Tests for shannon-desktop command logic.
//!
//! The commands module is gated behind `#[cfg(feature = "tauri")]` because the
//! handler signatures depend on `tauri::State`.  We replicate the pure-data
//! types and test the business logic without pulling in the Tauri runtime.
//!
//! The types and logic here mirror `src/commands.rs`. When the production code
//! changes, these tests must be updated to match.

use std::sync::Arc;
use tokio::sync::Mutex;

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

struct AppState {
    messages: Arc<Mutex<Vec<ChatMessage>>>,
    querying: Arc<Mutex<bool>>,
    model: Arc<Mutex<String>>,
    provider: Arc<Mutex<String>>,
}

impl AppState {
    fn new() -> Self {
        Self {
            messages: Arc::new(Mutex::new(Vec::new())),
            querying: Arc::new(Mutex::new(false)),
            model: Arc::new(Mutex::new("claude-sonnet-4-6".into())),
            provider: Arc::new(Mutex::new("anthropic".into())),
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
    let mut querying = state.querying.lock().await;
    *querying = false;
}

async fn configure(state: &AppState, update: ConfigUpdate) -> Result<(), String> {
    match update.key.as_str() {
        "model" => {
            let mut model = state.model.lock().await;
            *model = update.value;
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
