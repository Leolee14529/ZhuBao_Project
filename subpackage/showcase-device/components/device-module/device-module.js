Component({
  properties: {
    device: {
      type: Object,
      value: {}
    }
  },
  methods: {
    onTapModule() {
      this.triggerEvent("tapmodule");
    }
  }
});
