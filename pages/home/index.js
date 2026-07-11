const auth = require("../../utils/auth");
const share = require("../../utils/share");
const moodRuntime = require("./mood-runtime");
const MOOD_ENDPOINT = "/api/mood/today";
const MOOD_RETRY_DELAY_MS = 60000;
const DEFAULT_INSPIRATION = {
  id: "inspiration-01",
  no: "NO.01",
  symbol: "润",
  title: "清润",
  subtitle: "今日色彩 / 青绿色",
  text: "把注意力放回手边的一件小事。慢慢呼吸 6 次。佩戴参考：玉石、银色、柔光银白。"
};
const INSPIRATIONS = [
  DEFAULT_INSPIRATION,
  {
    id: "inspiration-02",
    no: "NO.02",
    symbol: "明",
    title: "明亮",
    subtitle: "今日色彩 / 暖白色",
    text: "把已经成形的想法写成一句话。慢慢转动手腕 30 秒。佩戴参考：白玉、柔光银白。"
  },
  {
    id: "inspiration-03",
    no: "NO.03",
    symbol: "稳",
    title: "沉稳",
    subtitle: "今日色彩 / 蜜糖色",
    text: "把节奏放慢一点，先完成一件确定的小事。肩颈放松 30 秒。佩戴参考：黄翡、暖金色。"
  },
  {
    id: "inspiration-04",
    no: "NO.04",
    symbol: "柔",
    title: "柔光",
    subtitle: "今日色彩 / 银白色",
    text: "给一句话留出停顿，沟通会更轻松。闭眼呼吸 6 次。佩戴参考：冰种、银白色。"
  },
  {
    id: "inspiration-05",
    no: "NO.05",
    symbol: "展",
    title: "舒展",
    subtitle: "今日色彩 / 蓝绿色",
    text: "把视线从屏幕移开，看向远处 30 秒。佩戴参考：蓝水、墨翠、冷调蓝黑。"
  }
];
const DEFAULT_MOOD = {
  mood_id: "default",
  name: "正在生成",
  description: "系统正在为你准备今天的状态。",
  tag: "陪伴",
  emoji: "🌿",
  theme_color: "#7BAE9D",
  bg_color: "#EDF6F2",
  text_color: "#243B34",
  background_mood: "浅绿雾感",
  encouragement: "今天也先照顾好自己。"
};
const FALLBACK_MOOD = {
  ...DEFAULT_MOOD,
  name: "今天也慢慢来",
  description: "不用急，先照顾好自己的节奏。",
  encouragement: "先从一件很小的事开始。"
};

