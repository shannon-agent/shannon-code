// File tree explorer with expand/collapse and file status indicators
import { useState, useCallback, useEffect } from 'react'
import {
  ChevronRight, Folder, FolderOpen, File, FileCode,
  FileText, FileJson, Image, Lock, GitBranch, RefreshCw
} from 'lucide-react'
import { getFileTree, getWorkingDirInfo } from '../lib/tauri-api'
import type { FileNode } from '../lib/tauri-api'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible'
import { Spinner } from './ui/spinner'
import { cn } from '../lib/utils'

interface FileTreeProps {
  rootPath?: string
  onFileSelect?: (path: string) => void
  modifiedFiles?: Set<string>
  selectedFile?: string
}

const FILE_ICONS: Record<string, typeof File> = {
  ts: FileCode, tsx: FileCode, js: FileCode, jsx: FileCode,
  rs: FileCode, py: FileCode, go: FileCode, rb: FileCode, java: FileCode,
  json: FileJson, yaml: FileText, yml: FileText, toml: FileText,
  md: FileText, txt: FileText, css: FileCode, html: FileCode,
  png: Image, jpg: Image, svg: Image, gif: Image, webp: Image,
  lock: Lock,
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return FILE_ICONS[ext] || File
}

function sortNodes(nodes: FileNode[]): FileNode[] {
  return [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

function FileTreeNode({
  node,
  depth,
  onFileSelect,
  modifiedFiles,
  selectedFile,
  onKeyDown,
  onFocus,
  tabIndex,
  'data-node-path': dataNodePath,
}: {
  node: FileNode
  depth: number
  onFileSelect?: (path: string) => void
  modifiedFiles?: Set<string>
  selectedFile?: string
  onKeyDown?: (e: React.KeyboardEvent, node: FileNode) => void
  onFocus?: (node: FileNode) => void
  tabIndex?: number
  'data-node-path'?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const isDir = node.type === 'directory'
  const isModified = modifiedFiles?.has(node.path)
  const isSelected = selectedFile === node.path
  const Icon = isDir ? (expanded ? FolderOpen : Folder) : getFileIcon(node.name)

  const handleClick = useCallback(() => {
    if (isDir) {
      setExpanded(prev => !prev)
    } else {
      onFileSelect?.(node.path)
    }
  }, [isDir, node.path, onFileSelect])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    onKeyDown?.(e, node)

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    } else if (e.key === 'ArrowRight' && isDir && !expanded) {
      e.preventDefault()
      setExpanded(true)
    } else if (e.key === 'ArrowLeft' && isDir && expanded) {
      e.preventDefault()
      setExpanded(false)
    }
  }, [node, isDir, expanded, handleClick, onKeyDown])

  const handleFocus = useCallback(() => {
    onFocus?.(node)
  }, [node, onFocus])

  if (isDir) {
    return (
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <div
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            tabIndex={tabIndex}
            role="treeitem"
            aria-expanded={expanded}
            aria-selected={isSelected}
            aria-level={depth + 1}
            aria-label={`${node.name}${isModified ? ' (modified)' : ''}`}
            data-node-path={dataNodePath}
            className={cn(
              'flex items-center gap-1.5 py-1 pr-2 cursor-pointer rounded-sm transition-all duration-150 group outline-none focus-visible:ring-1 focus-visible:ring-ring w-full',
              isSelected
                ? 'bg-primary/15 text-primary'
                : 'text-secondary-foreground hover:bg-secondary'
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            <ChevronRight className={cn(
              'w-3.5 h-3.5 flex-shrink-0 text-muted-foreground transition-transform duration-150',
              expanded && 'rotate-90'
            )} aria-hidden />
            <Icon className={cn(
              'w-3.5 h-3.5 flex-shrink-0',
              isDir ? 'text-warning' : isModified ? 'text-success' : 'text-muted-foreground'
            )} aria-hidden />
            <span className="text-[12px] truncate flex-1 text-left">{node.name}</span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div role="group">
            {node.children && sortNodes(node.children).map(child => (
              <FileTreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                onFileSelect={onFileSelect}
                modifiedFiles={modifiedFiles}
                selectedFile={selectedFile}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                tabIndex={-1}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  // File node (non-collapsible)
  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      tabIndex={tabIndex}
      role="treeitem"
      aria-selected={isSelected}
      aria-level={depth + 1}
      aria-label={`${node.name}${isModified ? ' (modified)' : ''}`}
      data-node-path={dataNodePath}
      className={cn(
        'flex items-center gap-1.5 py-1 pr-2 cursor-pointer rounded-sm transition-all duration-150 group outline-none focus-visible:ring-1 focus-visible:ring-ring',
        isSelected
          ? 'bg-primary/15 text-primary'
          : 'text-secondary-foreground hover:bg-secondary'
      )}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <span className="w-3.5 flex-shrink-0" />
      <Icon className={cn(
        'w-3.5 h-3.5 flex-shrink-0',
        isModified ? 'text-success' : 'text-muted-foreground'
      )} aria-hidden />
      <span className="text-[12px] truncate flex-1">{node.name}</span>
      {isModified && (
        <span className="w-2 h-2 rounded-full bg-success flex-shrink-0" aria-label="modified" />
      )}
    </div>
  )
}

export function FileTree({
  rootPath,
  onFileSelect,
  modifiedFiles,
  selectedFile,
}: FileTreeProps) {
  const [tree, setTree] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(false)
  const [branch, setBranch] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [_focusedNode, setFocusedNode] = useState<FileNode | null>(null)
  const [flatNodes, setFlatNodes] = useState<FileNode[]>([])

  const loadTree = useCallback(async () => {
    if (!rootPath) return

    setLoading(true)
    setError(null)
    try {
      const [treeData, dirInfo] = await Promise.all([
        getFileTree(rootPath),
        getWorkingDirInfo()
      ])

      const treeArray = Array.isArray(treeData) ? treeData : [treeData]
      setTree(treeArray)
      setBranch(dirInfo.branch)

      const flattenNodes = (nodes: FileNode[]): FileNode[] => {
        const result: FileNode[] = []
        const traverse = (node: FileNode) => {
          result.push(node)
          if (node.type === 'directory' && node.children) {
            node.children.forEach(traverse)
          }
        }
        nodes.forEach(traverse)
        return result
      }
      setFlatNodes(flattenNodes(treeArray))

      if (dirInfo.modified_files.length > 0 && onFileSelect) {
        // The parent component should handle modifiedFiles prop
      }
    } catch (err) {
      console.error('Failed to load file tree:', err)
      setError(err instanceof Error ? err.message : 'Failed to load file tree')
    } finally {
      setLoading(false)
    }
  }, [rootPath, onFileSelect])

  useEffect(() => {
    loadTree()
  }, [loadTree])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, node: FileNode) => {
    const currentIndex = flatNodes.findIndex(n => n.path === node.path)
    if (currentIndex === -1) return

    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        newIndex = Math.min(currentIndex + 1, flatNodes.length - 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        newIndex = Math.max(currentIndex - 1, 0)
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = flatNodes.length - 1
        break
      default:
        return
    }

    if (newIndex !== currentIndex) {
      const nextNode = flatNodes[newIndex]
      const nextElement = document.querySelector(`[data-node-path="${nextNode.path}"]`) as HTMLElement
      nextElement?.focus()
    }
  }, [flatNodes])

  const handleFocus = useCallback((node: FileNode) => {
    setFocusedNode(node)
  }, [])

  return (
    <div className="flex flex-col h-full" role="tree" aria-label="File tree">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-secondary border-b border-border">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-primary" aria-hidden />
          <span className="text-xs font-medium text-secondary-foreground">Files</span>
          {branch && (
            <span className="text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded">
              {branch}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {modifiedFiles && modifiedFiles.size > 0 && (
            <span className="text-[10px] text-success" aria-label={`${modifiedFiles.size} modified files`}>
              {modifiedFiles.size} modified
            </span>
          )}
          <button
            onClick={loadTree}
            disabled={loading}
            className="p-1 hover:bg-background rounded transition-colors"
            title="Refresh file tree"
            aria-label="Refresh file tree"
          >
            {loading ? (
              <Spinner className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1" role="group" aria-label="Files and folders">
        {loading ? (
          <div className="p-3 text-center" role="status">
            <Spinner className="mx-auto" />
          </div>
        ) : error ? (
          <div className="p-3 text-center text-destructive text-[11px]" role="alert">
            {error}
          </div>
        ) : tree.length === 0 ? (
          <div className="p-3 text-center text-muted-foreground text-[11px]" role="status">
            {rootPath ? 'No files found' : 'Open a project to browse files'}
          </div>
        ) : (
          sortNodes(tree).map((node, index) => (
            <FileTreeNode
              key={node.path}
              node={node}
              depth={0}
              onFileSelect={onFileSelect}
              modifiedFiles={modifiedFiles}
              selectedFile={selectedFile}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              tabIndex={index === 0 ? 0 : -1}
              data-node-path={node.path}
            />
          ))
        )}
      </div>
    </div>
  )
}

export type { FileTreeProps }
