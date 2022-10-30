import * as vscode from 'vscode'
import type { File, Hunk } from 'gitdiff-parser'
import type { ChangeSummary } from './types/main'
import type { API, GitExtension } from './types/git'

export function getGitApi(): Promise<API> {
  return new Promise((resolve) => {
    const fn = async () => {
      const extensions = vscode.extensions
      const gtiExtension = extensions.getExtension<GitExtension>('vscode.git')
      if (!gtiExtension?.isActive) {
        await gtiExtension?.activate()
      }
      const api = gtiExtension!.exports.getAPI(1)
      // Wait for the API to get initialized.
      api.onDidChangeState(() => {
        if (api.state === 'initialized') {
          resolve(api)
        }
      })
      if (api.state === 'initialized') {
        resolve(api)
      }
    }
    fn()
  })
}

export function getDiffSummaryDesc(summary: ChangeSummary) {
  const { addLines, deleteLines } = summary
  return `-${deleteLines} +${addLines}`
}

export function getDiffHunkDesc(hunk: Hunk) {
  const changeSummaryDesc = getDiffSummaryDesc(getDiffHunkLines(hunk))
  return `Ln ${hunk.newStart}, ${changeSummaryDesc}`
}

export function getDiffFileLines(file: File): ChangeSummary {
  let addLines = 0
  let deleteLines = 0
  file.hunks.forEach((hunk) => {
    const { addLines: al, deleteLines: dl } = getDiffHunkLines(hunk)
    addLines += al
    deleteLines += dl
  })

  return {
    addLines,
    deleteLines,
  }
}

export function getDiffHunkLines(hunk: Hunk): ChangeSummary {
  let addLines = 0
  let deleteLines = 0

  hunk.changes.forEach((change) => {
    if (change.type === 'insert') {
      ++addLines
    }
    else if (change.type === 'delete') {
      ++deleteLines
    }
  })

  return {
    addLines,
    deleteLines,
  }
}
