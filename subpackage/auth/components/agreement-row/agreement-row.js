Component({
  properties: {
    checked: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    onToggle() {
      this.triggerEvent("toggle");
    }
  }
});
