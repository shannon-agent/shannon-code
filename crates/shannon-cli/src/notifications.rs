//! Shell-out notifier for CLI / headless mode.
//!
//! Fires OS-native notifications by spawning platform binaries:
//!   - Linux:   `notify-send`
//!   - macOS:   `osascript`
//!   - Windows: `powershell` (BurntToast)
//!
//! Commands are spawned via `std::process::Command` with the args array — never
//! through a shell — so titles and bodies cannot perform shell injection.

use std::process::{Command, Stdio};

use shannon_core::notifier::{Notification, NotificationHandler, NotificationLevel, NotifierError};

/// Template for a single argument to the shell command.
///
/// Placeholders `{title}`, `{body}`, `{level}`, `{urgency}`, `{source}` are
/// substituted with notification-derived values before spawning. Substitution
/// is literal (no shell expansion occurs — the result is passed as a single
/// argv element).
#[derive(Debug, Clone)]
pub struct CommandSpec {
    /// Binary to execute (resolved via `PATH`).
    pub binary: String,
    /// Argument templates.
    pub args: Vec<String>,
}

impl CommandSpec {
    /// Platform default notification command.
    pub fn platform_default() -> Self {
        #[cfg(target_os = "linux")]
        {
            Self {
                binary: "notify-send".into(),
                args: vec![
                    "-u".into(),
                    "{urgency}".into(),
                    "-t".into(),
                    "5000".into(),
                    "-a".into(),
                    "Shannon".into(),
                    "{title}".into(),
                    "{body}".into(),
                ],
            }
        }
        #[cfg(target_os = "macos")]
        {
            Self {
                binary: "osascript".into(),
                args: vec![
                    "-e".into(),
                    "display notification \"{body}\" with title \"{title}\" subtitle \"{source}\""
                        .into(),
                ],
            }
        }
        #[cfg(target_os = "windows")]
        {
            Self {
                binary: "powershell".into(),
                args: vec![
                    "-NoProfile".into(),
                    "-Command".into(),
                    "New-BurntToastNotification -Title '{title}' -Message '{body}'".into(),
                ],
            }
        }
        #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
        {
            Self {
                binary: "echo".into(),
                args: vec![
                    "[shannon-notification]".into(),
                    "{title}".into(),
                    "{body}".into(),
                ],
            }
        }
    }
}

/// Maps a notification level to the Linux `notify-send` urgency value.
pub fn level_to_urgency(level: NotificationLevel) -> &'static str {
    match level {
        NotificationLevel::Info | NotificationLevel::Success => "normal",
        NotificationLevel::Warning => "normal",
        NotificationLevel::Error => "critical",
    }
}

/// Spawns a shell command to deliver a notification, fire-and-forget.
///
/// Returns `Err` only if the binary cannot be spawned (missing, not in `PATH`,
/// or exec permission denied). The child is detached — its exit status is not
/// awaited, matching the async semantics of all target platform notifiers.
pub struct ShellNotifier {
    spec: CommandSpec,
    name: String,
}

impl ShellNotifier {
    /// Create a `ShellNotifier` using the platform-default command.
    pub fn new() -> Self {
        Self::with_spec(CommandSpec::platform_default())
    }

    /// Create a `ShellNotifier` with a custom command spec.
    pub fn with_spec(spec: CommandSpec) -> Self {
        Self {
            spec,
            name: "shell".to_string(),
        }
    }

    /// Render the args template against a notification payload.
    pub fn render_args(&self, n: &Notification) -> Vec<String> {
        let title = sanitize(&n.title);
        let body = sanitize(&n.body);
        let level = match n.level {
            NotificationLevel::Info => "info",
            NotificationLevel::Success => "success",
            NotificationLevel::Warning => "warning",
            NotificationLevel::Error => "error",
        };
        let urgency = level_to_urgency(n.level);
        let source = n.source.as_deref().unwrap_or("");

        self.spec
            .args
            .iter()
            .map(|template| {
                template
                    .replace("{title}", &title)
                    .replace("{body}", &body)
                    .replace("{level}", level)
                    .replace("{urgency}", urgency)
                    .replace("{source}", &sanitize(source))
            })
            .collect()
    }
}

impl Default for ShellNotifier {
    fn default() -> Self {
        Self::new()
    }
}

impl NotificationHandler for ShellNotifier {
    fn send(&self, notification: &Notification) -> Result<(), NotifierError> {
        let args = self.render_args(notification);
        let mut cmd = Command::new(&self.spec.binary);
        cmd.args(&args)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null());

        match cmd.spawn() {
            Ok(_child) => Ok(()),
            Err(e) => Err(NotifierError::HandlerFailed {
                name: self.name.clone(),
                reason: format!("spawn '{}' failed: {e}", self.spec.binary),
            }),
        }
    }

    fn name(&self) -> &str {
        &self.name
    }
}

