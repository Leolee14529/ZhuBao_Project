Component({
  properties: {
    info: {
      type: Object,
      value: {}
    }
  },
  methods: {
    onTapCard() {
      this.triggerEvent("tapcard");
    }
  }
});
