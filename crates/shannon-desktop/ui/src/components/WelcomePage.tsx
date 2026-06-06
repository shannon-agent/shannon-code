// Welcome/onboarding page for first-run experience
import { useState } from 'react'
import { Zap, Settings, Keyboard, ArrowRight, Check } from 'lucide-react'
import { Button } from './ui/button'

interface WelcomePageProps {
  onComplete: () => void
}

const STEPS = [
  {
    icon: Settings,
    title: 'Configure your provider',
    description: 'Add your API key in Settings to get started. Shannon supports Anthropic, OpenAI, DeepSeek, and Ollama.',
  },
  {
    icon: Keyboard,
    title: 'Keyboard shortcuts',
    description: 'Ctrl+Enter to send, Ctrl+O to cycle view modes, Ctrl+K for commands, Ctrl+L to clear chat.',
  },
  {
    icon: Zap,
    title: 'Start building',
    description: 'Ask Shannon to write code, fix bugs, refactor, or explore your codebase. It can run commands and edit files.',
  },
]

export function WelcomePage({ onComplete }: WelcomePageProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const isLast = currentStep === STEPS.length - 1

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[var(--bg-primary)] p-8">
      <div className="max-w-md w-full space-y-8">
        {/* Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Shannon Code
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Your AI coding assistant. Let's get started.
          </p>
        </div>

        {/* Step content */}
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6 space-y-4 border border-[var(--border)]">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const isActive = i === currentStep
            const isDone = i < currentStep

            return (
              <div
                key={i}
                className={`flex items-start gap-3 transition-opacity duration-[var(--duration-normal)] ${isActive ? 'opacity-100' : isDone ? 'opacity-50' : 'opacity-30'}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isDone ? 'bg-[var(--success)]/20 text-[var(--success)]' : isActive ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-input)] text-[var(--text-muted)]'}`}>
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)]">{step.title}</h3>
                  {isActive && (
                    <p className="text-[12px] text-[var(--text-muted)] mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-[var(--duration-normal)] ${i === currentStep ? 'bg-[var(--accent)]' : i < currentStep ? 'bg-[var(--success)]' : 'bg-[var(--border)]'}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onComplete}
            className="text-[var(--text-muted)] text-xs"
          >
            Skip
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (isLast) {
                onComplete()
              } else {
                setCurrentStep(i => i + 1)
              }
            }}
            className="gap-1.5 text-xs"
          >
            {isLast ? 'Get Started' : 'Next'}
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
