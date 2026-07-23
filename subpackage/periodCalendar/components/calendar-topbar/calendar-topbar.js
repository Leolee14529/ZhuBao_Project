Component({
  properties: {
    topbarHeight: {
      type: Number,
      value: 52
    },
    backButtonTop: {
      type: Number,
      value: 26
    }
  },

  methods: {
    onBackTap() {
      this.triggerEvent("back");
    }
  }
});
