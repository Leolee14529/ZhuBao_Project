const topLayout = require("../../../utils/top-layout");

function getContentOffset(fallback) {
  const fallbackValue = Number(fallback) > 0 ? Number(fallback) : 64;
  try {
    const layout = topLayout.getTopLayout();
    const contentOffset = Number(layout && layout.contentOffset);
    return contentOffset > 0 ? contentOffset : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

module.exports = {
  getContentOffset
};
