const vscode = require('vscode');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

/**
 * Bilibili AI 娘化桌寵 - VS Code / Antigravity Extension Host (全繁體中文版)
 * 功能：
 * 1. 提供 SidePanel Webview 桌寵互動介面（內嵌去背立繪與真實貓叫語音，確保 100% 載入）。
 * 2. 串接 Local LLM (Ollama) + Edge-TTS + FFmpeg 聲線濾波器 (src/voice_engine.py)。
 * 3. 自動監聽 Antigravity 最新 Prompt 回覆，並同步至桌寵「Prompt 回覆語音播報 Card」。
 */

function findPythonBin() {
  const candidates = [
    path.join(os.homedir(), 'miniconda3', 'bin', 'python3'),
    '/usr/bin/python3',
    'python3'
  ];
  for (const c of candidates) {
    if (c === 'python3' || fs.existsSync(c)) return c;
  }
  return 'python3';
}

function getLatestAntigravityReply() {
  try {
    const geminiDir = path.join(os.homedir(), '.gemini');
    const brainRoots = [
      path.join(geminiDir, 'antigravity', 'brain'),
      path.join(geminiDir, 'antigravity-ide', 'brain')
    ];

    let newestTranscript = null;
    let newestMtime = 0;

    for (const root of brainRoots) {
      if (!fs.existsSync(root)) continue;
      const convDirs = fs.readdirSync(root);
      for (const conv of convDirs) {
        const tPath = path.join(root, conv, '.system_generated', 'logs', 'transcript.jsonl');
        if (fs.existsSync(tPath)) {
          const stat = fs.statSync(tPath);
          if (stat.mtimeMs > newestMtime) {
            newestMtime = stat.mtimeMs;
            newestTranscript = tPath;
          }
        }
      }
    }

    if (!newestTranscript) return null;

    const content = fs.readFileSync(newestTranscript, 'utf8');
    const lines = content.trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const step = JSON.parse(lines[i]);
        if (
          step.type === 'PLANNER_RESPONSE' &&
          step.status === 'DONE' &&
          typeof step.content === 'string' &&
          step.content.trim().length > 0 &&
          (!step.tool_calls || step.tool_calls.length === 0)
        ) {
          return {
            id: `${newestTranscript}:${step.step_index || i}`,
            text: step.content.trim()
          };
        }
      } catch (_) {}
    }
  } catch (_) {}
  return null;
}

class HajimiPetViewProvider {
  constructor(extensionUri) {
    this._extensionUri = extensionUri;
    this._view = undefined;
    this._panels = new Set();
    this._lastReplyId = null;

    // 記錄啟動當下的最新回覆 ID，之後有新回覆時即觸發自動播報
    const initial = getLatestAntigravityReply();
    if (initial) {
      this._lastReplyId = initial.id;
    }

    // 定期檢查是否有新的 Prompt 回覆產生
    this._pollInterval = setInterval(() => {
      const latest = getLatestAntigravityReply();
      if (latest && latest.id !== this._lastReplyId) {
        this._lastReplyId = latest.id;
        this.broadcastMessage({
          command: 'newPromptReply',
          text: latest.text,
          forceRead: false
        });
      }
    }, 2500);
  }

  dispose() {
    if (this._pollInterval) clearInterval(this._pollInterval);
  }

