Component({
  methods: {
    onBackTap() {
      this.triggerEvent("back");
    },
    onCapsuleTap() {
      this.triggerEvent("capsule");
    }
  }
});
