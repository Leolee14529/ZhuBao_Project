Component({
  data: {
    flipped: false,
    cardClass: ""
  },
  methods: {
    toggle() {
      const flipped = !this.data.flipped;
      this.setData({
        flipped,
        cardClass: flipped ? "flipped" : ""
      });
    }
  }
});
