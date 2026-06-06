//! Tauri IPC commands bridging the web UI to Shannon Core.
//!
//! Each command is exposed via `#[tauri::command]` and invoked from
//! JavaScript as `invoke("command_name", { args })`.

use serde::{Deserialize, Serialize};
use shannon_core::api::client::LlmClient;
use shannon_core::api::types::LlmClientConfig;
use shannon_core::permissions::PermissionManager;
use shannon_core::query_engine::{QueryContext, QueryEngine, QueryEvent};
use shannon_core::state::StateManager;
use shannon_core::tools::ToolRegistry;
use std::collections::HashMap;
use std::sync::Arc;
use tauri::Emitter;
use tokio::sync::{Mutex, RwLock, oneshot};

use crate::config::{self, DesktopConfig};
use crate::events;
use crate::events::event_names;
use tokio_util::sync::CancellationToken;

/// Shared application state accessible to all Tauri commands.
pub struct AppState {
    /// Current conversation messages for the active session.
    messages: Arc<Mutex<Vec<ChatMessage>>>,
    /// Whether a query is currently in progress.
    querying: Arc<Mutex<bool>>,
    /// Current model identifier.
    model: Arc<Mutex<String>>,
    /// Current provider name.
    provider: Arc<Mutex<String>>,
    /// LLM client config — used to build clients on demand.
    client_config: Arc<RwLock<LlmClientConfig>>,
    /// Tool registry with default tools.
    tools: Arc<ToolRegistry>,
    /// Permission manager.
    permissions: Arc<RwLock<PermissionManager>>,
    /// Session state manager.
    state_manager: Arc<StateManager>,
    /// Query engine configuration.
    qe_config: Arc<RwLock<shannon_core::query_engine::QueryEngineConfig>>,
    /// Desktop config (persisted).
    desktop_config: Arc<RwLock<DesktopConfig>>,
    /// Pending permission requests (request_id -> sender).
    pending_permissions: Arc<Mutex<HashMap<String, oneshot::Sender<bool>>>>,
    /// Session metadata for session list.
    sessions: Arc<Mutex<Vec<SessionMeta>>>,
    /// Cancellation token for the current query.
    cancellation_token: Arc<Mutex<Option<CancellationToken>>>,
    /// Currently active session ID.
    current_session_id: Arc<Mutex<Option<String>>>,
}

/// Session metadata for session list.
#[derive(Debug, Clone)]
struct SessionMeta {
    id: String,
    title: String,
    created_at: i64,
    message_count: usize,
}

/// A chat message displayed in the UI.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
    pub timestamp: i64,
}

/// Status response for the desktop UI.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatusResponse {
    pub model: String,
    pub provider: String,
    pub querying: bool,
    pub message_count: usize,
    pub working_dir: String,
}

/// Model info for the model selector.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
    pub provider: String,
    pub context_window: usize,
}

/// Tool info for the tools panel.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolInfo {
    pub name: String,
    pub description: String,
    pub enabled: bool,
}

/// Configuration update payload.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigUpdate {
    pub key: String,
    pub value: String,
}

/// Provider switch request.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderSwitchRequest {
    pub provider: String,
    pub api_key: Option<String>,
    pub base_url: Option<String>,
    pub model: String,
}

/// Response from send_message containing the query ID.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SendMessageResponse {
    pub query_id: String,
}

impl AppState {
    /// Create a new AppState, initializing the LLM client from env/config.
    pub fn new() -> Self {
        let desktop_config = config::load_config();
        let client_config = Self::build_client_config(&desktop_config);

        let model = desktop_config
            .model
            .clone()
            .unwrap_or_else(|| "claude-sonnet-4-6".into());
        let provider = desktop_config
            .provider
            .clone()
            .unwrap_or_else(|| "anthropic".into());

        Self {
            messages: Arc::new(Mutex::new(Vec::new())),
            querying: Arc::new(Mutex::new(false)),
            model: Arc::new(Mutex::new(model)),
            provider: Arc::new(Mutex::new(provider)),
            client_config: Arc::new(RwLock::new(client_config)),
            tools: Arc::new(ToolRegistry::new()),
            permissions: Arc::new(RwLock::new(PermissionManager::new())),
            state_manager: Arc::new(StateManager::new()),
            qe_config: Arc::new(RwLock::new(
                shannon_core::query_engine::QueryEngineConfig::default(),
            )),
            desktop_config: Arc::new(RwLock::new(desktop_config)),
            pending_permissions: Arc::new(Mutex::new(HashMap::new())),
            sessions: Arc::new(Mutex::new(Vec::new())),
            cancellation_token: Arc::new(Mutex::new(None)),
            current_session_id: Arc::new(Mutex::new(None)),
        }
    }

