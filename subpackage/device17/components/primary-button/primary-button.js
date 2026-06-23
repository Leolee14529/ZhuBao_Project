Component({
  properties: {
    text: String
  },
  methods: {
    onActionTap() {
      this.triggerEvent("action");
    }
  }
});
