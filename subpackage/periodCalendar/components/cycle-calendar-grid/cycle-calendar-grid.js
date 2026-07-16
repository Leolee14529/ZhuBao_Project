Component({
  properties: {
    weeks: {
      type: Array,
      value: []
    },
    compact: {
      type: Boolean,
      value: false
    }
  },
  data: {
    weekLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  },
  methods: {
    onDayTap(event) {
      const { dateKey } = event.currentTarget.dataset;
      if (!dateKey) return;
      this.triggerEvent("selectday", { dateKey });
    }
  }
});
