Component({
  properties: {
    groups: {
      type: Array,
      value: []
    }
  },
  data: {
    viewGroups: []
  },
  observers: {
    groups(groups) {
      const viewGroups = (groups || []).map((group) => ({
        title: group.title,
        items: (group.items || []).map((row) => ({
          icon: row.icon,
          label: row.label,
          value: row.value,
          toggle: row.toggle,
          hasToggle: row.hasToggle,
          toggleClass: row.toggle ? "on" : ""
        }))
      }));
      this.setData({ viewGroups });
    }
  }
});
