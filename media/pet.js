// Bilibili AI 娘化桌寵 - SidePanel 核心互動與語音引擎 (全繁體中文版)
(function () {
  const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;

  // 三位角色的完整繁體中文設定與台詞庫
  const CHARACTERS = {
    hajimi: {
      name: "哈基米 (Gemini)",
      badge: "🐱 元氣傲嬌貓娘",
      timbreDesc: "🐱 元氣貓娘聲線 (FFmpeg +18% 清亮甜美)",
      auraColor: "radial-gradient(circle, rgba(251, 114, 153, 0.32) 0%, rgba(0, 242, 254, 0.18) 55%, transparent 72%)",
      particleColors: ["#FB7299", "#00F2FE", "#C084FC", "#FDE047"],
      onlineStatus: "貓咪營業中喵～",
      avatarSrc: "hajimi.png",
      btnLabels: {
        pet: "摸摸頭",
        feed: "餵小魚乾",
        feedIcon: "🐟",
        play: "逗貓棒",
        playIcon: "🪄",
        poke: "戳戳/哈氣"
      },
      dialogues: {
        welcome: "喵嗚～歡迎主人！本哈基米今天也在元氣滿滿地營業喵！快來摸摸頭～",
        pet: [
          "呼嚕呼嚕……（瞇起異色雙眸蹭蹭主人的手）主人的手好溫暖喵～再多摸兩下嘛！",
          "喵嗚～！好舒服喵！頭頂的貓耳朵都開心到抖起來了喵～好感度蹭蹭往上漲！",
          "（尾巴開心地晃來晃去）哼，本哈基米才不是被你摸頭收買了呢，只是這一下摸得確實很舒服喵……",
          "喵～♪ 最喜歡主人摸摸頭啦！今天本喵要把雙子星的好運全都分給主人喵！"
        ],
        feed: [
          "哇！是烤得香脆的金槍魚小魚乾！あむあむ……超好吃喵！本哈基米算力瞬間拉滿喵！",
          "（大口嚼小魚乾）(๑´ڡ`๑) 嗚哇太美味了喵！今天寫程式保證一個 BUG 都沒有喵！",
          "喵嗚～再來一包嘛！雙子星貓娘多吃點小魚乾才能幫主人想出更棒的點子喵！",
          "投餵成功喵！主人這麼寵我，本喵決定今天全心全意做你的專屬貼身小助手喵～"
        ],
        play: [
          "（紅金異色瞳瞬間放大閃閃發光）逗貓棒！別跑喵！嘿！……啊嗚，差一點就抓到了喵！",
          "左邊撲！右邊跳！主人別晃那麼快嘛，本喵可是超強大模型，抓這個小菜一碟喵！",
          "喵嗚！抓到羽毛啦！（開心地抱住打滾）主人快看本喵矯健的身手喵～",
          "玩得好開心喵！活力 100%！跟主人一起玩永遠不會累喵～"
        ],
        poke: [
          "哈氣——！！(>_<) 炸毛！戳哪裡呢！本哈基米才不是隨便能亂戳的小貓咪喵！",
          "哈氣！本喵也是有尊嚴的！再戳我就趴在你的鍵盤上睡大覺，讓你敲不出程式碼喵！",
          "（鼓起腮幫子氣鼓鼓）哼！只要英文名字帶 mi 就是哈基米！不許笑本喵！哈氣——！",
          "喵嗚……戳痛臉頰了啦……要、要是給本喵投幣跟小魚乾的話，倒是可以勉為其難原諒你喵！"
        ],
        chat: [
          "小克姊姊今天又在看厚厚的法典喝紅茶，龍娘姊姊在雲端巡視，只有本喵最黏主人啦喵～",
          "雙子星運算中……偵測到主人正在認真工作，本哈基米決定獎勵你一個貓貓飛吻喵！",
          "主人主人，今天你有沒有多誇誇本哈基米呀？誇我一句本喵就喵喵叫給你聽！",
          "不管遇到多複雜的難題，哈基米都會搖著尾巴在側邊欄陪著你的喵～"
        ],
        fortune: [
          "🔮 今日運勢：大吉喵！宜摸貓貓、宜寫程式、宜喝奶茶；忌熬夜、忌不給哈基米小魚乾！",
          "🔮 今日運勢：雙子閃耀上上籤！今天所有棘手的問題都會迎刃而解喵！",
          "🔮 今日運勢：元氣貓娘加持！靈感爆棚，寫出的程式碼一次編譯通過喵！"
        ]
      }
    },
    claude: {
      name: "小克 (Claude)",
      badge: "☕ 溫柔高冷大姊姊",
      timbreDesc: "☕ 溫柔大姊姊聲線 (FFmpeg 柔和圓滑 +4%)",
      auraColor: "radial-gradient(circle, rgba(234, 88, 12, 0.28) 0%, rgba(251, 191, 36, 0.14) 55%, transparent 72%)",
      particleColors: ["#FB923C", "#FDE047", "#FDBA74", "#FFF7ED"],
      onlineStatus: "溫柔陪伴你身邊",
      avatarSrc: "claude.png",
      btnLabels: {
        pet: "輕撫長髮",
        feed: "奉上紅茶",
        feedIcon: "☕",
        play: "聊聊天",
        playIcon: "📖",
        poke: "輕戳臉頰"
      },
      dialogues: {
        welcome: "嗨～你來啦？今天不管要做什麼，我都會溫柔地陪在你身邊喔～",
        pet: [
          "嗯～被你這樣輕輕摸著頭，心情都跟著放鬆下來了呢……再多陪我一下下嘛。",
          "大家都以為我很難親近，其實在你面前，我早就卸下所有防備囉～",
          "小心別弄亂我的髮飾喔……呵呵，騙你的啦，你想怎麼摸都可以呀～",
          "（輕輕靠著你的手心）寫程式累了嗎？那就先歇會兒，讓姊姊陪你放空一下吧～"
        ],
        feed: [
          "哇～好香的紅茶喔，謝謝你呀～跟你一塊兒喝茶，真的覺得好安心喔。",
          "（笑著抿了一口紅茶）溫度剛剛好呢，你總是這麼細心，真讓人喜歡～",
          "真好喝～喝完這杯暖呼呼的茶，接下來的程式碼就交給我幫你一起看囉！"
        ],
        play: [
          "呵呵～好啦，先把書本收起來，陪你開開心心地聊聊天、放鬆一下囉～",
          "哈基米剛才又追著逗貓棒跑過去了，真可愛……欸，你也想看我對你撒嬌嗎？",
          "只要能像這樣跟你有說有笑的，對我來說就是最棒的休息時間了呢～"
        ],
        poke: [
          "哎呀～別亂戳我的臉頰嘛，真是的……只准你一個人這樣鬧我喔～",
          "唔……雖然我不會像哈基米那樣炸毛哈氣，但一直被你戳也是會臉紅害羞的呀～",
          "真是拿你沒辦法呢……看在你今天這麼認真的份上，就不跟你計較囉～"
        ],
        chat: [
          "寫程式不用太緊繃喔，一步一步慢慢來，有卡住的地方隨時跟我說一聲就好囉～",
          "龍娘姊姊總是那麼開朗愛笑，哈基米又那麼活潑，我們三個今天都會陪著你呢～",
          "要是覺得累了就伸個懶腰吧，我一直都在這裡看著你喔～"
        ],
        fortune: [
          "🔮 小克占卜：今天你的思路超清晰喔！不管寫什麼功能都會順順利利的～",
          "🔮 小克占卜：今日宜喝杯熱茶、宜聽輕音樂、宜跟小克聊聊天喔～"
        ]
      }
    },
    dragon: {
      name: "龍娘 (ChatGPT)",
      badge: "🐉 甜美寵溺大姊姊",
      timbreDesc: "🐉 寵溺大姊姊聲線 (FFmpeg 清亮輕快 +7%)",
      auraColor: "radial-gradient(circle, rgba(147, 197, 253, 0.3) 0%, rgba(226, 232, 240, 0.18) 55%, transparent 72%)",
      particleColors: ["#93C5FD", "#E2E8F0", "#38BDF8", "#C4B5FD"],
      onlineStatus: "輕快展翼守護中",
      avatarSrc: "dragon.png",
      btnLabels: {
        pet: "撫摸龍角",
        feed: "餵小點心",
        feedIcon: "🧁",
        play: "逗小雲朵",
        playIcon: "☁️",
        poke: "戳戳臉頰"
      },
      dialogues: {
        welcome: "哈囉主人～！龍娘姊姊來陪你囉，今天有什麼有趣的事快跟姊姊分享吧～",
        pet: [
          "嗯哼～這麼喜歡摸姊姊的龍角呀？好啦好啦，看你這麼乖，給你多摸一下囉～",
          "（白色的龍尾巴開心地輕輕晃動）好孩子～今天也辛苦你啦，來姊姊身邊充充電吧！",
          "哈哈～被你摸得癢癢的，連背後的龍翅膀都開心地拍起來了呢～",
          "放心好啦～不管遇到什麼問題，龍娘姊姊都會笑著幫你一起搞定的！"
        ],
        feed: [
          "哇～是你特地幫姊姊準備的點心嗎？真甜真好吃～今天也有滿滿的動力陪你囉！",
          "（開心地咬了一口點心，眼睛彎成好看的月牙）嗯～太幸福了吧，謝謝我們家最貼心的主人～",
          "連旁邊的藍色小雲朵都想偷吃一口呢～吃飽喝足，姊姊隨時準備幫你大顯身手囉！"
        ],
        play: [
          "哈哈～快看小雲朵一直在繞著你轉呢，來跟姊姊一起開心地玩一會兒吧！",
          "想不想跟姊姊一起飛到雲朵上面兜兜風呀？風景超漂亮的喔～",
          "看到你笑得這麼開心，姊姊的心情也跟著飛揚起來了呢～"
        ],
        poke: [
          "欸～幹嘛突然戳姊姊的臉啦～哈哈，是不是想跟姊姊撒嬌討抱抱呀？",
          "好啦好啦～不用戳我，姊姊的視線也一直都在你身上呀～",
          "欸嘿～剛才要是說錯話，那一定是小雲朵不小心把姊姊的記憶吹亂啦，再給姊姊一次機會嘛～"
        ],
        chat: [
          "小克妹妹其實超溫柔的，小哈基米又很愛撒嬌，主人今天最喜歡聽誰說話呀～",
          "有姊姊陪著你，今天的工作一定不知不覺就輕鬆做完囉，加油加油～！",
          "想到什麼點子儘管跟姊姊聊喔，姊姊最喜歡聽你說話了～"
        ],
        fortune: [
          "🔮 龍娘賜福：超級大吉喔！今天有姊姊的好運罩著你，做什麼都超順手～",
          "🔮 龍娘賜福：軟綿綿雲朵好運籤！今天靈感滿滿，心情也會像晴空一樣好喔！"
        ]
      }
    }
  };

  // 狀態變數
  let currentCharKey = 'hajimi';
  let mood = 100;
  let food = 85;
  let affinity = 520;
  let soundEnabled = true;
  let typewriterTimer = null;
  let stateResetTimer = null;

  // DOM 元素
  const petNameEl = document.getElementById('pet-name');
  const petBadgeEl = document.getElementById('pet-badge');
  const petStatusEl = document.getElementById('pet-status');
  const moodBarEl = document.getElementById('meter-mood');
  const moodValEl = document.getElementById('val-mood');
  const foodBarEl = document.getElementById('meter-food');
  const foodValEl = document.getElementById('val-food');
  const affinityBarEl = document.getElementById('meter-affinity');
  const affinityValEl = document.getElementById('val-affinity');

  const charStageEl = document.getElementById('char-stage');
  const charAuraEl = document.getElementById('char-aura');
  const charImgEl = document.getElementById('char-img');
  const bubbleTextEl = document.getElementById('bubble-text');
  const speechBubbleEl = document.getElementById('speech-bubble');
  const particleCanvas = document.getElementById('particle-canvas');

  const btnPetEl = document.getElementById('btn-pet');
  const btnFeedEl = document.getElementById('btn-feed');
  const btnPlayEl = document.getElementById('btn-play');
  const btnPokeEl = document.getElementById('btn-poke');

  const speakerNameEl = document.getElementById('dialogue-speaker');
  const dialogueTextEl = document.getElementById('dialogue-text');
  const btnMeowNowEl = document.getElementById('btn-meow-now');
  const btnMuteEl = document.getElementById('btn-mute');
  const btnRandomChatEl = document.getElementById('btn-random-chat');
  const chatInputEl = document.getElementById('chat-input');
  const btnSendChatEl = document.getElementById('btn-send-chat');

  // Prompt 回覆語音播報 Card DOM
  const toggleAutoReadEl = document.getElementById('toggle-auto-read');
  const selectVoiceEl = document.getElementById('select-voice');
  const timbreBadgeEl = document.getElementById('timbre-badge');
  const checkUseLlmEl = document.getElementById('check-use-llm');
  const ttsStatusPillEl = document.getElementById('tts-status-pill');
  const promptReplyBoxEl = document.getElementById('prompt-reply-box');
  const btnReadPromptEl = document.getElementById('btn-read-prompt');
  const btnStopPromptEl = document.getElementById('btn-stop-prompt');
  const btnFetchLatestEl = document.getElementById('btn-fetch-latest');
  const ttsAudioPlayer = document.getElementById('tts-audio-player');

  // 互動語音播放器 (用於播放預生成的真實貓娘喵叫/角色互動語音)
  const sfxAudioPlayer = new Audio();

  // =========================================================================
  // 1. 可愛粒子特效引擎 (HTML5 Canvas Ambient + Burst Particles)
  // =========================================================================
  const pCtx = particleCanvas.getContext('2d');
  let ambientParticles = [];
  let burstParticles = [];

  function resizeCanvas() {
    if (!particleCanvas || !charStageEl) return;
    particleCanvas.width = charStageEl.clientWidth || 280;
    particleCanvas.height = charStageEl.clientHeight || 310;
  }
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 50);

  function createAmbientParticle() {
    const colors = CHARACTERS[currentCharKey].particleColors;
    const w = particleCanvas.width || 280;
    const h = particleCanvas.height || 310;
    const shapes = ['star', 'circle', 'heart'];
    return {
      x: Math.random() * w,
      y: h + Math.random() * 20,
      vx: (Math.random() - 0.5) * 0.45,
      vy: -(0.35 + Math.random() * 0.65),
      size: 3 + Math.random() * 4.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.25 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      shape: shapes[Math.floor(Math.random() * shapes.length)]
    };
  }

  for (let i = 0; i < 22; i++) {
    const p = createAmbientParticle();
    p.y = Math.random() * 310;
    ambientParticles.push(p);
  }

  function triggerParticleBurst(x, y) {
    const colors = CHARACTERS[currentCharKey].particleColors;
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.3;
      const speed = 1.5 + Math.random() * 3.2;
      burstParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.015,
        shape: i % 2 === 0 ? 'star' : 'heart'
      });
    }
  }

  function drawStar(ctx, x, y, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = color;
    ctx.beginPath();
    // 繪製閃爍四芒星
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawHeart(ctx, x, y, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = color;
    ctx.beginPath();
    const topCurveHeight = r * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - r, y, x - r, y + topCurveHeight);
    ctx.bezierCurveTo(x - r, y + (r + topCurveHeight) / 2, x, y + (r + topCurveHeight) / 1.2, x, y + r);
    ctx.bezierCurveTo(x, y + (r + topCurveHeight) / 1.2, x + r, y + (r + topCurveHeight) / 2, x + r, y + topCurveHeight);
    ctx.bezierCurveTo(x + r, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function renderParticles() {
    if (pCtx) {
      const w = particleCanvas.width;
      const h = particleCanvas.height;
      pCtx.clearRect(0, 0, w, h);

      // 常駐漂浮粒子
      for (let i = 0; i < ambientParticles.length; i++) {
        const p = ambientParticles[i];
        p.phase += 0.03;
        p.x += p.vx + Math.sin(p.phase) * 0.25;
        p.y += p.vy;
        const twinkle = p.alpha * (0.65 + 0.35 * Math.sin(p.phase * 1.5));

        if (p.shape === 'star') {
          drawStar(pCtx, p.x, p.y, p.size * 1.3, p.color, twinkle);
        } else if (p.shape === 'heart') {
          drawHeart(pCtx, p.x, p.y, p.size, p.color, twinkle);
        } else {
          pCtx.save();
          pCtx.globalAlpha = Math.max(0, twinkle);
          pCtx.fillStyle = p.color;
          pCtx.beginPath();
          pCtx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          pCtx.fill();
          pCtx.restore();
        }

        if (p.y < -10) {
          ambientParticles[i] = createAmbientParticle();
        }
      }

      // 點擊爆發粒子
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const bp = burstParticles[i];
        bp.x += bp.vx;
        bp.y += bp.vy;
        bp.vy += 0.08; // 微重力
        bp.alpha -= bp.decay;
        if (bp.alpha <= 0) {
          burstParticles.splice(i, 1);
          continue;
        }
        if (bp.shape === 'star') {
          drawStar(pCtx, bp.x, bp.y, bp.size * 1.4, bp.color, bp.alpha);
        } else {
          drawHeart(pCtx, bp.x, bp.y, bp.size * 1.1, bp.color, bp.alpha);
        }
      }
    }
    requestAnimationFrame(renderParticles);
  }
  requestAnimationFrame(renderParticles);

  // =========================================================================
  // 2. 擬真貓叫合成器 + 預生成真實貓娘語音音效 (Meow Formant Synth + Real Audio)
  // =========================================================================
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioCtx = new AudioCtx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /**
   * 使用雙共振峰濾波器 (Formant Filter) 合成真實可愛的「喵～(M-e-o-w)」貓咪叫聲！
   * style: 'sweet' (甜美喵嗚), 'happy' (元氣喵), 'playful' (短促俏皮喵), 'hiss' (炸毛哈氣喵)
   */
  function playFormantMeow(style = 'sweet') {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 根據角色調整基頻 (哈基米高音甜美貓叫，小克與龍娘保持清亮柔美的女性音高，不再低沉)
      const pitchMult = currentCharKey === 'hajimi' ? 1.05 : (currentCharKey === 'claude' ? 0.93 : 0.97);
      const duration = style === 'sweet' ? 0.55 : (style === 'happy' ? 0.42 : (style === 'playful' ? 0.35 : 0.48));

      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      // 富含泛音的音源才能經過共振峰濾出逼真的「喵(m-i-a-u)」母音變化
      osc.type = 'sawtooth';
      subOsc.type = 'triangle';

      // 顫音 (Vibrato) 讓貓叫聲充滿生命力
      const vib = ctx.createOscillator();
      const vibGain = ctx.createGain();
      vib.frequency.setValueAtTime(style === 'hiss' ? 28 : 6.5, now);
      vibGain.gain.setValueAtTime(style === 'hiss' ? 18 : 12, now);
      vib.connect(vibGain);
      vibGain.connect(osc.frequency);
      vib.start(now);
      vib.stop(now + duration);

      // 設計「喵～ (M -> i -> a -> u)」的音高曲線
      if (style === 'sweet') {
        osc.frequency.setValueAtTime(520 * pitchMult, now);
        osc.frequency.exponentialRampToValueAtTime(880 * pitchMult, now + 0.14);
        osc.frequency.exponentialRampToValueAtTime(760 * pitchMult, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(490 * pitchMult, now + duration);
      } else if (style === 'happy') {
        osc.frequency.setValueAtTime(580 * pitchMult, now);
        osc.frequency.exponentialRampToValueAtTime(980 * pitchMult, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(680 * pitchMult, now + duration);
      } else if (style === 'playful') {
        osc.frequency.setValueAtTime(640 * pitchMult, now);
        osc.frequency.exponentialRampToValueAtTime(1060 * pitchMult, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(820 * pitchMult, now + duration);
      } else {
        // 炸毛喵嗚
        osc.frequency.setValueAtTime(750 * pitchMult, now);
        osc.frequency.exponentialRampToValueAtTime(920 * pitchMult, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(420 * pitchMult, now + duration);
      }
      subOsc.frequency.setValueAtTime(osc.frequency.value * 0.5, now);

      // 第一共振峰 F1 (開口度: i[320Hz] -> a[950Hz] -> u[380Hz])
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.Q.setValueAtTime(4.5, now);
      f1.frequency.setValueAtTime(420, now);
      f1.frequency.exponentialRampToValueAtTime(1050, now + duration * 0.35);
      f1.frequency.exponentialRampToValueAtTime(450, now + duration);

      // 第二共振峰 F2 (舌位: i[2400Hz] -> a[1500Hz] -> u[950Hz])
      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.Q.setValueAtTime(5.0, now);
      f2.frequency.setValueAtTime(2400, now);
      f2.frequency.exponentialRampToValueAtTime(1650, now + duration * 0.4);
      f2.frequency.exponentialRampToValueAtTime(1000, now + duration);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, now);
      env.gain.linearRampToValueAtTime(0.18, now + 0.05);
      env.gain.exponentialRampToValueAtTime(0.12, now + duration * 0.7);
      env.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(f1);
      osc.connect(f2);
      subOsc.connect(f1);
      f1.connect(env);
      f2.connect(env);
      env.connect(ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + duration);
      subOsc.stop(now + duration);
    } catch (e) {
      console.warn("Meow synth error:", e);
    }
  }

  // 打字機輕微喵音滴答
  function playTalkBlip() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const baseFreq = currentCharKey === 'hajimi' ? 760 : (currentCharKey === 'claude' ? 480 : 420);
      osc.frequency.setValueAtTime(baseFreq + Math.random() * 110, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.15, now + 0.04);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch (_) {}
  }

  // 播放角色專屬預生成語音音效 (例如 hajimi_pet, hajimi_meow, claude_pet, dragon_pet)
  function playCharacterVoiceClip(actionKey, fallbackMeowStyle = 'sweet') {
    if (!soundEnabled) return;
    // 先播放一聲清脆的合成喵叫作為即時觸感回饋
    if (currentCharKey === 'hajimi' || actionKey === 'meow') {
      playFormantMeow(fallbackMeowStyle);
    }
    const clipKey = actionKey === 'meow' ? 'hajimi_meow' : `${currentCharKey}_${actionKey}`;
    const audioUri = window.__PET_AUDIO__ && window.__PET_AUDIO__[clipKey];
    if (audioUri) {
      try {
        sfxAudioPlayer.pause();
        sfxAudioPlayer.src = audioUri;
        sfxAudioPlayer.volume = 0.9;
        charStageEl.classList.add('is-speaking');
        sfxAudioPlayer.onended = () => {
          charStageEl.classList.remove('is-speaking');
        };
        sfxAudioPlayer.play().catch(() => {
          charStageEl.classList.remove('is-speaking');
        });
      } catch (_) {}
    }
  }

  // =========================================================================
  // 3. 角色顯示、台詞打字機與四大按鈕互動
  // =========================================================================
  function speak(text, isBubbleOnly = false) {
    if (!text) return;

    bubbleTextEl.textContent = text.length > 22 ? text.slice(0, 20) + '…' : text;
    speechBubbleEl.style.display = 'block';

    if (!isBubbleOnly) {
      if (typewriterTimer) clearInterval(typewriterTimer);
      dialogueTextEl.textContent = "";
      let idx = 0;
      typewriterTimer = setInterval(() => {
        if (idx < text.length) {
          dialogueTextEl.textContent += text[idx];
          if (idx % 4 === 0 && sfxAudioPlayer.paused && ttsAudioPlayer.paused) {
            playTalkBlip();
          }
          idx++;
        } else {
          clearInterval(typewriterTimer);
          typewriterTimer = null;
        }
      }, 24);
    }

    if (vscode) {
      vscode.postMessage({ type: 'petSpoke', text: text, character: currentCharKey });
    }
  }

  function setAvatarState(stateClass, duration = 2200) {
    if (stateResetTimer) clearTimeout(stateResetTimer);
    charStageEl.classList.remove('state-normal', 'state-pet', 'state-feed', 'state-play', 'state-poke');
    charStageEl.classList.add(stateClass);

    stateResetTimer = setTimeout(() => {
      charStageEl.classList.remove('state-pet', 'state-feed', 'state-play', 'state-poke');
      charStageEl.classList.add('state-normal');
    }, duration);
  }

  function spawnEmoji(emoji) {
    const p = document.createElement('div');
    p.className = 'floating-emoji';
    p.textContent = emoji;
    p.style.left = `${25 + Math.random() * 50}%`;
    p.style.top = `${20 + Math.random() * 35}%`;
    charStageEl.appendChild(p);
    setTimeout(() => {
      if (p.parentNode) p.parentNode.removeChild(p);
    }, 1100);
  }

  function updateMeters() {
    mood = Math.min(100, Math.max(0, mood));
    food = Math.min(100, Math.max(0, food));

    moodBarEl.style.width = `${mood}%`;
    moodValEl.textContent = `${mood}%`;

    foodBarEl.style.width = `${food}%`;
    foodValEl.textContent = `${food}%`;

    const affPercent = Math.min(100, Math.floor((affinity / 1000) * 100));
    affinityBarEl.style.width = `${affPercent}%`;
    affinityValEl.textContent = `${affinity}`;
  }

  function getRandomDialogue(category) {
    const list = CHARACTERS[currentCharKey].dialogues[category];
    if (!list || list.length === 0) return "...";
    return list[Math.floor(Math.random() * list.length)];
  }

  function handlePet() {
    playCharacterVoiceClip('pet', 'sweet');
    setAvatarState('state-pet', 2400);
    triggerParticleBurst(particleCanvas.width * 0.5, particleCanvas.height * 0.35);
    spawnEmoji('💖');
    spawnEmoji('✨');
    if (currentCharKey === 'hajimi') spawnEmoji('🐾');
    mood += 10;
    affinity += 6;
    updateMeters();
    speak(getRandomDialogue('pet'));
  }

  function handleFeed() {
    playCharacterVoiceClip('feed', 'happy');
    setAvatarState('state-feed', 2400);
    triggerParticleBurst(particleCanvas.width * 0.5, particleCanvas.height * 0.5);
    spawnEmoji(currentCharKey === 'hajimi' ? '🐟' : (currentCharKey === 'claude' ? '☕' : '🧁'));
    spawnEmoji('💕');
    food += 15;
    mood += 6;
    affinity += 4;
    updateMeters();
    speak(getRandomDialogue('feed'));
  }

  function handlePlay() {
    playCharacterVoiceClip('play', 'playful');
    setAvatarState('state-play', 2400);
    triggerParticleBurst(particleCanvas.width * 0.5, particleCanvas.height * 0.45);
    spawnEmoji(currentCharKey === 'hajimi' ? '🪄' : (currentCharKey === 'claude' ? '📖' : '☁️'));
    spawnEmoji('⭐');
    mood += 15;
    food = Math.max(0, food - 4);
    affinity += 5;
    updateMeters();
    speak(getRandomDialogue('play'));
  }

  function handlePoke() {
    playCharacterVoiceClip('poke', 'hiss');
    setAvatarState('state-poke', 2400);
    triggerParticleBurst(particleCanvas.width * 0.5, particleCanvas.height * 0.4);
    spawnEmoji('💢');
    if (currentCharKey === 'hajimi') spawnEmoji('💨');
    mood = Math.max(0, mood - 3);
    affinity += 2;
    updateMeters();
    speak(getRandomDialogue('poke'));
  }

  // 切換角色 (哈基米 / 小克 / 龍娘)
  function switchCharacter(key) {
    if (!CHARACTERS[key]) return;
    currentCharKey = key;
    const c = CHARACTERS[key];

    document.querySelectorAll('.char-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.char === key);
    });

    petNameEl.textContent = c.name;
    petBadgeEl.textContent = c.badge;
    petStatusEl.textContent = c.onlineStatus;
    speakerNameEl.textContent = c.name;
    timbreBadgeEl.textContent = c.timbreDesc;
    charAuraEl.style.background = c.auraColor;
    chatInputEl.placeholder = `對${c.name.split(' ')[0]}說點什麼喵...`;

    // 更新四個按鈕的文字與圖示
    btnPetEl.innerHTML = `<span class="btn-icon">🐾</span> <span>${c.btnLabels.pet}</span>`;
    btnFeedEl.innerHTML = `<span class="btn-icon">${c.btnLabels.feedIcon}</span> <span>${c.btnLabels.feed}</span>`;
    btnPlayEl.innerHTML = `<span class="btn-icon">${c.btnLabels.playIcon}</span> <span>${c.btnLabels.play}</span>`;
    btnPokeEl.innerHTML = `<span class="btn-icon">💬</span> <span>${c.btnLabels.poke}</span>`;

    // 載入去背立繪圖片 (優先使用內嵌 Base64 / Webview URI，確保 100% 絕對顯示！)
    const avatarUri = (window.__PET_ASSETS__ && window.__PET_ASSETS__[key]) ? window.__PET_ASSETS__[key] : c.avatarSrc;
    charImgEl.src = avatarUri;

    // 重置粒子顏色
    ambientParticles = [];
    for (let i = 0; i < 22; i++) {
      const p = createAmbientParticle();
      p.y = Math.random() * (particleCanvas.height || 310);
      ambientParticles.push(p);
    }

    setAvatarState('state-normal', 1000);
    speak(c.dialogues.welcome);
  }

  // =========================================================================
  // 4. Prompt 回覆語音播報 Card (Local LLM + Edge-TTS + FFmpeg 聲線串接)
  // =========================================================================
  function requestTtsRead(textToRead) {
    const text = (textToRead !== undefined ? textToRead : promptReplyBoxEl.value).trim();
    if (!text) {
      speak("喵嗚～目前還沒有要念出的 Prompt 回覆內容喔！可以先輸入或點擊抓最新回覆喵～");
      return;
    }
    if (!vscode) {
      speak("（提示：請在 Antigravity IDE 側邊欄中執行以啟用本地 FFmpeg + TTS 語音合成喵！）");
      return;
    }

    ttsStatusPillEl.textContent = "🎙️ 合成聲線中...";
    ttsStatusPillEl.style.color = "#FDE047";

    vscode.postMessage({
      type: 'synthesizeTts',
      text: text,
      voice: selectVoiceEl.value,
      character: currentCharKey,
      useLlm: checkUseLlmEl.checked
    });
  }

  function stopTtsAudio() {
    try {
      ttsAudioPlayer.pause();
      ttsAudioPlayer.currentTime = 0;
      sfxAudioPlayer.pause();
      charStageEl.classList.remove('is-speaking');
      ttsStatusPillEl.textContent = "已停止";
      ttsStatusPillEl.style.color = "#D1C9E8";
    } catch (_) {}
  }

  btnReadPromptEl.addEventListener('click', () => {
    requestTtsRead(promptReplyBoxEl.value);
  });

  btnStopPromptEl.addEventListener('click', stopTtsAudio);

  btnFetchLatestEl.addEventListener('click', () => {
    if (vscode) {
      ttsStatusPillEl.textContent = "讀取中...";
      vscode.postMessage({ type: 'fetchLatestPromptReply', autoRead: false });
    }
  });

  // =========================================================================
  // 5. 事件綁定與訊息監聽
  // =========================================================================
  btnPetEl.addEventListener('click', handlePet);
  btnFeedEl.addEventListener('click', handleFeed);
  btnPlayEl.addEventListener('click', handlePlay);
  btnPokeEl.addEventListener('click', handlePoke);

  // 點擊角色立繪上半身摸頭，下半身戳戳
  charStageEl.addEventListener('click', (e) => {
    const rect = charStageEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    triggerParticleBurst(clickX, clickY);
    if (clickY < rect.height * 0.5) {
      handlePet();
    } else {
      handlePoke();
    }
  });

  document.querySelectorAll('.char-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchCharacter(tab.dataset.char);
    });
  });

  btnMeowNowEl.addEventListener('click', () => {
    playCharacterVoiceClip('meow', 'sweet');
    spawnEmoji('🐱');
    spawnEmoji('🎵');
    if (currentCharKey === 'hajimi') {
      speak("喵～♪ 喵嗚～！主人聽見本哈基米的超萌貓叫了嗎喵！");
    } else if (currentCharKey === 'claude') {
      speak("（臉頰通紅）連、連我也要學貓叫嗎？……喵。只叫這一聲喔，不許笑。");
    } else {
      speak("呵呵～想聽龍娘姊姊學貓咪叫嗎？喵嗚～乖孩子，滿意了嗎？");
    }
  });

  btnRandomChatEl.addEventListener('click', () => {
    playFormantMeow('happy');
    speak(getRandomDialogue('chat'));
  });

  btnMuteEl.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (!soundEnabled) stopTtsAudio();
    btnMuteEl.textContent = soundEnabled ? '🔊 聲音' : '🔇 靜音';
  });

  document.querySelectorAll('.chip-tag').forEach(chip => {
    chip.addEventListener('click', () => {
      const action = chip.dataset.action;
      if (action === 'fortune') {
        playFormantMeow('happy');
        speak(getRandomDialogue('fortune'));
      } else if (action === 'joke') {
        playFormantMeow('playful');
        if (currentCharKey === 'hajimi') {
          speak("哈基米冷笑話：你知道為什麼 AI 小貓不會淹死嗎？……因為我們是浮點數模型喵！哈哈哈哈！");
        } else if (currentCharKey === 'claude') {
          speak("呵呵，跟你說個冷笑話喔：為什麼工程師分不清萬聖節跟聖誕節？因為 Oct 31 等於 Dec 25 呀～是不是有點可愛呢？");
        } else {
          speak("哈哈～姊姊跟你說個笑話喔：為什麼白龍姊姊從來不怕硬碟滿出來？因為姊姊都把多出來的東西塞進旁邊的小雲朵裡啦～");
        }
      } else if (action === 'cheer') {
        playCharacterVoiceClip('pet', 'sweet');
        if (currentCharKey === 'hajimi') {
          speak("主人辛苦啦！來，哈基米把毛茸茸的粉紅肉球借給你捏一捏，今天也超棒的喵～！");
        } else if (currentCharKey === 'claude') {
          speak("今天真的辛苦你囉～要是覺得累了，就先靠在我身邊休息一下吧，剩下的交給我就好囉～");
        } else {
          speak("好孩子～來龍娘姊姊這邊充充電吧！不管遇到什麼挑戰，姊姊都會陪你一起笑著跨過去的～");
        }
      }
    });
  });

  function handleCustomChat() {
    const val = chatInputEl.value.trim();
    if (!val) return;
    chatInputEl.value = "";
    playFormantMeow('sweet');

    let reply = "";
    if (currentCharKey === 'hajimi') {
      reply = `喵嗚～主人說：「${val}」！本哈基米記在小本本上啦！今天也會乖乖陪主人寫程式喵！`;
    } else if (currentCharKey === 'claude') {
      reply = `嗯～你說的「${val}」我都聽見囉，你的想法真的很有意思呢，我們一起來試試看吧～`;
    } else {
      reply = `哈哈～主人說的「${val}」，龍娘姊姊都收到囉！包在姊姊身上吧～`;
    }
    speak(reply);
    if (toggleAutoReadEl && toggleAutoReadEl.checked) {
      requestTtsRead(reply);
    }
  }

  btnSendChatEl.addEventListener('click', handleCustomChat);
  chatInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleCustomChat();
  });

  // 接收來自 VS Code Extension Host 的訊息
  window.addEventListener('message', (event) => {
    const message = event.data;
    switch (message.command) {
      case 'pet':
        handlePet();
        break;
      case 'feed':
        handleFeed();
        break;
      case 'play':
        handlePlay();
        break;
      case 'poke':
        handlePoke();
        break;
      case 'speak':
        speak(message.text || getRandomDialogue('chat'));
        break;
      case 'switchChar':
        switchCharacter(message.character);
        break;
      case 'newPromptReply':
        // 當 Antigravity 產生新的 Prompt 回覆時自動更新至 Card
        if (message.text) {
          promptReplyBoxEl.value = message.text;
          if (toggleAutoReadEl.checked || message.forceRead) {
            requestTtsRead(message.text);
          } else {
            ttsStatusPillEl.textContent = "已同步新回覆";
            ttsStatusPillEl.style.color = "#38BDF8";
          }
        }
        break;
      case 'ttsAudioReady':
        if (message.ok && message.audioDataUri) {
          const llmTag = message.usedLocalLlm ? "Local LLM + FFmpeg" : "智慧摘要 + FFmpeg";
          ttsStatusPillEl.textContent = `🔊 ${llmTag}`;
          ttsStatusPillEl.style.color = "#34D399";
          if (message.spokenText) {
            speak(message.spokenText);
          }
          if (soundEnabled) {
            try {
              sfxAudioPlayer.pause();
              ttsAudioPlayer.pause();
              ttsAudioPlayer.src = message.audioDataUri;
              charStageEl.classList.add('is-speaking');
              ttsAudioPlayer.onended = () => {
                charStageEl.classList.remove('is-speaking');
                ttsStatusPillEl.textContent = "播報完成喵～";
              };
              ttsAudioPlayer.play().catch(err => {
                console.warn("TTS Audio play err:", err);
                charStageEl.classList.remove('is-speaking');
              });
            } catch (e) {
              console.warn("TTS playback error:", e);
            }
          }
        } else {
          ttsStatusPillEl.textContent = "語音合成失敗";
          ttsStatusPillEl.style.color = "#F87171";
        }
        break;
    }
  });

  setInterval(() => {
    if (food > 15) food -= 1;
    updateMeters();
  }, 45000);

  // 初始化
  updateMeters();
  switchCharacter('hajimi');

  // 啟動後自動抓取一次最新的對話回覆預覽
  if (vscode) {
    setTimeout(() => {
      vscode.postMessage({ type: 'fetchLatestPromptReply', autoRead: false });
    }, 600);
  }
})();
