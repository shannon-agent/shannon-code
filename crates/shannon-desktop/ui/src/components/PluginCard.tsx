// Plugin card component for MCP server display
import { Check, X, ChevronDown, ChevronUp, Package, PlayCircle, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

interface Plugin {
  name: string
  command: string
  enabled: boolean
  connected: boolean
  toolCount: number
  tools?: { name: string; description: string }[]
  lastConnected?: number
}

interface PluginCardProps {
  plugin: Plugin
  onToggle?: (name: string) => void
  onRemove?: (name: string) => void
  onTestConnection?: () => void
  onRestart?: () => void
  testingConnection?: boolean
  testResult?: boolean
}

/**
 * MCP server plugin card using shadcn Card and Badge
 */
export function PluginCard({ plugin, onToggle, onRemove, onTestConnection, onRestart, testingConnection, testResult }: PluginCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleToggle = () => {
    onToggle?.(plugin.name)
  }

  const handleRemove = () => {
    if (showConfirm) {
      onRemove?.(plugin.name)
      setShowConfirm(false)
    } else {
      setShowConfirm(true)
    }
  }

  const handleCancelRemove = () => {
    setShowConfirm(false)
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const getHealthStatus = () => {
    if (testingConnection) return 'testing'
    if (testResult === true) return 'healthy'
    if (testResult === false) return 'unhealthy'
    if (plugin.connected) return 'healthy'
    return 'unknown'
  }

  const healthStatus = getHealthStatus()

  const healthColor = {
    healthy: 'bg-success',
    unhealthy: 'bg-destructive',
    testing: 'bg-warning',
    unknown: 'bg-muted-foreground'
  }[healthStatus]

  return (
    <Card className="overflow-hidden transition-all">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Icon + Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`
              p-2 rounded-lg flex-shrink-0
              ${plugin.connected ? 'bg-success/20' : 'bg-destructive/20'}
            `}>
              <Package
                size={20}
                className={plugin.connected ? 'text-success' : 'text-destructive'}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="truncate text-base">{plugin.name}</CardTitle>
                {/* Server health indicator */}
                <div className={`w-2 h-2 rounded-full ${healthColor}`} title={healthStatus} />
              </div>
              <CardDescription className="mt-1">
                <div className="flex items-center gap-2">
                  <Badge variant={plugin.connected ? 'success' : 'error'}>
                    {plugin.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                  <span className="text-xs">
                    {plugin.toolCount} tools
                  </span>
                  {/* Last connected timestamp */}
                  {plugin.lastConnected && (
                    <span className="text-xs flex items-center gap-1">
                      {formatTimestamp(plugin.lastConnected)}
                    </span>
                  )}
                </div>
              </CardDescription>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Test Connection Button */}
            {onTestConnection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onTestConnection}
                disabled={testingConnection}
                className="h-8 w-8 p-0"
                aria-label={`Test connection to ${plugin.name}`}
                title="Test connection"
              >
                <PlayCircle size={16} className={testingConnection ? 'animate-pulse text-warning' : ''} />
              </Button>
            )}

            {/* Restart Server Button */}
            {onRestart && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRestart}
                className="h-8 w-8 p-0"
                aria-label={`Restart ${plugin.name}`}
                title="Restart server"
              >
                <RefreshCw size={16} />
              </Button>
            )}

            {/* Enable/Disable Toggle */}
            {onToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                className={`h-8 w-8 p-0 ${plugin.enabled ? 'text-success' : 'text-muted-foreground'}`}
                aria-label={`${plugin.enabled ? 'Disable' : 'Enable'} ${plugin.name}`}
              >
                {plugin.enabled ? <Check size={16} /> : <X size={16} />}
              </Button>
            )}

            {/* Expand/Collapse Button */}
            {plugin.tools && plugin.tools.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} tools list`}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            )}

            {/* Remove Button */}
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className={`h-8 w-8 p-0 ${showConfirm ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                aria-label={`Remove ${plugin.name}`}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-foreground mb-2">
              Remove {plugin.name}? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleRemove}>
                Remove
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancelRemove}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      {/* Expandable Tools List */}
      {isExpanded && plugin.tools && plugin.tools.length > 0 && (
        <>
          <Separator />
          <CardContent className="px-4 pt-3 pb-2">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Tools ({plugin.tools.length})</h4>
            <div className="space-y-2">
              {plugin.tools.map((tool) => (
                <div
                  key={tool.name}
                  className="p-2 rounded bg-background hover:bg-secondary transition-colors"
                >
                  <div className="text-sm text-foreground font-medium">{tool.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{tool.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </>
      )}

      {/* Command Info */}
      <CardFooter className="px-4 pb-3 pt-2">
        <code className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
          {plugin.command}
        </code>
      </CardFooter>
    </Card>
  )
}
