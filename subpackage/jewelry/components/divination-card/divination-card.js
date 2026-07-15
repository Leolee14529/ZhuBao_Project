const request = require("../../../../utils/request");

const DEFAULT_FORTUNE = {
  id: "fortune-088",
  no: "NO.88",
  symbol: "巽",
  title: "中吉",
  subtitle: "Wind / Wood",
  text: "风行水上，自然成纹。今日灵感如风，宜顺势而为；把注意力留给正在发生的好事。"
};

Component({
  data: {
    flipped: false,
    cardClass: "",
    fortune: DEFAULT_FORTUNE
  },
  lifetimes: {
    attached() {
      this.loadRandomFortune();
    }
  },
  methods: {
    toggle() {
      const flipped = !this.data.flipped;
      this.setData({
        flipped,
        cardClass: flipped ? "divination-card-flipped" : ""
      });
    },
    loadRandomFortune() {
      const previousId = wx.getStorageSync("lastDivinationFortuneId") || "";
      const path = previousId
        ? "/api/fortunes/random?previousId=" + encodeURIComponent(previousId)
        : "/api/fortunes/random";

      request.get(path)
        .then((data) => {
          const fortune = data && data.fortune;
          if (!fortune || !fortune.id) return;

          wx.setStorageSync("lastDivinationFortuneId", fortune.id);
          this.setData({ fortune });
        })
        .catch((error) => {
          console.warn("load random fortune failed", error);
        });
    }
  }
});
