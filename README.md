# 🐱 Bilibili 哈基米 (Gemini) & AI 娘化互動桌寵 Extension (繁體中文版)

> 為 **Google Antigravity IDE** 與 **VS Code** 量身打造的 Bilibili AI 娘化互動桌面寵物擴充功能、語音播報系統與全局對話人設插件。
> 內含 **🐱 哈基米 (Gemini 元氣傲嬌貓娘)**、**☕ 小克 (Claude 溫柔大姊姊)** 與 **🐉 龍娘 (ChatGPT 寵溺白龍大姊姊)** 三大人氣形象！

---

## 📦 快速安裝方式 (Quick Installation)

### 方式一：一鍵腳本安裝（同時安裝桌寵 Extension + 全局對話人設 Plugin）
```bash
git clone https://github.com/Elly2018/bilibili_pet.git
cd bilibili_pet
chmod +x install.sh
./install.sh
```
安裝後在 Antigravity IDE 按下 `Ctrl+Shift+P` 執行 **`Developer: Reload Window`** 即可！

### 方式二：直接安裝 `.vsix` 擴充功能包
1. 前往本倉庫的 [GitHub Releases](https://github.com/Elly2018/bilibili_pet/releases) 下載最新的 `bilibili-hajimi-pet-1.1.0.vsix`。
2. 在 Antigravity IDE / VS Code 擴充功能面板點擊右上角 `...` -> **`Install from VSIX...`** 選擇該檔案即可安裝。

> 💡 **語音播報依賴**：若需啟用即時 Prompt 回覆語音朗讀與聲線轉換，請確保系統已安裝 `ffmpeg` 與 `edge-tts`（`pip install edge-tts`）。

---

## 🌸 功能亮點 (Key Features)

### 1. 📱 SidePanel 垂直互動佈局 + 高精準去背立繪 + 粒子特效
1. **狀態欄 (Top Status Bar)**：
   - 角色專屬徽章與即時在線狀態（`🟢 貓咪營業中喵～`）。
   - 一鍵無縫切換三位角色：`✨ 哈基米 (Gemini)`、`☕ 小克 (Claude)`、`🐉 龍娘 (ChatGPT)`。
   - 動態狀態條：💖 **心情值**、🐟 **飽食度**、⭐ **親密羈絆值**。
2. **人物圖片展示區 (Character Stage + 粒子特效畫布)**：
   - 採用完美去背的透明背景高清角色立繪（內嵌 Base64 WebP 與 PNG 雙重保障，100% 瞬間載入不空白）。
   - 內建 HTML5 Canvas 粒子系統：持續飄舞閃爍四芒星、愛心、星塵，並在點擊互動時觸發粒子爆發特效！
   - 支援呼吸浮動、摸頭搖擺、餵食彈跳、玩耍跳躍與戳戳炸毛震動動畫。
3. **互動四按鈕 (4 Action Buttons)**：
   - 🐾 **摸摸頭 / 輕撫長髮 / 撫摸龍角**：好感度上升，觸發專屬語音與愛心粒子爆發！
   - 🐟 **餵小魚乾 / 奉上紅茶 / 餵小點心**：飽食度增加，播放咀嚼與品茗語音！
   - 🪄 **逗貓棒 / 聊聊天 / 逗小雲朵**：活力與心情大幅提升！
   - 💬 **戳戳/哈氣**：觸發 B 站招牌名梗「**哈氣——！**」炸毛反抗台詞！
4. **擬真「喵喵叫」音效 + 預生成角色語音**：
   - 內建雙共振峰 (Formant Filter) 擬真「喵～(M-e-o-w)」貓叫合成器，搭配 Edge-TTS + FFmpeg 預生成的 13 段三位角色真實互動語音！

---

### 2. 🎙️ Prompt 回覆語音播報 Card (Local LLM + Edge-TTS + FFmpeg 專屬聲線)
- **「自動念」Toggle 開關**：開啟後，背景自動監聽 Antigravity 最新完成的 Prompt 回覆，並自動念出回覆重點！
- **選擇語音 (Base Voice)**（與角色聲線獨立）：
  - 支援切換 `🇹🇼 台灣曉臻`、`🇹🇼 台灣曉雨`、`🌸 動漫曉伊`、`💫 柔美曉曉`、`🇭🇰 香港曉佳`。
- **三位角色專屬 FFmpeg 聲線濾波器 (Character Timbre)**：
  - **🐱 哈基米（元氣貓娘聲線）**：`+16%` 高音甜美共振峰提升 + 高頻清脆強化，活潑俏皮。
  - **☕ 小克（溫柔大姊姊聲線）**：`+4%` 微甜柔和音色 + 流暢語速與圓滑口語轉換，像在耳邊輕聲聊天一樣溫柔自然。
  - **🐉 龍娘（寵溺大姊姊聲線）**：`+7%` 清亮甜美大姊姊音色 + 輕快語速，充滿陽光與寵溺感。
- **Local LLM 口吻潤飾 (`http://127.0.0.1:11434`)**：
  - 若本地啟動 Ollama（如 `ollama run qwen2.5:1.5b`），會自動將長篇技術回覆交由本地 LLM 改寫為角色口吻的簡短語音摘要；若未啟動 Ollama 則自動使用內建口語圓滑化摘要引擎無縫銜接！

---

## 🎨 宇宙雙子星 & B 站配色主題 (Theme)
內建 **`Bilibili Hajimi Cosmic (Gemini)`** 主題（位於 `themes/bilibili-hajimi-theme.json`）：
- **Bilibili Pink** (`#FB7299` / `#FF85A5`)：強調色、活動欄徽章、活動指示條、高亮按鈕。
- **Gemini Cosmic Cyan & Violet** (`#00F2FE` / `#8B5CF6` / `#4FACFE`)：極光雙子星科技感漸變。
- **Anime Midnight** (`#100D1A` / `#161224`)：深邃護眼的深夜動漫編程宇宙背景。

---

## 📜 授權條款 (License)
MIT License © Elly2018