    fn build_client_config(cfg: &DesktopConfig) -> LlmClientConfig {
        let provider_str = cfg.provider.as_deref().unwrap_or("anthropic");
        let provider = provider_from_str(provider_str);
        let api_key = cfg
            .api_key
            .clone()
            .filter(|k| !k.is_empty())
            .unwrap_or_else(|| provider.resolve_api_key_from_env());
        let base_url = cfg
            .base_url
            .clone()
            .unwrap_or_else(|| provider.default_base_url().to_string());
        let model = cfg
            .model
            .clone()
            .unwrap_or_else(|| "claude-sonnet-4-6".into());

        LlmClientConfig {
            api_key,
            base_url,
            model,
            provider,
            ..LlmClientConfig::default()
        }
    }
}

/// Send a user message and stream the AI response via Tauri events.
#[tauri::command]
pub async fn send_message(
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
    message: String,
) -> Result<SendMessageResponse, String> {
    // Prevent concurrent queries
    {
        let querying = state.querying.lock().await;
        if *querying {
            return Err("A query is already in progress".into());
        }
    }

    // Mark as querying
    {
        let mut querying = state.querying.lock().await;
        *querying = true;
    }

    // Create cancellation token
    let cancel_token = CancellationToken::new();
    {
        let mut token_guard = state.cancellation_token.lock().await;
        *token_guard = Some(cancel_token.clone());
    }

    // Add user message
    let now = chrono_timestamp();
    {
        let mut messages = state.messages.lock().await;
        messages.push(ChatMessage {
            role: "user".into(),
            content: message.clone(),
            timestamp: now,
        });
    }

    let query_id = uuid::Uuid::new_v4();
    let qid_str = query_id.to_string();

    // Build the query engine
    let client_config = state.client_config.read().await.clone();
    let client = LlmClient::new(client_config);
    let _tools = state.tools.clone();
    let permissions = PermissionManager::new();
    let _state_mgr = state.state_manager.clone();
    let qe_config = state.qe_config.read().await.clone();

    let engine = QueryEngine::new(
        client,
        ToolRegistry::new(),
        permissions,
        StateManager::new(),
        qe_config,
    );

    // Create query context
    let model = state.model.lock().await.clone();
    let context = QueryContext {
        query_id,
        session_id: uuid::Uuid::new_v4(),
        user_message: message,
        metadata: shannon_core::query_engine::QueryMetadata {
            timestamp: chrono::Utc::now(),
            tools_allowed: true,
            max_tokens: None,
            model,
            temperature: None,
            top_p: None,
        },
    };

    // Spawn the query in a background task, streaming events to frontend
    let querying_flag = state.querying.clone();
    let messages_arc = state.messages.clone();
    let app = app_handle.clone();
    let cancel_token_clone = cancel_token.clone();
    let current_session_id_arc = state.current_session_id.clone();
    let state_mgr_arc = state.state_manager.clone();
    let model_arc = state.model.clone();

    let return_qid = qid_str.clone();
    tokio::spawn(async move {
        let stream = engine.process_query(context, None).await;
        let mut final_content = String::new();

        // Consume the stream using futures::StreamExt
        use futures::StreamExt;
        let mut pin_stream = std::pin::pin!(stream);

        while let Some(event_result) = pin_stream.next().await {
            // Check for cancellation
            if cancel_token_clone.is_cancelled() {
                let _ = app.emit(
                    event_names::QUERY_CANCELLED,
                    events::QueryCancelledPayload {
                        query_id: qid_str.clone(),
                    },
                );
                break;
            }

            match event_result {
                Ok(event) => match event {
                    QueryEvent::Text { content, .. } => {
                        final_content.push_str(&content);
                        let _ = app.emit(
                            event_names::QUERY_TEXT,
                            events::QueryTextPayload {
                                query_id: qid_str.clone(),
                                content,
                            },
                        );
                    }
                    QueryEvent::ToolUseRequest {
                        tool_use_id,
                        tool_name,
                        tool_input,
                        ..
                    } => {
                        let _ = app.emit(
                            event_names::QUERY_TOOL_START,
                            events::ToolStartPayload {
                                query_id: qid_str.clone(),
                                tool_use_id,
                                tool_name,
                                tool_input,
                            },
                        );
                    }
                    QueryEvent::ToolUseResult {
                        tool_use_id,
                        tool_name,
                        result,
                        is_error,
                        ..
                    } => {
                        let _ = app.emit(
                            event_names::QUERY_TOOL_RESULT,
                            events::ToolResultPayload {
                                query_id: qid_str.clone(),
                                tool_use_id,
                                tool_name,
                                result,
                                is_error,
                            },
                        );
                    }
                    QueryEvent::ToolProgress {
                        tool_use_id,
                        tool_name,
                        progress,
                        message: msg,
                        ..
                    } => {
                        let _ = app.emit(
                            event_names::QUERY_TOOL_PROGRESS,
                            events::ToolProgressPayload {
                                query_id: qid_str.clone(),
                                tool_use_id,
                                tool_name,
                                progress,
                                message: msg,
                            },
                        );
                    }
                    QueryEvent::Thinking { content, .. } => {
                        let _ = app.emit(
                            event_names::QUERY_THINKING,
                            events::ThinkingPayload {
                                query_id: qid_str.clone(),
                                content,
                            },
                        );
                    }
                    QueryEvent::Usage {
                        input_tokens,
                        output_tokens,
                        cost_usd,
                        ..
                    } => {
                        let _ = app.emit(
                            event_names::QUERY_USAGE,
                            events::UsagePayload {
                                query_id: qid_str.clone(),
                                input_tokens,
                                output_tokens,
                                cost_usd,
                            },
                        );
                    }
                    QueryEvent::Completed { .. } => {
                        // Save final assistant message
                        {
                            let mut messages = messages_arc.lock().await;
                            messages.push(ChatMessage {
                                role: "assistant".into(),
                                content: if final_content.is_empty() {
                                    "(no text response)".into()
                                } else {
                                    final_content.clone()
                                },
                                timestamp: chrono_timestamp(),
                            });
                        }

                        // Auto-persist to StateManager
                        {
                            let session_id_opt = current_session_id_arc.lock().await.clone();
                            if let Some(sid) = session_id_opt {
                                let msgs = messages_arc.lock().await.clone();
                                let model = model_arc.lock().await.clone();
                                if let Ok(session_uuid) = uuid::Uuid::parse_str(&sid) {
                                    let core_msgs: Vec<shannon_core::api::Message> = msgs
                                        .iter()
                                        .map(|m| shannon_core::api::Message {
                                            role: m.role.clone(),
                                            content: shannon_core::api::MessageContent::Text(
                                                m.content.clone(),
                                            ),
                                        })
                                        .collect();
                                    let meta = shannon_core::state::SessionPersistMetadata {
                                        model,
                                        turn_count: core_msgs.len() / 2,
                                        ..Default::default()
                                    };
                                    let _ = state_mgr_arc.save_session(
                                        &session_uuid,
                                        &core_msgs,
                                        &meta,
                                    );
                                }
                            }
                        }

                        let _ = app.emit(
                            event_names::QUERY_COMPLETED,
                            events::QueryCompletedPayload {
                                query_id: qid_str.clone(),
                            },
                        );
                    }
                    QueryEvent::Failed { error, .. } => {
                        let _ = app.emit(
                            event_names::QUERY_FAILED,
                            events::QueryFailedPayload {
                                query_id: qid_str.clone(),
                                error,
                            },
                        );
                    }
                    // Ignore other events in MVP
                    _ => {}
                },
                Err(e) => {
                    let _ = app.emit(
                        event_names::QUERY_FAILED,
                        events::QueryFailedPayload {
                            query_id: qid_str.clone(),
                            error: e.to_string(),
                        },
                    );
                }
            }
        }

        // Clear querying flag and cancellation token
        {
            let mut q = querying_flag.lock().await;
            *q = false;
        }
    });

    Ok(SendMessageResponse {
        query_id: return_qid,
    })
}

