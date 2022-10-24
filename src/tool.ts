import { Hunk } from 'gitdiff-parser'

export function handleHunkName(hunk: Hunk) {
  const {addLines , deleteLines} = getDiffHunkLines(hunk)
  return `${deleteLines}-+${addLines}`
}

function getDiffHunkLines(hunk: Hunk) {
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
