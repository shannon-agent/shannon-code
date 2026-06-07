// Provider and model selector dropdown
import { useState, useEffect } from 'react'
import { listModels, switchProvider, getConfig } from '../lib/tauri-api'
import type { ModelInfo } from '../types/tauri-events'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from './ui/select'
import { Spinner } from './ui/spinner'

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
  }

  const handleModelSelect = async (model: string) => {
    setSelectedModel(model)

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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Provider:</span>
        <Select value={selectedProvider} onValueChange={handleProviderSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Provider</SelectLabel>
              {PROVIDERS.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  <span className="capitalize">{provider}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Model:</span>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="h-3 w-3" />
            Loading...
          </div>
        ) : models.length === 0 ? (
          <span className="text-sm text-muted-foreground">No models available</span>
        ) : (
          <Select value={selectedModel} onValueChange={handleModelSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Model</SelectLabel>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.name}>
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.context_window.toLocaleString()} tokens
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
