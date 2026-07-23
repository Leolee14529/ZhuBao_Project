function buildSections(copy) {
  return [
    {
      id: "device",
      title: copy.device,
      items: [
        { id: "ring", isRing: true, label: copy.ring, arrow: false, rowClass: "", valueClass: "row-value-shifted" },
        { id: "sleep", label: copy.sleep, value: copy.unavailable, rowClass: "setting-row-last" }
      ]
    },
    {
      id: "preferences",
      title: copy.preferences,
      items: [
        { id: "notifications", label: copy.notifications, value: copy.unavailable, rowClass: "" },
        { id: "language", isLanguage: true, label: copy.language, arrow: true, rowClass: "setting-row-last" }
      ]
    }
  ];
}

module.exports = { buildSections };
