Component({
  properties: {
    title: {
      type: String,
      value: ""
    },
    desc: {
      type: String,
      value: ""
    },
    buttonText: {
      type: String,
      value: ""
    },
    type: {
      type: String,
      value: "default"
    },
    compact: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    onAction() {
      this.triggerEvent("action");
    }
  }
});