/// Get all conversation messages.
#[tauri::command]
pub async fn get_conversation(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<ChatMessage>, String> {
    let messages = state.messages.lock().await;
    Ok(messages.clone())
}

/// List available models for the current provider.
#[tauri::command]
pub async fn list_models(state: tauri::State<'_, AppState>) -> Result<Vec<ModelInfo>, String> {
    let provider = state.provider.lock().await;
    Ok(match provider.as_str() {
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
            provider: provider.clone(),
            context_window: 128_000,
        }],
    })
}

/// Get current application status.
#[tauri::command]
pub async fn get_status(state: tauri::State<'_, AppState>) -> Result<StatusResponse, String> {
    let model = state.model.lock().await;
    let provider = state.provider.lock().await;
    let querying = state.querying.lock().await;
    let messages = state.messages.lock().await;
    let working_dir = std::env::current_dir()
        .map(|p| p.display().to_string())
        .unwrap_or_else(|_| ".".into());

    Ok(StatusResponse {
        model: model.clone(),
        provider: provider.clone(),
        querying: *querying,
        message_count: messages.len(),
        working_dir,
    })
}

/// Cancel the current query.
#[tauri::command]
pub async fn cancel_query(
    state: tauri::State<'_, AppState>,
    _app_handle: tauri::AppHandle,
) -> Result<(), String> {
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

    Ok(())
}

