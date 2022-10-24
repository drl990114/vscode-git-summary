import { File } from 'gitdiff-parser'
import * as vscode from 'vscode'
import path from 'path'
import { handleHunkName } from './tool'

let elements: any[] = []

const FILE = 'file'
const SUMMARY = 'summary'

class TreeDataProvider {
  _context: vscode.ExtensionContext
  _onDidChangeTreeData: vscode.EventEmitter<unknown>
  onDidChangeTreeData: vscode.Event<any>
  constructor(_context: vscode.ExtensionContext) {
    this._context = _context

    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
  }

  getChildren(element: any) {
    console.log('getChildren', element)

    if (!element) {
      if (elements.length > 0) {
        return elements
      }
      return [{ name: 'Nothing found' }]
    } else if (element.type === FILE) {
      return element.hunks
    } else if (element.type === SUMMARY) {
      return element.name
    }
  }

  getTreeItem(element: any) {
    console.log('getTreeItem', element)

    const treeItem = new vscode.TreeItem(element.name)
    treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None

    if (element.type === FILE) {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
    } else if (element.type === SUMMARY) {
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
    this._onDidChangeTreeData.fire(this.onDidChangeTreeData)
  }

  add(root: any, match: File) {
    const filePath = path.join(root, match.oldPath)
    elements.push({
      ...match,
      type: FILE,
      name: match.oldPath,
      hunks: match.hunks.map((hunk) => {
        return {
          ...hunk,
          type: SUMMARY,
          name: handleHunkName(hunk),
          filePath,
          line: hunk.newStart
        }
      }),
    })
    this._onDidChangeTreeData.fire(this.onDidChangeTreeData)
  }

  refresh(html: any) {
    this._onDidChangeTreeData.fire(this.onDidChangeTreeData)
  }
}

export default TreeDataProvider
