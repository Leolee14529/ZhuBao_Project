Component({
  properties: {
    flipped: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    toggleCard() {
      this.triggerEvent("toggle");
    }
  }
});