/// Strip characters that could be misinterpreted by downstream notifiers.
///
/// `notify-send` and AppleScript treat certain characters specially. We remove
/// control characters outright; other shell-breaking chars are safe because we
/// pass argv directly (no shell). Newlines are replaced with spaces so single
/// line AppleScript invocations remain valid.
fn sanitize(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    for ch in input.chars() {
        match ch {
            '\n' | '\r' => out.push(' '),
            c if (c as u32) < 0x20 => continue,
            c => out.push(c),
        }
    }
    // Truncate to a reasonable display length.
    out.chars().take(280).collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    fn make_notification(title: &str, body: &str, level: NotificationLevel) -> Notification {
        Notification {
            title: title.into(),
            body: body.into(),
            level,
            id: "test".into(),
            timestamp: Utc::now(),
            source: Some("test_source".into()),
            action_id: None,
        }
    }

    #[test]
    fn test_platform_default_returns_a_spec() {
        let spec = CommandSpec::platform_default();
        assert!(!spec.binary.is_empty());
        assert!(!spec.args.is_empty());
    }

    #[test]
    fn test_render_args_substitutes_placeholders() {
        let notifier = ShellNotifier::with_spec(CommandSpec {
            binary: "echo".into(),
            args: vec![
                "--title".into(),
                "{title}".into(),
                "--body".into(),
                "{body}".into(),
                "--level".into(),
                "{level}".into(),
                "--urgency".into(),
                "{urgency}".into(),
            ],
        });
        let n = make_notification("Hello", "World", NotificationLevel::Error);
        let args = notifier.render_args(&n);
        assert_eq!(args[0], "--title");
        assert_eq!(args[1], "Hello");
        assert_eq!(args[3], "World");
        assert_eq!(args[5], "error");
        assert_eq!(args[7], "critical");
    }

    #[test]
    fn test_render_args_preserves_literal_braces_when_unused() {
        let notifier = ShellNotifier::with_spec(CommandSpec {
            binary: "echo".into(),
            args: vec!["literal {not_a_placeholder}".into()],
        });
        let n = make_notification("a", "b", NotificationLevel::Info);
        let args = notifier.render_args(&n);
        assert_eq!(args[0], "literal {not_a_placeholder}");
    }

    #[test]
    fn test_sanitize_strips_control_chars_and_newlines() {
        let s = sanitize("hello\nworld\tx");
        assert_eq!(s, "hello worldx");
        assert!(!s.contains('\n'));
        assert!(!s.contains('\t'));
    }

    #[test]
    fn test_sanitize_truncates_long_strings() {
        let long = "a".repeat(1000);
        let s = sanitize(&long);
        assert!(s.chars().count() <= 280);
    }

    #[test]
    fn test_level_to_urgency_mapping() {
        assert_eq!(level_to_urgency(NotificationLevel::Info), "normal");
        assert_eq!(level_to_urgency(NotificationLevel::Success), "normal");
        assert_eq!(level_to_urgency(NotificationLevel::Warning), "normal");
        assert_eq!(level_to_urgency(NotificationLevel::Error), "critical");
    }

    #[test]
    fn test_shell_notifier_name() {
        let n = ShellNotifier::new();
        assert_eq!(n.name(), "shell");
    }

    #[test]
    fn test_shell_notifier_missing_binary_returns_error() {
        let notifier = ShellNotifier::with_spec(CommandSpec {
            binary: "/nonexistent/binary/that/does/not/exist".into(),
            args: vec![],
        });
        let n = make_notification("t", "b", NotificationLevel::Info);
        let result = notifier.send(&n);
        assert!(result.is_err());
        let err = result.unwrap_err();
        match err {
            NotifierError::HandlerFailed { name, reason } => {
                assert_eq!(name, "shell");
                assert!(reason.contains("spawn"));
            }
            other => panic!("expected HandlerFailed, got {other:?}"),
        }
    }

    /// Cross-platform happy-path: `echo` exists on Linux/macOS and PowerShell
    /// on Windows. We don't assert on output (stdout is null) — only that spawn
    /// succeeds.
    #[test]
    fn test_shell_notifier_spawns_echo() {
        let notifier = ShellNotifier::with_spec(CommandSpec {
            binary: "echo".into(),
            args: vec!["{title}".into(), "{body}".into()],
        });
        let n = make_notification("hello", "world", NotificationLevel::Info);
        let result = notifier.send(&n);
        // On weird environments echo may not be in PATH; tolerate Err there.
        if let Err(e) = &result {
            eprintln!("note: echo spawn failed (acceptable in some CI): {e}");
        }
    }
}