  resolveWebviewView(webviewView, _context, _token) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'media')
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    this._bindWebviewEvents(webviewView.webview);
  }

  registerPanel(panel) {
    this._panels.add(panel);
    panel.onDidDispose(() => this._panels.delete(panel));
    this._bindWebviewEvents(panel.webview);
  }

  _bindWebviewEvents(webview) {
    webview.onDidReceiveMessage(data => {
      switch (data.type) {
        case 'petSpoke':
          vscode.window.setStatusBarMessage(`🐱 [${data.character.toUpperCase()}] ${data.text}`, 3500);
          break;
        case 'fetchLatestPromptReply': {
          const latest = getLatestAntigravityReply();
          if (latest) {
            webview.postMessage({
              command: 'newPromptReply',
              text: latest.text,
              forceRead: Boolean(data.autoRead)
            });
          }
          break;
        }
        case 'synthesizeTts': {
          const pyBin = findPythonBin();
          const scriptPath = path.join(this._extensionUri.fsPath, 'src', 'voice_engine.py');
          const payload = JSON.stringify({
            text: data.text || '',
            voice: data.voice || 'zh-TW-HsiaoChenNeural',
            character: data.character || 'hajimi',
            use_llm: Boolean(data.useLlm)
          });

          execFile(pyBin, [scriptPath, payload], { maxBuffer: 15 * 1024 * 1024 }, (err, stdout) => {
            if (err) {
              webview.postMessage({ command: 'ttsAudioReady', ok: false, error: String(err) });
              return;
            }
            try {
              const res = JSON.parse(stdout.trim());
              webview.postMessage({
                command: 'ttsAudioReady',
                ...res
              });
            } catch (parseErr) {
              webview.postMessage({ command: 'ttsAudioReady', ok: false, error: String(parseErr) });
            }
          });
          break;
        }
      }
    });
  }

  broadcastMessage(msg) {
    if (this._view) {
      this._view.webview.postMessage(msg);
    }
    for (const p of this._panels) {
      p.webview.postMessage(msg);
    }
  }

  postCommand(command, extra = {}) {
    if (this._view) {
      this._view.show?.(true);
    }
    this.broadcastMessage({ command, ...extra });
  }

  _getHtmlForWebview(webview) {
    const mediaPath = path.join(this._extensionUri.fsPath, 'media');
    const htmlFilePath = path.join(mediaPath, 'pet.html');
    let html = fs.readFileSync(htmlFilePath, 'utf8');

    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'pet.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'pet.js'));

    // 將去背角色立繪直接轉為 Base64 Data URI 注入，確保在任何 CSP 與環境下 100% 瞬間顯示！
    const loadSpriteDataUri = (name) => {
      const webpPath = path.join(mediaPath, `${name}.webp`);
      const pngPath = path.join(mediaPath, `${name}.png`);
      if (fs.existsSync(webpPath)) {
        return `data:image/webp;base64,${fs.readFileSync(webpPath).toString('base64')}`;
      }
      if (fs.existsSync(pngPath)) {
        return `data:image/png;base64,${fs.readFileSync(pngPath).toString('base64')}`;
      }
      return webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', `${name}.png`)).toString();
    };

    const petAssets = {
      hajimi: loadSpriteDataUri('hajimi'),
      claude: loadSpriteDataUri('claude'),
      dragon: loadSpriteDataUri('dragon')
    };

    // 載入預先透過 Edge-TTS + FFmpeg 合成的真實貓娘喵叫與角色互動音效
    const audioDir = path.join(mediaPath, 'audio');
    const petAudio = {};
    if (fs.existsSync(audioDir)) {
      for (const file of fs.readdirSync(audioDir)) {
        if (file.endsWith('.mp3')) {
          const key = file.replace(/\.mp3$/, '');
          const b64 = fs.readFileSync(path.join(audioDir, file)).toString('base64');
          petAudio[key] = `data:audio/mp3;base64,${b64}`;
        }
      }
    }

    html = html.replace('href="pet.css"', `href="${cssUri}"`);
    html = html.replace('src="pet.js"', `src="${jsUri}"`);
    html = html.replace('src="hajimi.png"', `src="${petAssets.hajimi}"`);

    const scriptInjection = `
      <script>
        window.__PET_ASSETS__ = ${JSON.stringify(petAssets)};
        window.__PET_AUDIO__ = ${JSON.stringify(petAudio)};
      </script>
    `;
    html = html.replace('</head>', `${scriptInjection}</head>`);

    return html;
  }
}

function activate(context) {
  const provider = new HajimiPetViewProvider(context.extensionUri);
  context.subscriptions.push(provider);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('bilibili-hajimi.petView', provider, {
      webviewOptions: { retainContextWhenHidden: true }
    })
  );

  // 右下角狀態欄常駐入口
  const statusBarPet = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarPet.text = "$(heart) 🐱 哈基米";
  statusBarPet.tooltip = "點擊與 B站 哈基米 (Gemini) / 小克 / 龍娘 桌寵互動";
  statusBarPet.command = "bilibili-hajimi.openPet";
  statusBarPet.show();
  context.subscriptions.push(statusBarPet);

  context.subscriptions.push(
    vscode.commands.registerCommand('bilibili-hajimi.openPet', () => {
      vscode.commands.executeCommand('bilibili-hajimi.petView.focus');
    }),
    vscode.commands.registerCommand('bilibili-hajimi.pet', () => {
      provider.postCommand('pet');
    }),
    vscode.commands.registerCommand('bilibili-hajimi.feed', () => {
      provider.postCommand('feed');
    }),
    vscode.commands.registerCommand('bilibili-hajimi.play', () => {
      provider.postCommand('play');
    }),
    vscode.commands.registerCommand('bilibili-hajimi.poke', () => {
      provider.postCommand('poke');
    }),
    vscode.commands.registerCommand('bilibili-hajimi.readLastPrompt', () => {
      const latest = getLatestAntigravityReply();
      if (latest) {
        provider.broadcastMessage({
          command: 'newPromptReply',
          text: latest.text,
          forceRead: true
        });
      } else {
        vscode.window.showInformationMessage('目前尚未偵測到可朗讀的 Prompt 回覆喵～');
      }
    }),
    vscode.commands.registerCommand('bilibili-hajimi.openInTab', () => {
      const panel = vscode.window.createWebviewPanel(
        'hajimiPetTab',
        '哈基米 (Gemini) 娘化桌寵',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
        }
      );
      panel.webview.html = provider._getHtmlForWebview(panel.webview);
      provider.registerPanel(panel);
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
