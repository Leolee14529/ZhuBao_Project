const recordForm = require("../../utils/daily-record-form");

function editorState(value) {
  const record = value || {};
  const totalMinutes = Number.isInteger(record.sleepMinutes) ? record.sleepMinutes : 480;
  return {
    mood: record.mood || 3,
    energy: record.energy || 3,
    sleepHours: String(Math.floor(totalMinutes / 60)),
    sleepMinutes: String(totalMinutes % 60),
    isWearingJewelry: Boolean(record.isWearingJewelry),
    tags: Array.isArray(record.tags) ? record.tags.slice() : [],
    note: record.note || ""
  };
}

function decorateScores(scores, selectedValue) {
  return (Array.isArray(scores) ? scores : []).map((score) => ({
    value: score,
    className: Number(selectedValue) === Number(score)
      ? "score-option score-option-active"
      : "score-option"
  }));
}

function decorateTags(options, selected) {
  const tags = Array.isArray(selected) ? selected : [];
  return (Array.isArray(options) ? options : []).map((item) => ({
    value: item.value,
    label: item.label,
    activeClass: tags.indexOf(item.value) >= 0 ? "tag-option-active" : ""
  }));
}

Component({
  properties: {
    visible: { type: Boolean, value: false },
    value: { type: Object, value: null },
    dateKey: { type: String, value: "" },
    copy: { type: Object, value: {} },
    saving: { type: Boolean, value: false }
  },
  data: {
    scores: [1, 2, 3, 4, 5],
    form: editorState(null),
    tagOptions: [],
    moodOptions: decorateScores([1, 2, 3, 4, 5], 3),
    energyOptions: decorateScores([1, 2, 3, 4, 5], 3)
  },
  observers: {
    visible(visible) {
      if (!visible) return;
      const form = editorState(this.data.value);
      this.setData({
        form,
        tagOptions: decorateTags(this.data.copy.tagOptions, form.tags),
        moodOptions: decorateScores(this.data.scores, form.mood),
        energyOptions: decorateScores(this.data.scores, form.energy)
      });
    }
  },
  methods: {
    refreshScoreOptions(form) {
      const nextForm = form || this.data.form;
      this.setData({
        moodOptions: decorateScores(this.data.scores, nextForm.mood),
        energyOptions: decorateScores(this.data.scores, nextForm.energy)
      });
    },
    stopPropagation() {},
    close() {
      if (!this.data.saving) this.triggerEvent("close");
    },
    selectScore(event) {
      const field = event.currentTarget.dataset.field;
      const value = Number(event.currentTarget.dataset.value);
      const nextForm = Object.assign({}, this.data.form, { [field]: value });
      this.setData({ ["form." + field]: value });
      this.refreshScoreOptions(nextForm);
    },
    updateInput(event) {
      const field = event.currentTarget.dataset.field;
      this.setData({ ["form." + field]: event.detail.value });
    },
    updateWearing(event) {
      this.setData({ "form.isWearingJewelry": event.detail.value });
    },
    toggleTag(event) {
      const tag = event.currentTarget.dataset.tag;
      const tags = this.data.form.tags.slice();
      const index = tags.indexOf(tag);
      if (index >= 0) tags.splice(index, 1);
      else tags.push(tag);
      this.setData({ "form.tags": tags, tagOptions: decorateTags(this.data.copy.tagOptions, tags) });
    },
    submit() {
      if (this.data.saving) return;
      try {
        const input = recordForm.buildCheckinInput(this.data.form, this.data.dateKey);
        this.triggerEvent("save", input);
      } catch (error) {
        this.triggerEvent("invalid", { code: error.message });
      }
    }
  }
});