/// List available tools.
#[tauri::command]
pub async fn list_tools() -> Result<Vec<ToolInfo>, String> {
    // MVP: return known built-in tools. Dynamic enumeration via ToolRegistry
    // requires a public iteration API (Phase 2).
    Ok(vec![
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
    ])
}

/// Update configuration.
#[tauri::command]
pub async fn configure(
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
    update: ConfigUpdate,
) -> Result<(), String> {
    match update.key.as_str() {
        "model" => {
            let mut model = state.model.lock().await;
            *model = update.value.clone();
            let mut cfg = state.client_config.write().await;
            cfg.model = update.value;

            // Update desktop config and persist
            let mut desktop_cfg = state.desktop_config.write().await;
            desktop_cfg.model = Some((*model).clone());
            drop(desktop_cfg);

            let desktop_cfg = state.desktop_config.read().await;
            config::save_config(&desktop_cfg)?;

            // Emit config updated event
            let _ = app_handle.emit(
                event_names::CONFIG_UPDATED,
                events::ConfigUpdatedPayload {
                    key: "model".into(),
                    value: (*model).clone(),
                },
            );

            Ok(())
        }
        "api_key" => {
            let mut desktop_cfg = state.desktop_config.write().await;
            desktop_cfg.api_key = Some(update.value.clone());

            // Update client config
            let mut cfg = state.client_config.write().await;
            cfg.api_key = update.value.clone();

            drop(desktop_cfg);
            let desktop_cfg = state.desktop_config.read().await;
            config::save_config(&desktop_cfg)?;

            let _ = app_handle.emit(
                event_names::CONFIG_UPDATED,
                events::ConfigUpdatedPayload {
                    key: "api_key".into(),
                    value: "***".into(),
                },
            );

            Ok(())
        }
        "base_url" => {
            let mut desktop_cfg = state.desktop_config.write().await;
            desktop_cfg.base_url = Some(update.value.clone());

            let mut cfg = state.client_config.write().await;
            cfg.base_url = update.value.clone();

            drop(desktop_cfg);
            let desktop_cfg = state.desktop_config.read().await;
            config::save_config(&desktop_cfg)?;

            let _ = app_handle.emit(
                event_names::CONFIG_UPDATED,
                events::ConfigUpdatedPayload {
                    key: "base_url".into(),
                    value: update.value,
                },
            );

            Ok(())
        }
        "provider" => {
            let mut provider = state.provider.lock().await;
            *provider = update.value.clone();

            let mut desktop_cfg = state.desktop_config.write().await;
            desktop_cfg.provider = Some((*provider).clone());

            drop(desktop_cfg);
            let desktop_cfg = state.desktop_config.read().await;
            config::save_config(&desktop_cfg)?;

            let _ = app_handle.emit(
                event_names::CONFIG_UPDATED,
                events::ConfigUpdatedPayload {
                    key: "provider".into(),
                    value: update.value,
                },
            );

            Ok(())
        }
        "working_dir" => {
            let mut desktop_cfg = state.desktop_config.write().await;
            desktop_cfg.working_dir = Some(update.value.clone());

            drop(desktop_cfg);
            let desktop_cfg = state.desktop_config.read().await;
            config::save_config(&desktop_cfg)?;

            let _ = app_handle.emit(
                event_names::CONFIG_UPDATED,
                events::ConfigUpdatedPayload {
                    key: "working_dir".into(),
                    value: update.value,
                },
            );

            Ok(())
        }
        "theme" => {
            let mut desktop_cfg = state.desktop_config.write().await;
            desktop_cfg.theme = Some(update.value.clone());

            drop(desktop_cfg);
            let desktop_cfg = state.desktop_config.read().await;
            config::save_config(&desktop_cfg)?;

            let _ = app_handle.emit(
                event_names::CONFIG_UPDATED,
                events::ConfigUpdatedPayload {
                    key: "theme".into(),
                    value: update.value,
                },
            );

            Ok(())
        }
        _ => Err(format!("Unknown config key: {}", update.key)),
    }
}

