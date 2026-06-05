//! Desktop-specific configuration management.
//!
//! Loads provider settings from Shannon's standard config locations
//! and supports runtime provider switching.

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Desktop app configuration persisted across sessions.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesktopConfig {
    pub provider: String,
    pub api_key: Option<String>,
    pub base_url: Option<String>,
    pub model: String,
}

impl Default for DesktopConfig {
    fn default() -> Self {
        Self {
            provider: "anthropic".into(),
            api_key: None,
            base_url: None,
            model: "claude-sonnet-4-6".into(),
        }
    }
}

/// Resolve the config file path: `~/.shannon/desktop.json`
fn config_path() -> PathBuf {
    let home = dirs_home().unwrap_or_else(|| PathBuf::from("."));
    home.join(".shannon").join("desktop.json")
}

fn dirs_home() -> Option<PathBuf> {
    std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .ok()
        .map(PathBuf::from)
}

/// Load desktop config from disk, returning default if not found.
pub fn load_config() -> DesktopConfig {
    let path = config_path();
    match std::fs::read_to_string(&path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => DesktopConfig::default(),
    }
}

/// Save desktop config to disk.
pub fn save_config(config: &DesktopConfig) -> Result<(), String> {
    let path = config_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let content = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    std::fs::write(&path, content).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = DesktopConfig::default();
        assert_eq!(config.provider, "anthropic");
        assert!(config.api_key.is_none());
        assert_eq!(config.model, "claude-sonnet-4-6");
    }

    #[test]
    fn test_config_serialization_roundtrip() {
        let config = DesktopConfig {
            provider: "openai".into(),
            api_key: Some("sk-test".into()),
            base_url: Some("https://api.openai.com".into()),
            model: "gpt-4.1".into(),
        };
        let json = serde_json::to_string(&config).unwrap();
        let parsed: DesktopConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.provider, "openai");
        assert_eq!(parsed.api_key, Some("sk-test".into()));
        assert_eq!(parsed.model, "gpt-4.1");
    }

    #[test]
    fn test_config_path_is_under_shannon_dir() {
        let path = config_path();
        assert!(path.to_string_lossy().contains(".shannon"));
        assert!(path.to_string_lossy().contains("desktop.json"));
    }
}
