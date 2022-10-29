import * as vscode from 'vscode'
import gitDiffParser from 'gitdiff-parser'
import type { API, GitExtension } from './types/git'
import TreeDataProvider, { getElementByName } from './tree'
import { getDiffFileLines, getDiffSummaryDesc } from './tool'

const getGitApi = (): Promise<API> => {
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

let statusBarItem: vscode.StatusBarItem
let provider: TreeDataProvider

export async function activate(ctx: vscode.ExtensionContext) {
  const { subscriptions } = ctx
  const gitApi = await getGitApi()
  provider = new TreeDataProvider(ctx)
  vscode.window.registerTreeDataProvider('git-summary', provider)

  function refreshTree() {
    provider.clear()
    let root = vscode.workspace.getConfiguration('git-summary').rootFolder
    if (root === '') {
      if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        root = vscode.workspace.workspaceFolders[0].uri.fsPath
      }
 else {
        return
      }
    }
    const repos = gitApi.repositories

    repos[0]?.diff().then((res) => {
      if (res.length === 0) {
        // no change
      }
 else {
        const diffList = gitDiffParser.parse(res)

        diffList.forEach((d) => provider.add(root, d))
        updateStatusBarItem()
        console.log('diff-----------', diffList, root)
      }
    })
  }

  vscode.commands.registerCommand('git-summary.reveal', (file, line) => {
    vscode.workspace.openTextDocument(file).then(function (document) {
      vscode.window.showTextDocument(document).then(function (editor) {
        const position = new vscode.Position(line, 0)
        editor.selection = new vscode.Selection(position, position)
        editor.revealRange(editor.selection, vscode.TextEditorRevealType.Default)
        vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup')
      })
    })
  })

  ctx.subscriptions.push(vscode.commands.registerCommand('git-summary.refresh', refreshTree))

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 10000)
  subscriptions.push(statusBarItem)
  subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem))
  subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem))
  subscriptions.push(vscode.window.onDidChangeActiveNotebookEditor(updateStatusBarItem))

  refreshTree()
}

async function updateStatusBarItem(): Promise<void> {
  const gitApi = await getGitApi()
  const repos = gitApi.repositories
  if (repos[0]) {
    const activeTextEditor = vscode.window.activeTextEditor
    if (activeTextEditor) {
      const rootUrl = repos[0].rootUri.path
      const targetUrl = activeTextEditor.document.uri.path
      const p = targetUrl.substring(rootUrl.length + 1)
      const el = getElementByName(p)
      if (el) {
        const changeLines = getDiffFileLines(el)
        statusBarItem.text = `$(megaphone) ${changeLines ? getDiffSummaryDesc(changeLines) : 'nochange'}`
      }
 else {
        statusBarItem.text = '$(megaphone) untracked'
      }

      statusBarItem.show()
    }
  }
}
