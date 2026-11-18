#!/usr/bin/env python3
"""
Bilibili AI 娘化桌寵 - 本地 LLM + Edge-TTS + FFmpeg 聲線合成引擎 (圓滑自然語調升級版)
支援：
1. Local LLM (Ollama http://127.0.0.1:11434) 將長篇 Prompt 回覆轉化為自然圓滑的口語角色摘要。
2. Edge-TTS 多語音選擇 + 自然語速韻律調整（告別字正腔圓的播音腔）。
3. FFmpeg DSP 聲線濾波器：
   - 哈基米 (hajimi): 元氣貓娘聲線（高音甜美、輕快活潑 +16%）
   - 小克 (claude): 溫柔傲嬌大姊姊聲線（清亮柔和、圓滑順暢 +4% 音高、1.12x 流暢語速）
   - 龍娘 (dragon): 甜美寵溺大姊姊聲線（明亮溫柔御姐音 +7% 音高、1.18x 輕快語速，不低沉不拖沓）
"""
import asyncio
import base64
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request
import edge_tts

# 三位角色的 FFmpeg 專屬聲線與 Edge-TTS 韻律參數 (徹底解決低沉與慢速問題)
CHARACTER_TIMBRE_FILTERS = {
    "hajimi": {
        "name": "元氣貓娘聲線 (清脆甜美)",
        "tts_rate": "+15%",
        "tts_pitch": "+4Hz",
        # 提升音高與共振峰 +16%，保持輕快活潑的貓娘元氣感
        "ffmpeg_af": "asetrate=24000*1.16,aresample=24000,atempo=0.96,highpass=f=140,equalizer=f=3300:width_type=o:width=2:g=3.0"
    },
    "claude": {
        "name": "溫柔大姊姊聲線 (柔和圓滑)",
        "tts_rate": "+12%",
        "tts_pitch": "+2Hz",
        # 保持清亮柔美的女性音色 (+4% 微甜音高)，搭配流暢語速與柔滑中頻，不再字正腔圓
        "ffmpeg_af": "asetrate=24000*1.04,aresample=24000,atempo=1.04,highpass=f=120,equalizer=f=2600:width_type=o:width=2:g=2.2,lowpass=f=9500"
    },
    "dragon": {
        "name": "寵溺大姊姊聲線 (清亮輕快)",
        "tts_rate": "+18%",
        "tts_pitch": "+5Hz",
        # 清亮甜美的大姊姊音色 (+7% 音高，絕不低沉！)，語速輕快流暢 (atempo 1.06 + rate +18%)，帶有溫潤空氣感
        "ffmpeg_af": "asetrate=24000*1.07,aresample=24000,atempo=1.06,highpass=f=130,equalizer=f=3000:width_type=o:width=2:g=2.8"
    }
}

DEFAULT_VOICE = "zh-TW-HsiaoChenNeural"

