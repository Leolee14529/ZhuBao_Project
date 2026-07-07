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
    weekLabels: ["日", "一", "二", "三", "四", "五", "六"]
  },
  methods: {
    onDayTap(event) {
      const { dateKey } = event.currentTarget.dataset;
      if (!dateKey) return;
      this.triggerEvent("selectday", { dateKey });
    }
  }
});
