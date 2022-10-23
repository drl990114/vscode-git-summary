import * as vscode from 'vscode'
import path from 'path'

let elements: any[] = []

const PATH = 'path'
const SUMMARY = 'summary'

class TreeDataProvider {
  _context: vscode.ExtensionContext
  _onDidChangeTreeData: vscode.EventEmitter<unknown>
  onDidChangeTreeData: any
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
    } else if (element.type === PATH) {
      if (element.elements && element.elements.length > 0) {
        return element.elements
      } else {
        return element.hunks
      }
    } else if (element.type === SUMMARY) {
      return element.text
    }
  }

  getTreeItem(element: any) {
    const treeItem = new vscode.TreeItem(element.name)
    treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None

    if (element.type === PATH) {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
    } else if (element.type === SUMMARY) {
      treeItem.command = {
        command: 'git-summary.reveal',
        title: '',
        arguments: [element.file, element.line],
      }
    }

    return treeItem
  }

  clear() {
    elements = []
    this._onDidChangeTreeData.fire()
  }

  add(root: any, match: any) {
    const parts = match.file.split(path.sep)

    function findSubPath(e) {
      return e.type === PATH && e.name === this
    }

    let pathElement: any
    let parent = elements
    parts.map(function (p) {
      const child = parent.find(findSubPath, p)
      if (!child) {
        pathElement = {
          type: PATH,
          name: p,
          elements: [],
          hunks: [],
        }
        parent.push(pathElement)
        parent = pathElement.elements
      } else {
        pathElement = child
        parent = pathElement.elements
      }
    })

    const diffElement = {
      type: SUMMARY,
      name: match.match.substr(match.column - 1),
      line: match.line - 1,
      file: path.join(root, match.file),
    }

    pathElement.hunks.push(diffElement)

    this._onDidChangeTreeData.fire()
  }

  refresh(html: any) {
    this._onDidChangeTreeData.fire()
  }
}

export default TreeDataProvider
