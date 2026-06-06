// Provider and model selector dropdown
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { listModels, switchProvider, getConfig } from '../lib/tauri-api'
import type { ModelInfo } from '../types/tauri-events'

interface ModelSelectorProps {
  currentProvider: string
  currentModel: string
  onProviderChange?: (provider: string, model: string) => void
}

const PROVIDERS = ['anthropic', 'openai', 'deepseek', 'ollama'] as const

export function ModelSelector({
  currentProvider,
  currentModel,
  onProviderChange
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(currentProvider)
  const [selectedModel, setSelectedModel] = useState(currentModel)
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSelectedProvider(currentProvider)
    setSelectedModel(currentModel)
  }, [currentProvider, currentModel])

  const loadModels = async (_provider: string) => {
    try {
      setLoading(true)
      const data = await listModels()
      setModels(data)
    } catch (error) {
      console.error('Failed to load models:', error)
      setModels([])
    } finally {
      setLoading(false)
    }
  }

  const handleProviderSelect = async (provider: string) => {
    setSelectedProvider(provider)
    await loadModels(provider)
    void provider // Silence unused warning
  }

  const handleModelSelect = async (model: string) => {
    setSelectedModel(model)
    setIsOpen(false)

    try {
      const config = await getConfig()
      await switchProvider({
        provider: selectedProvider,
        api_key: config.api_key,
        base_url: config.base_url,
        model
      })
      onProviderChange?.(selectedProvider, model)
    } catch (error) {
      console.error('Failed to switch provider/model:', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-[#1a1b26] border border-[#414868] rounded-lg hover:border-[#7aa2f7] transition-colors"
      >
        <span className="text-[#a9b1d6]">
          <span className="text-[#565f89]">Provider:</span>{' '}
          <span className="capitalize">{selectedProvider}</span>
          {' '}
          <span className="text-[#565f89]">•</span> {selectedModel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#565f89] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-[#24283b] border border-[#414868] rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {/* Provider Selection */}
          <div className="p-2 border-b border-[#414868]">
            <div className="text-xs text-[#565f89] px-2 mb-1">Provider</div>
            {PROVIDERS.map((provider) => (
              <button
                key={provider}
                onClick={() => handleProviderSelect(provider)}
                className={`w-full px-3 py-2 rounded text-left capitalize transition-colors ${
                  selectedProvider === provider
                    ? 'bg-[#7aa2f7]/20 text-[#7aa2f7]'
                    : 'hover:bg-[#1a1b26] text-[#a9b1d6]'
                }`}
              >
                {provider}
              </button>
            ))}
          </div>

          {/* Model Selection */}
          <div className="p-2">
            <div className="text-xs text-[#565f89] px-2 mb-1">Model</div>
            {loading ? (
              <div className="px-3 py-2 text-[#565f89] text-sm">Loading...</div>
            ) : models.length === 0 ? (
              <div className="px-3 py-2 text-[#565f89] text-sm">
                No models available
              </div>
            ) : (
              models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.name)}
                  className={`w-full px-3 py-2 rounded text-left text-sm transition-colors ${
                    selectedModel === model.name
                      ? 'bg-[#7aa2f7]/20 text-[#7aa2f7]'
                      : 'hover:bg-[#1a1b26] text-[#a9b1d6]'
                  }`}
                >
                  <div>{model.name}</div>
                  <div className="text-xs text-[#565f89]">
                    {model.context_window.toLocaleString()} tokens
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
