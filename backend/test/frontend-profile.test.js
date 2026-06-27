const assert = require("node:assert/strict");
const test = require("node:test");

const storage = new Map();
global.wx = {
  getStorageSync(key) {
    return storage.get(key);
  },
  setStorageSync(key, value) {
    storage.set(key, value);
  }
};

const fiveElements = require("../../subpackage/jewelry/utils/five-elements");

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
