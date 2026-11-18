#!/usr/bin/env bash
set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🐱 開始安裝 Bilibili 哈基米 (Gemini) / 小克 / 龍娘 娘化桌寵擴充功能..."

# 1. 安裝 Python 語音合成依賴 (edge-tts)
if command -v pip >/dev/null 2>&1; then
  echo "🎙️ 正在檢查並安裝 edge-tts 語音合成套件..."
  pip install --quiet edge-tts || true
fi

# 2. 安裝 Antigravity 全局娘化人設 Plugin (~/.gemini/config/plugins/bilibili-ai-gijinka)
PLUGIN_DIR="$HOME/.gemini/config/plugins/bilibili-ai-gijinka"
mkdir -p "$PLUGIN_DIR/rules"
cp "$REPO_DIR/plugin.json" "$PLUGIN_DIR/plugin.json"
cp "$REPO_DIR/rules/AGENTS.md" "$PLUGIN_DIR/rules/AGENTS.md"
echo "✅ 已安裝全局對話人設 Plugin 至: $PLUGIN_DIR"

# 3. 安裝 Antigravity IDE / VS Code 側邊欄桌寵 Extension
for EXT_ROOT in "$HOME/.antigravity-ide/extensions" "$HOME/.vscode/extensions"; do
  if [ -d "$(dirname "$EXT_ROOT")" ]; then
    mkdir -p "$EXT_ROOT"
    TARGET_EXT="$EXT_ROOT/Elly2018.bilibili-hajimi-pet-1.1.0"
    rm -rf "$TARGET_EXT" "$EXT_ROOT/bilibili-hajimi.bilibili-hajimi-pet-1.0.0"
    cp -r "$REPO_DIR" "$TARGET_EXT"
    rm -rf "$TARGET_EXT/.git"
    echo "✅ 已安裝桌寵 Extension 至: $TARGET_EXT"
  fi
done

echo ""
echo "🎉 安裝完成喵～！請在 Antigravity IDE / VS Code 按下 Ctrl+Shift+P 執行 'Developer: Reload Window' 即可在側邊欄與哈基米互動囉！"
