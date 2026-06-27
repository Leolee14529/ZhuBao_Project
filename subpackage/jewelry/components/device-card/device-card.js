Component({
  properties: {
    info: {
      type: Object,
      value: {
        title: "",
        name: "",
        status: "",
        battery: "",
        batteryWidth: "0%",
        statusClass: ""
      }
    }
  },
  methods: {
    onTapCard() {
      this.triggerEvent("tapcard");
    }
  }
});
