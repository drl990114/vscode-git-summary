import * as vscode from 'vscode'
import type { File } from 'gitdiff-parser'
import { getDiffHunkDesc } from './tool'

import path from 'path'
import { ElType } from './types/main'

let elements: any[] = []
class TreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  _context: vscode.ExtensionContext
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>()
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event

  constructor(_context: vscode.ExtensionContext) {
    this._context = _context
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
  }

  getChildren(element: any) {
    if (!element) {
      if (elements.length > 0) {
        return elements
      }
      return [{ name: 'Nothing found' }]
    } else if (element.type === ElType.FILE) {
      return element.hunks
    } else if (element.type === ElType.SUMMARY) {
      return element.name
    }
  }

  getTreeItem(element: any): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.name)
    treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None
    if (element.type === ElType.FILE) {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
    } else if (element.type === ElType.SUMMARY) {
      treeItem.command = {
        command: 'git-summary.reveal',
        title: '',
        arguments: [element.filePath, element.line],
      }
    }

    return treeItem
  }

  clear() {
    elements = []
    this._onDidChangeTreeData.fire()
  }

  add(root: string, match: File) {
    const filePath = path.join(root, match.oldPath)
    elements.push({
      ...match,
      type: ElType.FILE,
      name: match.oldPath,
      hunks: match.hunks.map((hunk) => {
        return {
          ...hunk,
          type: ElType.SUMMARY,
          name: getDiffHunkDesc(hunk),
          filePath,
          line: hunk.newStart,
        }
      }),
    })
    this._onDidChangeTreeData.fire()
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }
}

export function getElementByName(name: string) {
  return elements.find((el) => el.name === name)
}

export default TreeDataProvider