/// Switch to a different LLM provider.
#[tauri::command]
pub async fn switch_provider(
    state: tauri::State<'_, AppState>,
    request: ProviderSwitchRequest,
) -> Result<(), String> {
    let new_config = DesktopConfig {
        provider: Some(request.provider.clone()),
        api_key: request.api_key.clone(),
        base_url: request.base_url.clone(),
        model: Some(request.model.clone()),
        working_dir: None,
        theme: None,
    };

    let client_config = AppState::build_client_config(&new_config);

    // Update all state
    {
        let mut c = state.client_config.write().await;
        *c = client_config;
    }
    {
        let mut m = state.model.lock().await;
        *m = request.model.clone();
    }
    {
        let mut p = state.provider.lock().await;
        *p = request.provider;
    }
    {
        let mut dc = state.desktop_config.write().await;
        *dc = new_config.clone();
    }

    // Persist
    config::save_config(&new_config)?;

    Ok(())
}

/// Get the current desktop config (for settings panel).
#[tauri::command]
pub async fn get_config(state: tauri::State<'_, AppState>) -> Result<DesktopConfig, String> {
    let cfg = state.desktop_config.read().await;
    // Redact API key for display
    let mut display = cfg.clone();
    if display.api_key.is_some() {
        display.api_key = Some("***".into());
    }
    Ok(display)
}

/// Create a new session and return its UUID.
#[tauri::command]
pub async fn new_session(
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let id = uuid::Uuid::new_v4();
    let id_str = id.to_string();
    let title = format!("Session {}", id_str.split('-').next().unwrap_or(&id_str));
    let now = chrono_timestamp();

    // Create empty session file using StateManager
    let model = state.model.lock().await.clone();
    let metadata = shannon_core::state::SessionPersistMetadata {
        model,
        turn_count: 0,
        title: Some(title.clone()),
        ..Default::default()
    };

    state
        .state_manager
        .save_session(&id, &[], &metadata)
        .map_err(|e| e.to_string())?;

    // Create session metadata
    let session_meta = SessionMeta {
        id: id_str.clone(),
        title: title.clone(),
        created_at: now,
        message_count: 0,
    };

    // Add to sessions list
    {
        let mut sessions = state.sessions.lock().await;
        sessions.push(session_meta);
    }

    // Set as current session
    {
        let mut current = state.current_session_id.lock().await;
        *current = Some(id_str.clone());
    }

    // Clear messages for new session
    {
        let mut messages = state.messages.lock().await;
        messages.clear();
    }

    // Emit sessions updated event
    let _ = app_handle.emit(event_names::SESSIONS_UPDATED, ());

    Ok(id_str)
}

