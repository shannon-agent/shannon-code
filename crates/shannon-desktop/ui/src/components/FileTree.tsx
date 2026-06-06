// File tree explorer with expand/collapse and file status indicators
import { useState, useCallback, useEffect } from 'react'
import {
  ChevronRight, ChevronDown, Folder, FolderOpen, File, FileCode,
  FileText, FileJson, Image, Lock, GitBranch
} from 'lucide-react'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  modified?: boolean
  size?: number
}

interface FileTreeProps {
  rootPath?: string
  onFileSelect?: (path: string) => void
  onRefresh?: () => Promise<FileNode[]>
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
}: {
  node: FileNode
  depth: number
  onFileSelect?: (path: string) => void
  modifiedFiles?: Set<string>
  selectedFile?: string
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

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-1.5 py-[3px] pr-2 cursor-pointer rounded-sm transition-colors duration-100 group ${
          isSelected
            ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isDir ? (
          expanded ? (
            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-muted)]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-muted)]" />
          )
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}
        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${
          isDir ? 'text-[var(--warning)]' : isModified ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'
        }`} />
        <span className="text-[12px] truncate flex-1">{node.name}</span>
        {isModified && !isDir && (
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] flex-shrink-0" />
        )}
      </div>
      {isDir && expanded && node.children && (
        <div>
          {sortNodes(node.children).map(child => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
              modifiedFiles={modifiedFiles}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileTree({
  rootPath,
  onFileSelect,
  onRefresh,
  modifiedFiles,
  selectedFile,
}: FileTreeProps) {
  const [tree, setTree] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(false)

  const loadTree = useCallback(async () => {
    if (onRefresh) {
      setLoading(true)
      try {
        const data = await onRefresh()
        setTree(data)
      } finally {
        setLoading(false)
      }
    }
  }, [onRefresh])

  useEffect(() => {
    loadTree()
  }, [loadTree])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">Files</span>
        </div>
        {modifiedFiles && modifiedFiles.size > 0 && (
          <span className="text-[10px] text-[var(--success)]">{modifiedFiles.size} modified</span>
        )}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="p-3 text-center">
            <div className="animate-spin w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : tree.length === 0 ? (
          <div className="p-3 text-center text-[var(--text-muted)] text-[11px]">
            {rootPath ? 'No files found' : 'Open a project to browse files'}
          </div>
        ) : (
          sortNodes(tree).map(node => (
            <FileTreeNode
              key={node.path}
              node={node}
              depth={0}
              onFileSelect={onFileSelect}
              modifiedFiles={modifiedFiles}
              selectedFile={selectedFile}
            />
          ))
        )}
      </div>
    </div>
  )
}

export type { FileNode, FileTreeProps }
