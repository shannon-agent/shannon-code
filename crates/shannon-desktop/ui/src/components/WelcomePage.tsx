// Welcome/onboarding page for first-run experience
import { useState } from 'react'
import { Zap, Settings, Keyboard, ArrowRight, Check } from 'lucide-react'
import { Button } from './ui/button'
import { Kbd } from './ui/kbd'

interface WelcomePageProps {
  onComplete: () => void
}

const STEPS = [
  {
    icon: Settings,
    title: 'Configure your provider',
    description: (
      <>
        Add your API key in Settings to get started. Shannon supports Anthropic, OpenAI, DeepSeek, and Ollama.
      </>
    ),
  },
  {
    icon: Keyboard,
    title: 'Keyboard shortcuts',
    description: (
      <div className="space-y-1.5 mt-1">
        <div className="flex items-center gap-2">
          <Kbd>Ctrl+Enter</Kbd> <span>to send</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd>Ctrl+O</Kbd> <span>to cycle view modes</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd>Ctrl+K</Kbd> <span>for commands</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd>Ctrl+L</Kbd> <span>to clear chat</span>
        </div>
      </div>
    ),
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
    <div className="flex flex-col items-center justify-center h-full bg-background p-8">
      <div className="max-w-md w-full space-y-10">
        {/* Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-primary to-purple bg-clip-text text-transparent">
              Shannon Code
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Your AI coding assistant. Let's get started.
          </p>
        </div>

        {/* Step content */}
        <div className="bg-glass-bg rounded-2xl p-6 space-y-4 border border-glass-border">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const isActive = i === currentStep
            const isDone = i < currentStep

            return (
              <div
                key={i}
                className={`flex items-start gap-3 transition-all duration-200 ${isActive ? 'opacity-100 cursor-default' : isDone ? 'opacity-50' : 'opacity-30 hover:bg-secondary rounded-md cursor-pointer'}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isDone ? 'bg-success/20 text-success' : isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-secondary-foreground">{step.title}</h3>
                  {isActive && (
                    <div className="text-[12px] text-muted-foreground mt-1 leading-relaxed animate-message-in">
                      {step.description}
                    </div>
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
              className={`w-2 h-2 rounded-full transition-colors duration-[var(--duration-normal)] ${i === currentStep ? 'bg-primary' : i < currentStep ? 'bg-success' : 'bg-border'}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onComplete}
            className="text-muted-foreground text-xs"
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
            className="gap-1.5 text-xs rounded-full px-6"
          >
            {isLast ? 'Get Started' : 'Next'}
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
