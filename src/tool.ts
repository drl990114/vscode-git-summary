import { Hunk, File } from 'gitdiff-parser'
import type { ChangeSummary } from './types/main'

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
    } else if (change.type === 'delete') {
      ++deleteLines
    }
  })

  return {
    addLines,
    deleteLines,
  }
}