def soften_speech_text(text: str, character: str) -> str:
    """將生硬的書面語轉化為自然圓滑的日常口語，避免 TTS 念起來字正腔圓"""
    if not text:
        return ""
    replacements = [
        ("因此，", "所以呀，"),
        ("此外，", "還有喔，"),
        ("已經為您", "已經幫你"),
        ("為您", "幫你"),
        ("您", "你"),
        ("請注意", "要記得喔"),
        ("已完成", "做好囉"),
        ("成功", "搞定啦"),
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    return text

def clean_markdown_for_speech(text: str, max_len: int = 220) -> str:
    """移除程式碼區塊、網址與 Markdown 符號，提取適合朗讀的純文字"""
    if not text:
        return ""
    text = re.sub(r"```[\s\S]*?```", "（中間的程式碼已經幫你準備好囉）", text)
    text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"file://\S+", "", text)
    lines = []
    for line in text.splitlines():
        s = line.strip()
        if not s or s.startswith("|") or s.startswith("---") or s.startswith("┌") or s.startswith("│") or s.startswith("├") or s.startswith("└"):
            continue
        s = re.sub(r"^#+\s*", "", s)
        s = re.sub(r"^[\*\-\+]\s+", "", s)
        s = re.sub(r"\*\*([^\*]+)\*\*", r"\1", s)
        lines.append(s)
    cleaned = "，".join(lines)
    cleaned = re.sub(r"[，。！？；：、]{2,}", "，", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if len(cleaned) > max_len:
        cleaned = cleaned[:max_len] + "～大概就是這樣囉！"
    return cleaned

def summarize_with_local_llm(raw_text: str, character: str, ollama_url: str = "http://127.0.0.1:11434", model: str = "qwen2.5:1.5b") -> tuple[str, bool]:
    """
    嘗試呼叫本地 Ollama LLM 將 Prompt 回覆轉為圓滑自然的日常口語摘要。
    回傳: (spoken_text, used_local_llm)
    """
    cleaned = clean_markdown_for_speech(raw_text, max_len=600)
    if not cleaned:
        return "", False

    persona_prompts = {
        "hajimi": "你是活潑可愛的貓娘「哈基米」，句尾喜歡帶「喵～」，稱呼對方為「主人」。請用2句繁體中文、超級自然可愛的日常聊天口吻（不要像播音員或唸書），簡短告訴主人這段回覆重點：",
        "claude": "你是溫柔體貼的大姊姊「小克」，說話圓滑柔順、親切自然，多用「呢、喔、呀、囉」等柔和語助詞，不要用生硬的書面語或字正腔圓的說教。請用2句繁體中文，像在耳邊溫柔聊天一樣告訴搭檔這段回覆重點：",
        "dragon": "你是開朗溫柔又寵溺的大姊姊「龍娘」，說話輕快甜美、圓滑自然，多用「呀、囉、呢、喔～」等親切語氣，千萬不要嚴肅古板。請用2句繁體中文，開心地告訴主人這段回覆重點："
    }
    sys_p = persona_prompts.get(character, persona_prompts["hajimi"])

    try:
        req_data = json.dumps({
            "model": model,
            "prompt": f"{sys_p}\n\n【回覆內容】：\n{cleaned}",
            "stream": False,
            "options": {"temperature": 0.65, "num_predict": 110}
        }).encode("utf-8")
        req = urllib.request.Request(
            f"{ollama_url.rstrip('/')}/api/generate",
            data=req_data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=2.5) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            ans = body.get("response", "").strip()
            if ans:
                return soften_speech_text(clean_markdown_for_speech(ans, max_len=220), character), True
    except Exception:
        pass

    # 若本地 LLM 未啟動，使用圓滑口語化規則包裝
    short_text = soften_speech_text(clean_markdown_for_speech(raw_text, max_len=170), character)
    if character == "claude":
        short_text = f"嗯～跟你說喔，{short_text}，有需要我的地方再隨時叫我一聲呢～"
    elif character == "dragon":
        short_text = f"主人主人～姊姊幫你整理好囉，{short_text}，是不是超棒的呀～"
    else:
        if "喵" not in short_text[:10]:
            short_text = f"喵嗚～主人快聽！{short_text}喵～"
    return short_text, False

async def synthesize_speech(text: str, voice: str, character: str, output_mp3: str):
    """使用 Edge-TTS (含自然語速與音高韻律) 生成語音，並透過 FFmpeg 套用圓滑聲線濾波器"""
    timbre = CHARACTER_TIMBRE_FILTERS.get(character, CHARACTER_TIMBRE_FILTERS["hajimi"])
    af_filter = timbre["ffmpeg_af"]
    tts_rate = timbre.get("tts_rate", "+15%")
    tts_pitch = timbre.get("tts_pitch", "+2Hz")

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        raw_mp3 = tmp.name

    try:
        communicate = edge_tts.Communicate(text, voice, rate=tts_rate, pitch=tts_pitch)
        await communicate.save(raw_mp3)

        cmd = [
            "ffmpeg", "-y", "-i", raw_mp3,
            "-af", af_filter,
            "-ar", "24000", "-ac", "1", "-b:a", "64k",
            output_mp3
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    finally:
        if os.path.exists(raw_mp3):
            os.remove(raw_mp3)

async def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing JSON payload"}))
        return

    payload = json.loads(sys.argv[1])
    text = payload.get("text", "")
    voice = payload.get("voice", DEFAULT_VOICE)
    character = payload.get("character", "hajimi")
    use_llm = payload.get("use_llm", False)
    ollama_url = payload.get("ollama_url", "http://127.0.0.1:11434")
    ollama_model = payload.get("ollama_model", "qwen2.5:1.5b")

    used_local_llm = False
    if use_llm:
        spoken_text, used_local_llm = summarize_with_local_llm(text, character, ollama_url, ollama_model)
    else:
        spoken_text = soften_speech_text(clean_markdown_for_speech(text, max_len=220), character)

    if not spoken_text:
        print(json.dumps({"error": "Empty text"}))
        return

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as out_tmp:
        out_mp3 = out_tmp.name

    try:
        await synthesize_speech(spoken_text, voice, character, out_mp3)
        with open(out_mp3, "rb") as f:
            b64_audio = base64.b64encode(f.read()).decode("ascii")
        print(json.dumps({
            "ok": True,
            "spokenText": spoken_text,
            "usedLocalLlm": used_local_llm,
            "timbreName": CHARACTER_TIMBRE_FILTERS.get(character, CHARACTER_TIMBRE_FILTERS["hajimi"])["name"],
            "voice": voice,
            "audioDataUri": f"data:audio/mp3;base64,{b64_audio}"
        }, ensure_ascii=False))
    finally:
        if os.path.exists(out_mp3):
            os.remove(out_mp3)

if __name__ == "__main__":
    asyncio.run(main())
