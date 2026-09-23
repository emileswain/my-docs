// Frontend adapter for the Rust file engine (Strategy C).
//
// This replaces HTTP `fetch('/api/...')` calls and the `/api/events`
// EventSource with Tauri IPC:
//   - request/response  -> invoke('command_name', args)
//   - server push (SSE) -> listen('fs-change', handler)
//
// Migration plan: point the existing fileService/settingsService functions at
// these wrappers one route at a time. Nothing here talks to Flask.

import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'

export interface DirEntry {
  name: string
  path: string
  is_dir: boolean
  extension: string
  size: number
  modified_ms: number
}

export interface DocNode {
  kind: string
  label: string
  value?: string
  children?: DocNode[]
}

export interface EngineStatus {
  running: boolean
  watched_roots: number
  uptime_secs: number
  cache_entries: number
}

/** Browse the immediate children of a folder. Was: GET /api/.../browse */
export function listDir(path: string): Promise<DirEntry[]> {
  return invoke('list_dir', { path })
}

/** Raw text content of a file. Was: GET /api/file/:path */
export function readFile(path: string): Promise<string> {
  return invoke('read_file', { path })
}

/** Parsed document tree for a file. */
export function parseFile(path: string): Promise<DocNode[]> {
  return invoke('parse_file', { path })
}

/** Add a folder to the watch set. Was: POST /api/.../watches */
export function addWatchRoot(path: string): Promise<EngineStatus> {
  return invoke('add_watch_root', { path })
}

/** Current engine health. */
export function engineStatus(): Promise<EngineStatus> {
  return invoke('engine_status')
}

/** Restart the engine (also available from the native menu). */
export function restartEngine(): Promise<EngineStatus> {
  return invoke('restart_engine')
}

/** Batch of filesystem paths that just changed. */
export interface FsChange {
  paths: string[]
}

/**
 * Subscribe to filesystem-change pushes. Replaces the `/api/events`
 * EventSource. Returns an unlisten function — call it on cleanup.
 */
export function onFsChange(handler: (change: FsChange) => void): Promise<UnlistenFn> {
  return listen<FsChange>('fs-change', (event) => handler(event.payload))
}
