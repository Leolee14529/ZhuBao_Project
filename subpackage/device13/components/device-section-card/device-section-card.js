Component({
  properties: {
    title: String,
    rows: {
      type: Array,
      value: []
    }
  },
  methods: {
    onRowTap(event) {
      const item = event.currentTarget.dataset.item;
      this.triggerEvent("select", { item });
    }
  }
});
