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

  assert.equal(profile.focusElement, "水");
  assert.equal(profile.radarValues.length, 5);
  assert.equal(profile.elements.length, 5);
  assert.equal(profile.summaryText, "server analysis");
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

  assert.equal(profile.focusElement, "土");
  assert.equal(profile.summaryText, "earth server analysis");
  assert.equal(profile.elements[0].key, "earth");
  assert.match(profile.elements[0].suitable, /^62%/);
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
  assert.equal(profile.destinyLine, "暂无真实五行数据");
});

test("customization preview requires prior birth-data notice before upload", () => {
  const pageLogic = require("node:fs").readFileSync(
    require("node:path").resolve(__dirname, "../../subpackage/jewelry/pages/five-elements/index.js"),
    "utf8"
  );

  assert.ok(pageLogic.includes("auth.getPersonalData(auth.BIRTH_NOTICE_KEY)"));
  assert.ok(pageLogic.includes("auth.hasPrivacyConsent()"));
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
  assert.equal(profile.destinyLine, "暂无真实五行数据");
});
