Component({
  properties: {
    title: {
      type: String,
      value: "五行能量平衡"
    },
    subtitle: {
      type: String,
      value: "实时能量分布雷达"
    },
    note: {
      type: String,
      value: "当前状态：五行能量分布均衡，身心状态稳定。"
    },
    values: {
      type: Array,
      value: [0.88, 0.82, 0.76, 0.72, 0.8],
      observer: function () {
        if (this._isReady) {
          this.drawRadar();
        }
      }
    }
  },

  lifetimes: {
    ready: function () {
      this._isReady = true;
      this.drawRadar();
    }
  },

  methods: {
    drawRadar: function () {
      var that = this;
      wx.createSelectorQuery()
        .in(this)
        .select(".radar-canvas")
        .boundingClientRect(function (rect) {
          if (!rect) {
            return;
          }
          that.renderRadar(rect.width, rect.height);
        })
        .exec();
    },

    renderRadar: function (width, height) {
      var ctx = wx.createCanvasContext("elementRadarCanvas", this);
      var centerX = width / 2;
      var centerY = height / 2 + 8;
      var radius = Math.min(width, height) * 0.32;
      var angles = [-90, -18, 54, 126, 198];
      var values = this.properties.values && this.properties.values.length === 5 ? this.properties.values : [0.88, 0.82, 0.76, 0.72, 0.8];
      var pointColors = ["#34d399", "#ff4f6f", "#f59e0b", "#ffffff", "#2f8cff"];

      ctx.clearRect(0, 0, width, height);

      this.drawGlow(ctx, centerX, centerY, radius);
      this.drawGrid(ctx, centerX, centerY, radius, angles);
      this.drawValueArea(ctx, centerX, centerY, radius, angles, values);
      this.drawDots(ctx, centerX, centerY, radius, angles, values, pointColors);

      ctx.draw();
    },

    drawGlow: function (ctx, centerX, centerY, radius) {
      var gradient = ctx.createCircularGradient(centerX, centerY, radius * 1.05);
      gradient.addColorStop(0, "rgba(16,185,129,0.18)");
      gradient.addColorStop(0.55, "rgba(16,185,129,0.06)");
      gradient.addColorStop(1, "rgba(16,185,129,0)");
      ctx.setFillStyle(gradient);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.05, 0, Math.PI * 2);
      ctx.fill();
    },

    drawGrid: function (ctx, centerX, centerY, radius, angles) {
      var i;
      var level;
      var point;

      ctx.setLineWidth(1);
      ctx.setStrokeStyle("rgba(255,255,255,0.07)");

      for (level = 1; level <= 4; level += 1) {
        ctx.beginPath();
        for (i = 0; i < angles.length; i += 1) {
          point = this.getPoint(centerX, centerY, radius * level / 4, angles[i]);
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      for (i = 0; i < angles.length; i += 1) {
        point = this.getPoint(centerX, centerY, radius, angles[i]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    },

    drawValueArea: function (ctx, centerX, centerY, radius, angles, values) {
      var i;
      var point;

      ctx.beginPath();
      for (i = 0; i < angles.length; i += 1) {
        point = this.getPoint(centerX, centerY, radius * values[i], angles[i]);
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.closePath();
      ctx.setFillStyle("rgba(16,185,129,0.45)");
      ctx.fill();
      ctx.setLineWidth(2);
      ctx.setStrokeStyle("#20c77d");
      ctx.stroke();
    },

    drawDots: function (ctx, centerX, centerY, radius, angles, values, colors) {
      var i;
      var point;

      for (i = 0; i < angles.length; i += 1) {
        point = this.getPoint(centerX, centerY, radius * values[i], angles[i]);
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.setFillStyle(colors[i]);
        ctx.fill();
      }
    },

    getPoint: function (centerX, centerY, radius, degree) {
      var angle = degree * Math.PI / 180;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    }
  }
});