/// List all sessions.
#[tauri::command]
pub async fn list_sessions(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<events::SessionInfo>, String> {
    let sessions = state.sessions.lock().await;
    let result: Vec<events::SessionInfo> = sessions
        .iter()
        .map(|s| events::SessionInfo {
            id: s.id.clone(),
            title: s.title.clone(),
            created_at: s.created_at,
            message_count: s.message_count,
        })
        .collect();
    Ok(result)
}

/// Load a session by ID.
#[tauri::command]
pub async fn load_session(
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
    id: String,
) -> Result<Vec<ChatMessage>, String> {
    let session_uuid = uuid::Uuid::parse_str(&id).map_err(|e| format!("Invalid UUID: {}", e))?;

    // Load from StateManager
    let session_data = state
        .state_manager
        .load_session(&session_uuid)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Session not found: {}", id))?;

    // Convert shannon_core Messages to ChatMessages
    let messages: Vec<ChatMessage> = session_data
        .messages
        .into_iter()
        .map(|msg| ChatMessage {
            role: msg.role,
            content: match msg.content {
                shannon_core::api::MessageContent::Text(t) => t,
                shannon_core::api::MessageContent::Blocks(blocks) => {
                    // For blocks, extract text content
                    blocks
                        .iter()
                        .filter_map(|b| match b {
                            shannon_core::api::ContentBlock::Text { text } => Some(text.clone()),
                            _ => None,
                        })
                        .collect::<Vec<_>>()
                        .join("\n")
                }
            },
            timestamp: chrono_timestamp(),
        })
        .collect();

    // Update current messages
    {
        let mut current_messages = state.messages.lock().await;
        *current_messages = messages.clone();
    }

    // Set as current session
    {
        let mut current = state.current_session_id.lock().await;
        *current = Some(id.clone());
    }

    // Emit session loaded event
    let event_messages: Vec<events::ChatMessage> = messages
        .iter()
        .map(|m| events::ChatMessage {
            role: m.role.clone(),
            content: m.content.clone(),
            timestamp: m.timestamp,
        })
        .collect();
    let _ = app_handle.emit(
        event_names::SESSION_LOADED,
        events::SessionLoaded {
            messages: event_messages,
        },
    );

    Ok(messages)
}

/// Switch to a different session, saving the current one first.
#[tauri::command]
pub async fn switch_session(
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
    id: String,
) -> Result<Vec<ChatMessage>, String> {
    let session_uuid = uuid::Uuid::parse_str(&id).map_err(|e| format!("Invalid UUID: {}", e))?;

    // Save current session before switching
    {
        let current_id = state.current_session_id.lock().await.clone();
        if let Some(ref sid) = current_id {
            let messages = state.messages.lock().await.clone();
            if let Ok(uuid) = uuid::Uuid::parse_str(sid) {
                let model = state.model.lock().await.clone();
                let core_msgs: Vec<shannon_core::api::Message> = messages
                    .iter()
                    .map(|m| shannon_core::api::Message {
                        role: m.role.clone(),
                        content: shannon_core::api::MessageContent::Text(m.content.clone()),
                    })
                    .collect();
                let meta = shannon_core::state::SessionPersistMetadata {
                    model,
                    turn_count: core_msgs.len() / 2,
                    ..Default::default()
                };
                let _ = state.state_manager.save_session(&uuid, &core_msgs, &meta);
            }
        }
    }

    // Load new session
    let messages = match state
        .state_manager
        .load_session(&session_uuid)
        .map_err(|e| e.to_string())?
    {
        Some(data) => data
            .messages
            .into_iter()
            .map(|msg| ChatMessage {
                role: msg.role,
                content: match msg.content {
                    shannon_core::api::MessageContent::Text(t) => t,
                    shannon_core::api::MessageContent::Blocks(blocks) => blocks
                        .iter()
                        .filter_map(|b| match b {
                            shannon_core::api::ContentBlock::Text { text } => Some(text.clone()),
                            _ => None,
                        })
                        .collect::<Vec<_>>()
                        .join("\n"),
                },
                timestamp: chrono_timestamp(),
            })
            .collect(),
        None => Vec::new(),
    };

    // Update state
    {
        let mut current = state.current_session_id.lock().await;
        *current = Some(id.clone());
    }
    {
        let mut msgs = state.messages.lock().await;
        *msgs = messages.clone();
    }

    // Emit session loaded event
    let event_messages: Vec<events::ChatMessage> = messages
        .iter()
        .map(|m| events::ChatMessage {
            role: m.role.clone(),
            content: m.content.clone(),
            timestamp: m.timestamp,
        })
        .collect();
    let _ = app_handle.emit(
        event_names::SESSION_LOADED,
        events::SessionLoaded {
            messages: event_messages,
        },
    );

    Ok(messages)
}

/// Delete a session by ID.
#[tauri::command]
pub async fn delete_session(
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
    id: String,
) -> Result<bool, String> {
    let session_uuid = uuid::Uuid::parse_str(&id).map_err(|e| format!("Invalid UUID: {}", e))?;

    // Delete from StateManager
    let deleted = state
        .state_manager
        .delete_persisted_session(&session_uuid)
        .map_err(|e| e.to_string())?;

    if deleted {
        // Remove from sessions list
        let mut sessions = state.sessions.lock().await;
        sessions.retain(|s| s.id != id);

        // Emit sessions updated event
        let _ = app_handle.emit(event_names::SESSIONS_UPDATED, ());

        Ok(true)
    } else {
        Ok(false)
    }
}

/// Request permission for a tool execution.
#[tauri::command]
pub async fn request_permission(
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
    tool: String,
    input: serde_json::Value,
    risk: String,
) -> Result<bool, String> {
    let request_id = uuid::Uuid::new_v4().to_string();
    let (tx, rx) = oneshot::channel();

    // Store the sender
    {
        let mut pending = state.pending_permissions.lock().await;
        pending.insert(request_id.clone(), tx);
    }

    // Emit event to frontend
    let _ = app_handle.emit(
        events::event_names::PERMISSION_REQUEST,
        events::PermissionRequest {
            tool: tool.clone(),
            input: input.clone(),
            risk: risk.clone(),
            request_id: request_id.clone(),
        },
    );

    // Wait for response with 30s timeout
    let timeout = tokio::time::Duration::from_secs(30);
    let result = tokio::time::timeout(timeout, rx).await;

    // Clean up
    {
        let mut pending = state.pending_permissions.lock().await;
        pending.remove(&request_id);
    }

    match result {
        Ok(Ok(allowed)) => Ok(allowed),
        Ok(Err(_)) => Ok(false), // Sender dropped
        Err(_) => Ok(false),     // Timeout
    }
}

/// Respond to a permission request.
#[tauri::command]
pub async fn respond_permission(
    state: tauri::State<'_, AppState>,
    request_id: String,
    allow: bool,
) -> Result<(), String> {
    let mut pending = state.pending_permissions.lock().await;
    if let Some(tx) = pending.remove(&request_id) {
        // Send response, ignoring errors if receiver dropped
        let _ = tx.send(allow);
        Ok(())
    } else {
        Err(format!("Permission request not found: {}", request_id))
    }
}

/// File diff result for the diff viewer.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileDiff {
    pub old_content: String,
    pub new_content: String,
    pub file_name: String,
    pub language: String,
}

