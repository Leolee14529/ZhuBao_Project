Component({
  properties: {
    text: {
      type: String,
      value: ""
    }
  },
  methods: {
    onActionTap() {
      this.triggerEvent("action");
    }
  }
});