function normalizeHexColor(color, fallback) {
  const value = typeof color === "string" ? color.trim() : "";
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function delayMoodRetry(page, cycleDate) {
  page.moodRetryCycleDate = cycleDate;
  page.moodRetryAfter = Date.now() + MOOD_RETRY_DELAY_MS;
}

function colorToRgba(color, alpha, fallback) {
  const value = typeof color === "string" ? color.trim() : "";
  const match = value.match(/^#([0-9a-fA-F]{6})$/);
  if (!match) return fallback;
  const hex = match[1];
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function normalizeMood(rawMood) {
  const mood = rawMood || {};
  return {
    mood_id: mood.mood_id || mood.id || DEFAULT_MOOD.mood_id,
    name: mood.name || DEFAULT_MOOD.name,
    description: mood.description || DEFAULT_MOOD.description,
    tag: mood.tag || DEFAULT_MOOD.tag,
    emoji: mood.emoji || DEFAULT_MOOD.emoji,
    theme_color: normalizeHexColor(mood.theme_color, DEFAULT_MOOD.theme_color),
    bg_color: normalizeHexColor(mood.bg_color, DEFAULT_MOOD.bg_color),
    text_color: normalizeHexColor(mood.text_color, DEFAULT_MOOD.text_color),
    icon_url: mood.icon_url || "",
    background_url: mood.background_url || "",
    background_mood: mood.background_mood || DEFAULT_MOOD.background_mood,
    encouragement: mood.encouragement || DEFAULT_MOOD.encouragement,
    date: mood.date || "",
    updated_at: mood.updated_at || "",
    generated_at: mood.generated_at || ""
  };
}

function buildMoodView(rawMood) {
  const mood = normalizeMood(rawMood);
  const accent = mood.theme_color || DEFAULT_MOOD.theme_color;
  const accentSoft = colorToRgba(accent, 0.16, "rgba(57, 216, 122, 0.16)");
  const accentFaint = colorToRgba(accent, 0.09, "rgba(57, 216, 122, 0.09)");
  const bgFaint = colorToRgba(mood.bg_color, 0.08, "rgba(57, 216, 122, 0.08)");

  return {
    mood,
    moodCardStyle: `border-color: ${accentSoft}; background: linear-gradient(135deg, ${bgFaint}, transparent 64%), linear-gradient(180deg, rgba(23, 25, 32, .96), rgba(12, 17, 15, .94));`,
    moodColorCardStyle: `border-color: ${accentSoft}; background: linear-gradient(135deg, ${accentFaint}, transparent 62%), #171920;`,
    moodAccentStyle: `color: ${accent};`,
    moodDotStyle: `background-color: ${accent}; box-shadow: 0 0 16rpx ${accentSoft};`,
    moodTagStyle: `color: ${accent}; border-color: ${accentSoft}; background-color: ${accentFaint};`,
    colorSwatchStyle: `background-color: ${accent}; box-shadow: 0 10rpx 26rpx ${accentSoft};`,
    moodColorTitle: mood.background_mood || (mood.tag ? mood.tag + "色彩" : "今日色彩"),
    moodColorDesc: "随今日心情同步"
  };
}

function getDailyInspiration() {
  const daySeed = Math.floor(Date.now() / 86400000);
  return INSPIRATIONS[daySeed % INSPIRATIONS.length] || DEFAULT_INSPIRATION;
}

function getCompactTopSpacer(navLayout) {
  if (!navLayout) return 44;
  const menuBottom = Number(navLayout.menuBottom || 0);
  const statusBarHeight = Number(navLayout.statusBarHeight || 0);
  const contentOffset = Number(navLayout.contentOffset || 0);
  const safeBottom = menuBottom ? menuBottom + 4 : 0;
  const safeStatus = statusBarHeight ? statusBarHeight + 34 : 0;
  const compact = Math.max(safeBottom, safeStatus, 44);
  return Math.min(contentOffset || compact, compact);
}

Page({
  data: {
    topSpacer: 44,
    destinyLine: "今日灵感与珠宝风格参考",
    flipped: false,
    cardClass: "",
    inspiration: DEFAULT_INSPIRATION,
    ...buildMoodView(DEFAULT_MOOD),
    device: {
      title: "设备",
      name: "暂无设备",
      status: "未连接",
      battery: "0%",
      batteryWidth: "0%"
    },
    leftProducts: [
      {
        image: "/pages/home/assets/product-1.jpg",
        tag: "灵感",
        cardClass: "product-card-tall"
      },
      {
        image: "/pages/home/assets/product-3.jpg",
        tag: "",
        cardClass: "product-card-tall"
      }
    ],
    rightProducts: [
      {
        image: "/pages/home/assets/product-2.jpg",
        tag: "",
        cardClass: "product-card-tall"
      },
      {
        image: "/pages/home/assets/product-4.jpg",
        tag: "",
        cardClass: "product-card-tall"
      }
    ]
  },
  onLoad() {
    this.isPageUnloaded = false;
    share.enableShareMenu();
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) {
      this.setData({
        topSpacer: getCompactTopSpacer(navLayout)
      });
    }
    this.refreshInspiration();
    this.refreshTodayMood();
  },
  onShow() {
    this.refreshTodayMood();
  },
  onUnload() {
    this.isPageUnloaded = true;
  },
  onShareAppMessage() {
    return share.getHomeShareAppMessage();
  },
  onShareTimeline() {
    return share.getHomeShareTimeline();
  },
  toggleInspiration() {
    const flipped = !this.data.flipped;
    this.setData({
      flipped,
      cardClass: flipped ? "inspiration-card-flipped" : ""
    });
  },
  refreshInspiration() {
    this.setData({ inspiration: getDailyInspiration() });
  },
  applyMood(mood, cycleDate) {
    if (this.isPageUnloaded) return;
    this.setData(buildMoodView(mood));
    if (cycleDate) this.moodCycleDate = cycleDate;
  },
  refreshTodayMood() {
    if (this.moodRequesting || this.isPageUnloaded) return;
    const cycleDate = moodRuntime.getCycleDate();
    const cached = auth.getPersonalData(auth.DAILY_MOOD_KEY);
    if (cached && cached.mood && cached.date === cycleDate) {
      if (this.moodCycleDate !== cycleDate) {
        this.applyMood(cached.mood, cycleDate);
      }
      return;
    }
    if (this.moodRetryCycleDate === cycleDate &&
      Date.now() < this.moodRetryAfter) return;
    if (this.moodCycleDate && this.moodCycleDate !== cycleDate) {
      this.moodCycleDate = "";
      this.applyMood(DEFAULT_MOOD);
    }

    this.moodRequesting = true;
    moodRuntime.fetchToday({
      path: MOOD_ENDPOINT,
      getGuestId: auth.getMoodGuestId
    })
      .then((data) => {
        const mood = data && data.mood ? data.mood : data;
        if (!mood || !mood.mood_id) {
          delayMoodRetry(this, cycleDate);
          if (this.moodCycleDate !== cycleDate) {
            this.applyMood(FALLBACK_MOOD, cycleDate);
          }
          return;
        }
        const moodDate = mood.date || cycleDate;
        auth.setPersonalData(auth.DAILY_MOOD_KEY, {
          date: moodDate,
          mood
        });
        this.moodRetryAfter = 0;
        this.applyMood(mood, moodDate);
      })
      .catch(() => {
        delayMoodRetry(this, cycleDate);
        if (this.moodCycleDate !== cycleDate) {
          this.applyMood(FALLBACK_MOOD, cycleDate);
        }
      })
      .then(() => {
        this.moodRequesting = false;
      });
  },
  goData() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/data/index" })) return;
    wx.redirectTo({
      url: "/subpackage/jewelry/pages/data/index"
    });
  },
  goSettings() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/settings/index" })) return;
    wx.redirectTo({
      url: "/subpackage/jewelry/pages/settings/index"
    });
  },
  noop() {},
  openProducts() {
    wx.navigateTo({
      url: "/subpackage/jewelry/pages/products/index"
    });
  },
  openDevice() {
    wx.showToast({
      title: "功能暂未开放",
      icon: "none"
    });
  }
});
