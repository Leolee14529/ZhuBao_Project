const assert = require("node:assert/strict");
const test = require("node:test");

const storage = new Map();
global.wx = {
  getStorageSync(key) {
    return storage.get(key);
  },
  setStorageSync(key, value) {
    storage.set(key, value);
  },
  removeStorageSync(key) {
    storage.delete(key);
  }
};

const fiveElements = require("../../subpackage/jewelry/utils/five-elements");
const auth = require("../../utils/auth");

test("server result is converted into page profile data", () => {
  const profile = fiveElements.buildProfileFromResult({
    birthDate: "2003-12-09",
    birthTime: "10:30",
    gender: "female",
    elements: {
      wood: 25,
      fire: 13,
      earth: 13,
      metal: 12,
      water: 37
    },
    analysis: "server analysis"
  });

  assert.equal(profile.focusElement, "蓝黑色");
  assert.equal(profile.radarValues.length, 5);
  assert.equal(profile.elements.length, 5);
  assert.equal(profile.summaryText.includes("倾向更明显"), true);
  assert.equal(profile.summaryText.includes("server analysis"), false);
});

test("matching saved server result is used for customization preview", () => {
  const profile = fiveElements.buildProfileForInput(
    {
      date: "1998-08-08",
      time: "08:30",
      gender: "female"
    },
    {
      allowLocalFallback: false,
      result: {
        birthDate: "1998-08-08",
        birthTime: "08:30",
        gender: "female",
        elements: {
          wood: 13,
          fire: 13,
          earth: 62,
          metal: 0,
          water: 12
        },
        analysis: "earth server analysis"
      }
    }
  );

  assert.equal(profile.focusElement, "蜜糖色");
  assert.equal(profile.summaryText.includes("倾向更明显"), true);
  assert.equal(profile.summaryText.includes("earth server analysis"), false);
  assert.equal(profile.elements[0].key, "earth");
  assert.match(profile.elements[0].suitable, /^62%/);
});

test("saved wuxing result strips server prose before local storage", () => {
  storage.clear();
  fiveElements.saveWuxingResult({
    userId: "u1",
    birthDate: "1998-08-08",
    birthTime: "08:30",
    gender: "female",
    elements: {
      wood: 13,
      fire: 13,
      earth: 62,
      metal: 0,
      water: 12
    },
    analysis: "旧服务文案",
    suggestion: "旧建议文案",
    bazi: { year: "x" },
    raw: { stems: [] }
  });

  const stored = auth.getPersonalData(auth.WUXING_KEY);
  assert.equal(stored.analysis, undefined);
  assert.equal(stored.suggestion, undefined);
  assert.equal(stored.bazi, undefined);
  assert.equal(stored.raw, undefined);
  assert.deepEqual(stored.elements, {
    wood: 13,
    fire: 13,
    earth: 62,
    metal: 0,
    water: 12
  });
});

test("customization preview avoids local heuristic when server result is missing", () => {
  const profile = fiveElements.buildProfileForInput(
    {
      date: "1998-08-08",
      time: "08:30",
      gender: "female"
    },
    {
      allowLocalFallback: false,
      result: null
    }
  );

  assert.equal(profile.focusElement, "无");
  assert.equal(profile.destinyLine, "暂无色彩参考数据");
});

test("retired customization page redirects home without uploading birth data", () => {
  const pageLogic = require("node:fs").readFileSync(
    require("node:path").resolve(__dirname, "../../subpackage/jewelry/pages/five-elements/index.js"),
    "utf8"
  );

  assert.ok(pageLogic.includes("returnHome"));
  assert.ok(pageLogic.includes("wx.reLaunch"));
  assert.equal(pageLogic.includes("/api/wuxing/save"), false);
  assert.equal(pageLogic.includes("auth.getPersonalData(auth.BIRTH_NOTICE_KEY)"), false);
  assert.equal(pageLogic.includes("auth.hasPrivacyConsent()"), false);
});

test("current profile does not fall back to local heuristic without server result", () => {
  storage.clear();
  auth.setPersonalData(auth.BIRTH_KEY, {
    date: "2003-12-09",
    time: "10:30",
    gender: "female"
  });

  const profile = fiveElements.buildCurrentProfile();

  assert.equal(profile.focusElement, "无");
  assert.equal(profile.destinyLine, "暂无色彩参考数据");
});
