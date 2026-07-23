Component({
  properties: {
    value: {
      type: String,
      value: ""
    },
    placeholder: {
      type: String,
      value: ""
    },
    icon: {
      type: String,
      value: ""
    },
    password: {
      type: Boolean,
      value: false
    },
    toggleable: {
      type: Boolean,
      value: false
    },
    visible: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    onInput(event) {
      this.triggerEvent("input", {
        value: event.detail.value
      });
    },
    onToggle() {
      this.triggerEvent("toggle");
    }
  }
});
