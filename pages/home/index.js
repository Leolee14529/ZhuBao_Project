const auth = require("../../utils/auth");
const share = require("../../utils/share");

const ELEMENT_LABELS = {
  wood: "翠绿色",
  fire: "红紫色",
  earth: "蜜糖色",
  metal: "银白色",
  water: "蓝黑色"
};

const DEFAULT_INSPIRATION = {
  id: "inspiration-01",
  no: "NO.01",
  symbol: "润",
  title: "清润",
  subtitle: "今日色彩 / 青绿色",
  text: "把注意力放回手边的一件小事。慢慢呼吸 6 次。佩戴参考：玉石、银色、柔光金属。"
};

const INSPIRATIONS = [
  DEFAULT_INSPIRATION,
  {
    id: "inspiration-02",
    no: "NO.02",
    symbol: "明",
    title: "明亮",
    subtitle: "今日色彩 / 暖白色",
    text: "把已经成形的想法写成一句话。慢慢转动手腕 30 秒。佩戴参考：白玉、柔光金属。"
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
    text: "给一句话留出停顿，沟通会更轻松。闭眼呼吸 6 次。佩戴参考：冰种、银色金属。"
  },
  {
    id: "inspiration-05",
    no: "NO.05",
    symbol: "展",
    title: "舒展",
    subtitle: "今日色彩 / 蓝绿色",
    text: "把视线从屏幕移开，看向远处 30 秒。佩戴参考：蓝水、墨翠、冷调金属。"
  }
];

const MOOD_OPTIONS = [
  { id: "calm", label: "平静", itemClass: "" },
  { id: "tired", label: "疲惫", itemClass: "" },
  { id: "tense", label: "紧绷", itemClass: "" },
  { id: "hopeful", label: "期待", itemClass: "" },
  { id: "low", label: "低落", itemClass: "" }
];

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + date;
}

function getDailyInspiration() {
  const daySeed = Math.floor(Date.now() / 86400000);
  return INSPIRATIONS[daySeed % INSPIRATIONS.length] || DEFAULT_INSPIRATION;
}

function buildHomeProfile() {
  const result = auth.getPersonalData(auth.WUXING_KEY);
  if (!result || !result.elements) {
    return {
      destinyLine: "暂无色彩参考数据",
      customDesc: "暂无色彩参考数据"
    };
  }

  const ranked = Object.keys(ELEMENT_LABELS).map((key) => ({
    key,
    score: Number(result.elements[key] || 0)
  })).sort((left, right) => right.score - left.score);
  const dominant = ELEMENT_LABELS[ranked[0].key];
  const weakest = ELEMENT_LABELS[ranked[ranked.length - 1].key];

  return {
    destinyLine: dominant + "倾向更明显 · " + weakest + "可作平衡参考",
    customDesc: dominant + "倾向更明显，可搭配" + weakest + "丰富整体风格层次"
  };
}

Page({
  data: {
    topSpacer: 40,
    destinyLine: "暂无色彩参考数据",
    customDesc: "暂无色彩参考数据",
    flipped: false,
    cardClass: "",
    inspiration: DEFAULT_INSPIRATION,
    moodLabel: "暂无",
    moodDesc: "轻点记录今天",
    moodOptions: MOOD_OPTIONS,
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
        tag: "新品",
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
    share.enableShareMenu();
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) {
      this.setData({
        topSpacer: navLayout.contentOffset
      });
    }
    this.refreshInspiration();
    this.refreshMoodRecord();
    this.applyBirthProfile();
  },
  onShow() {
    this.refreshMoodRecord();
    this.applyBirthProfile();
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
  refreshMoodRecord() {
    const today = getTodayKey();
    const record = auth.getPersonalData(auth.DAILY_MOOD_KEY);
    const isToday = record && record.date === today;
    const moodId = isToday ? record.moodId : "";
    const mood = MOOD_OPTIONS.find((item) => item.id === moodId);

    this.setData({
      moodLabel: mood ? mood.label : "暂无",
      moodDesc: mood ? "今日已记录" : "轻点记录今天",
      moodOptions: MOOD_OPTIONS.map((item) => ({
        id: item.id,
        label: item.label,
        itemClass: item.id === moodId ? "mood-option-selected" : ""
      }))
    });
  },
  recordMood(e) {
    const moodId = e.currentTarget.dataset.mood;
    const mood = MOOD_OPTIONS.find((item) => item.id === moodId);
    if (!mood) return;

    auth.setPersonalData(auth.DAILY_MOOD_KEY, {
      date: getTodayKey(),
      moodId: mood.id,
      moodLabel: mood.label
    });
    this.refreshMoodRecord();
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
  },
  openFiveElementCustomizer() {
    if (!auth.requireLogin({ source: "/subpackage/jewelry/pages/five-elements/index" })) return;
    wx.navigateTo({
      url: "/subpackage/jewelry/pages/five-elements/index"
    });
  },
  applyBirthProfile() {
    const profile = buildHomeProfile();
    this.setData({
      destinyLine: profile.destinyLine,
      customDesc: profile.customDesc
    });
  }
});