/// Get the diff for a file (working tree vs last committed, or old vs new content).
#[tauri::command]
pub async fn get_file_diff(path: String) -> Result<FileDiff, String> {
    use std::process::Command;

    let file_path = std::path::Path::new(&path);
    let file_name = file_path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| path.clone());

    // Detect language from extension
    let language = file_path
        .extension()
        .map(|e| e.to_string_lossy().to_string())
        .unwrap_or_else(|| "plaintext".to_string());

    // Try git diff first
    let dir = file_path.parent().unwrap_or(std::path::Path::new("."));
    let git_output = Command::new("git")
        .args(["diff", "HEAD", "--", &path])
        .current_dir(dir)
        .output();

    let (old_content, new_content) = match git_output {
        Ok(output) if output.status.success() && !output.stdout.is_empty() => {
            // Parse unified diff - for simplicity, just read current file as new
            // and reconstruct old from git show
            let new = std::fs::read_to_string(&path).unwrap_or_default();
            let old_output = Command::new("git")
                .args(["show", &format!("HEAD:{}", path)])
                .current_dir(dir)
                .output();
            let old = match old_output {
                Ok(o) if o.status.success() => String::from_utf8_lossy(&o.stdout).to_string(),
                _ => String::new(),
            };
            (old, new)
        }
        _ => {
            // Not a git repo or no changes - read file as new, empty old
            let content = std::fs::read_to_string(&path).unwrap_or_default();
            (String::new(), content)
        }
    };

    Ok(FileDiff {
        old_content,
        new_content,
        file_name,
        language,
    })
}

fn chrono_timestamp() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

