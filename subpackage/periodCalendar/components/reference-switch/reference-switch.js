Component({
  properties: {
    checked: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    onTap() {
      this.triggerEvent("toggle", {
        checked: !this.properties.checked
      });
    }
  }
});
