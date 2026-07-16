const auth = require("../../utils/auth");
const share = require("../../utils/share");
const moodRuntime = require("./mood-runtime");
const topLayout = require("../../utils/top-layout");
const MOOD_ENDPOINT = "/api/mood/today";
const MOOD_RETRY_DELAY_MS = 60000;
const DEFAULT_INSPIRATION = {
  id: "inspiration-01",
  no: "NO.01",
  symbol: "Xun",
  title: "Fresh",
  subtitle: "Today's Color / Emerald Green",
  text: "Return your attention to one small thing nearby. Take six slow breaths. Jewelry reference: jade, silver, soft silver white."
};
const INSPIRATIONS = [
  DEFAULT_INSPIRATION,
  {
    id: "inspiration-02",
    no: "NO.02",
    symbol: "Glow",
    title: "Bright",
    subtitle: "Today's Color / Warm White",
    text: "Turn one formed idea into a sentence. Rotate your wrists slowly for 30 seconds. Jewelry reference: white jade and soft silver white."
  },
  {
    id: "inspiration-03",
    no: "NO.03",
    symbol: "Calm",
    title: "Grounded",
    subtitle: "Today's Color / Honey",
    text: "Slow the pace a little and finish one clear, small task first. Relax your shoulders and neck for 30 seconds. Jewelry reference: yellow jade and warm gold."
  },
  {
    id: "inspiration-04",
    no: "NO.04",
    symbol: "Soft",
    title: "Soft Light",
    subtitle: "Today's Color / Silver White",
    text: "Leave a pause before the next sentence; communication will feel easier. Close your eyes and breathe six times. Jewelry reference: icy jade and silver white."
  },
  {
    id: "inspiration-05",
    no: "NO.05",
    symbol: "Ease",
    title: "Open",
    subtitle: "Today's Color / Blue Green",
    text: "Look away from the screen and focus on something distant for 30 seconds. Jewelry reference: blue water jade, dark jade, and cool blue black."
  }
];
const DEFAULT_MOOD = {
  mood_id: "default",
  name: "Preparing",
  description: "Your daily mood is being prepared.",
  tag: "Companion",
  emoji: "🌶",
  theme_color: "#7BAE9D",
  bg_color: "#EDF6F2",
  text_color: "#243B34",
  background_mood: "Pale green mist",
  encouragement: "Take care of yourself first today."
};
const FALLBACK_MOOD = {
  ...DEFAULT_MOOD,
  name: "Take it slowly today",
  description: "No rush. Stay with your own rhythm first.",
  encouragement: "Start with one very small thing."
};

function delayMoodRetry(page, cycleDate) {
  page.moodRetryCycleDate = cycleDate;
  page.moodRetryAfter = Date.now() + MOOD_RETRY_DELAY_MS;
}

function canUseMoodResult(page, requestId, result) {
  if (!result || page.isPageUnloaded || page.moodRequestId !== requestId) return false;
  if (auth.getPersonalOwner() !== result.owner) return false;
  return result.skipped || result.owner !== "anonymous" || auth.hasPrivacyConsent();
}

function getDailyInspiration() {
  const daySeed = Math.floor(Date.now() / 86400000);
  return INSPIRATIONS[daySeed % INSPIRATIONS.length] || DEFAULT_INSPIRATION;
}

function getInitialTopSpacer() {
  try {
    return topLayout.getTopLayout().contentOffset;
  } catch (error) {
    return 64;
  }
}

Page({
  data: {
    topSpacer: getInitialTopSpacer(),
    destinyLine: "Daily inspiration and jewelry style reference",
    flipped: false,
    cardClass: "",
    inspiration: DEFAULT_INSPIRATION,
    ...moodRuntime.buildView(DEFAULT_MOOD, DEFAULT_MOOD),
    device: {
      title: "Device",
      name: "No device",
      status: "Disconnected",
      battery: "0%",
      batteryWidth: "0%"
    },
    leftProducts: [
      {
        image: "/pages/home/assets/product-1.jpg",
        tag: "Inspiration",
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
    this.homeLoadedAt = Date.now();
    share.enableShareMenu();
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (navLayout && navLayout.contentOffset) {
      const topSpacer = navLayout.contentOffset;
      if (topSpacer !== this.data.topSpacer) this.setData({ topSpacer });
    }
    this.refreshInspiration();
    this.moodRefreshTimer = setTimeout(() => this.refreshTodayMood(), 0);
  },
  onShow() {
    if (this.homeLoadedAt && Date.now() - this.homeLoadedAt < 800) return;
    this.refreshTodayMood();
  },
  onUnload() {
    this.isPageUnloaded = true;
    this.moodRequestId = (this.moodRequestId || 0) + 1;
    if (this.moodRefreshTimer) clearTimeout(this.moodRefreshTimer);
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
    this.setData(moodRuntime.buildView(mood, DEFAULT_MOOD));
    if (cycleDate) this.moodCycleDate = cycleDate;
  },
  refreshTodayMood() {
    if (this.moodRequesting || this.isPageUnloaded) return;
    const cycleDate = moodRuntime.getCycleDate();
    if (!auth.getToken() && !auth.hasPrivacyConsent()) {
      if (this.moodCycleDate !== cycleDate || this.data.mood.mood_id !== DEFAULT_MOOD.mood_id) {
        this.applyMood(FALLBACK_MOOD, cycleDate);
      }
      return;
    }
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

    const requestId = (this.moodRequestId || 0) + 1;
    this.moodRequestId = requestId;
    this.moodRequesting = true;
    moodRuntime.fetchToday({
      path: MOOD_ENDPOINT,
      getGuestId: auth.getMoodGuestId
    })
      .then((result) => {
        if (!canUseMoodResult(this, requestId, result)) return;
        if (result.skipped) {
          this.applyMood(FALLBACK_MOOD, cycleDate);
          return;
        }
        const data = result.data;
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
        if (this.isPageUnloaded || this.moodRequestId !== requestId) return;
        delayMoodRetry(this, cycleDate);
        if (this.moodCycleDate !== cycleDate) {
          this.applyMood(FALLBACK_MOOD, cycleDate);
        }
      })
      .then(() => {
        if (this.moodRequestId === requestId) this.moodRequesting = false;
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
      title: "Feature not available yet",
      icon: "none"
    });
  }
});