fn provider_from_str(s: &str) -> shannon_core::api::types::LlmProvider {
    use shannon_core::api::types::LlmProvider;
    match s {
        "anthropic" => LlmProvider::Anthropic,
        "openai" => LlmProvider::OpenAI,
        "ollama" => LlmProvider::Ollama,
        "deepseek" => LlmProvider::DeepSeek,
        "gemini" => LlmProvider::Gemini,
        "mistral" => LlmProvider::Mistral,
        "groq" => LlmProvider::Groq,
        "openrouter" => LlmProvider::OpenRouter,
        "xai" => LlmProvider::Xai,
        _ => LlmProvider::Custom,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_state_new() {
        let state = AppState::new();
        let messages = state.messages.blocking_lock();
        assert!(messages.is_empty());
        assert!(!*state.querying.blocking_lock());
    }

    #[test]
    fn test_chat_message_serialization() {
        let msg = ChatMessage {
            role: "user".to_string(),
            content: "hello world".to_string(),
            timestamp: 1700000000,
        };
        let json = serde_json::to_string(&msg).unwrap();
        let deserialized: ChatMessage = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.role, "user");
        assert_eq!(deserialized.content, "hello world");
        assert_eq!(deserialized.timestamp, 1700000000);
    }

    #[test]
    fn test_chat_message_roles() {
        for role in &["user", "assistant", "system"] {
            let msg = ChatMessage {
                role: role.to_string(),
                content: "test".to_string(),
                timestamp: 0,
            };
            assert_eq!(msg.role, *role);
        }
    }

    #[test]
    fn test_status_response_serialization() {
        let resp = StatusResponse {
            model: "claude-opus".to_string(),
            provider: "anthropic".to_string(),
            querying: true,
            message_count: 42,
            working_dir: "/home/user".to_string(),
        };
        let json = serde_json::to_string(&resp).unwrap();
        let deserialized: StatusResponse = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.model, "claude-opus");
        assert!(deserialized.querying);
        assert_eq!(deserialized.message_count, 42);
    }

    #[test]
    fn test_model_info_serialization() {
        let info = ModelInfo {
            id: "gpt-4".to_string(),
            name: "GPT-4".to_string(),
            provider: "openai".to_string(),
            context_window: 128_000,
        };
        let json = serde_json::to_string(&info).unwrap();
        let deserialized: ModelInfo = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.id, "gpt-4");
        assert_eq!(deserialized.context_window, 128_000);
    }

    #[test]
    fn test_tool_info_serialization() {
        let info = ToolInfo {
            name: "bash".to_string(),
            description: "Execute shell commands".to_string(),
            enabled: true,
        };
        let json = serde_json::to_string(&info).unwrap();
        let deserialized: ToolInfo = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.name, "bash");
        assert!(deserialized.enabled);
    }

    #[test]
    fn test_config_update_serialization() {
        let update = ConfigUpdate {
            key: "model".to_string(),
            value: "claude-opus".to_string(),
        };
        let json = serde_json::to_string(&update).unwrap();
        let deserialized: ConfigUpdate = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.key, "model");
        assert_eq!(deserialized.value, "claude-opus");
    }

    #[test]
    fn test_provider_switch_request_serialization() {
        let req = ProviderSwitchRequest {
            provider: "openai".to_string(),
            api_key: Some("sk-test".to_string()),
            base_url: None,
            model: "gpt-4.1".to_string(),
        };
        let json = serde_json::to_string(&req).unwrap();
        let deserialized: ProviderSwitchRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.provider, "openai");
        assert_eq!(deserialized.api_key, Some("sk-test".to_string()));
    }

    #[test]
    fn test_send_message_response_serialization() {
        let resp = SendMessageResponse {
            query_id: "abc-123".to_string(),
        };
        let json = serde_json::to_string(&resp).unwrap();
        let deserialized: SendMessageResponse = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.query_id, "abc-123");
    }

    #[test]
    fn test_chrono_timestamp_reasonable() {
        let ts = chrono_timestamp();
        assert!(ts > 1704067200, "timestamp should be after 2024-01-01");
        assert!(ts < 1893456000, "timestamp should be before 2030-01-01");
    }

    #[tokio::test]
    async fn test_app_state_querying_toggle() {
        let state = AppState::new();
        {
            let mut q = state.querying.lock().await;
            *q = true;
        }
        assert!(*state.querying.lock().await);
        {
            let mut q = state.querying.lock().await;
            *q = false;
        }
        assert!(!*state.querying.lock().await);
    }

    #[tokio::test]
    async fn test_app_state_messages_push() {
        let state = AppState::new();
        {
            let mut msgs = state.messages.lock().await;
            msgs.push(ChatMessage {
                role: "user".to_string(),
                content: "hello".to_string(),
                timestamp: 100,
            });
            msgs.push(ChatMessage {
                role: "assistant".to_string(),
                content: "hi".to_string(),
                timestamp: 101,
            });
        }
        let msgs = state.messages.lock().await;
        assert_eq!(msgs.len(), 2);
        assert_eq!(msgs[0].role, "user");
        assert_eq!(msgs[1].content, "hi");
    }

    #[test]
    fn test_all_structs_are_send_sync() {
        fn assert_send_sync<T: Send + Sync>() {}
        assert_send_sync::<AppState>();
        assert_send_sync::<ChatMessage>();
        assert_send_sync::<StatusResponse>();
        assert_send_sync::<ModelInfo>();
        assert_send_sync::<ToolInfo>();
        assert_send_sync::<ConfigUpdate>();
        assert_send_sync::<ProviderSwitchRequest>();
        assert_send_sync::<SendMessageResponse>();
        assert_send_sync::<FileDiff>();
    }

    #[test]
    fn test_file_diff_serialization() {
        let diff = FileDiff {
            old_content: "old text".to_string(),
            new_content: "new text".to_string(),
            file_name: "test.rs".to_string(),
            language: "rust".to_string(),
        };
        let json = serde_json::to_string(&diff).unwrap();
        let deserialized: FileDiff = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.old_content, "old text");
        assert_eq!(deserialized.new_content, "new text");
        assert_eq!(deserialized.file_name, "test.rs");
        assert_eq!(deserialized.language, "rust");
    }
}
