import * as vscode from 'vscode'
import gitDiffParser from 'gitdiff-parser'
import { API, GitExtension, RefType } from './types/git'

let myStatusBarItem: vscode.StatusBarItem

export async function activate(ctx: vscode.ExtensionContext) {
  const { subscriptions } = ctx
  // register a command that is invoked when the status bar
  // item is selected
  const orange = vscode.window.createOutputChannel('Orange')
  orange.appendLine('I am a banana.')
  console.log('vscode.window', vscode.window)
  // getGitApi
  const gitApi = await getGitApi()
  console.log('gitApi.repositories', gitApi.repositories)

  const repos = gitApi.repositories
  if (repos[0]) {
    vscode.window.onDidChangeActiveTextEditor((...args) => {
      const activeTextEditor = vscode.window.activeTextEditor
      if (activeTextEditor) {
        const rootUrl = repos[0].rootUri.path
        const targetUrl = activeTextEditor.document.uri.path
        const p = targetUrl.substring(rootUrl.length + 1)
        repos[0].diffWith(repos[0].state.refs[0].name || '', p).then((res) => {
          if (res.length === 0) {
            // no change
          } else {
            console.log('diff', gitDiffParser.parse(res), typeof res)
          }
        })
      }

      console.log('onDidChangeActiveTextEditor', args)
    })
  }
  console.log('ctx', ctx)
  const myCommandId = 'git.summary'
  subscriptions.push(
    vscode.commands.registerCommand(myCommandId, () => {
      const quickPick = vscode.window.createQuickPick()
      quickPick.items = [
        {
          label: 'test',
        },
        {
          label: 'test1',
        },
      ]
      quickPick.onDidChangeSelection((e) => {
        console.log('change', e)
      })
      quickPick.show()
    })
  )
  // create a new status bar item that we can now manage
  myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 10000)
  myStatusBarItem.command = myCommandId
  subscriptions.push(myStatusBarItem)

  // register some listener that make sure the status bar
  // item always up-to-date
  subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem))
  subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem))
  subscriptions.push(vscode.window.onDidChangeActiveNotebookEditor(updateStatusBarItem))
  // update status bar item once at start
  updateStatusBarItem()
}

function updateStatusBarItem(): void {
  myStatusBarItem.text = '$(megaphone) git-summary'
  myStatusBarItem.show()
}

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
