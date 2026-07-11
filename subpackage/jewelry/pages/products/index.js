const share = require("../../../../utils/share");
const productData = require("../../utils/products");
const pageLayout = require("../../utils/page-layout");
const initialColumns = productData.splitProducts(productData.PRODUCTS);

Page({
  data: {
    topSpacer: pageLayout.getContentOffset(64),
    activeFilter: "all",
    filters: productData.decorateFilters("all"),
    currentProducts: productData.PRODUCTS,
    filteredCount: productData.PRODUCTS.length,
    leftProducts: initialColumns.leftProducts,
    rightProducts: initialColumns.rightProducts
  },
  onLoad() {
    share.enableShareMenu();
    this.applyNavLayout();
  },
  onShareAppMessage() {
    return share.getPageShareAppMessage(productData.PRODUCTS_PAGE_PATH);
  },
  onShareTimeline() {
    return share.getPageShareTimeline(productData.PRODUCTS_PAGE_PATH);
  },
  applyNavLayout() {
    const topSpacer = pageLayout.getContentOffset(64);
    if (topSpacer !== this.data.topSpacer) this.setData({ topSpacer });
  },
  applyFilter(filterId) {
    const currentProducts = productData.getProductsByFilter(filterId);
    const columns = productData.splitProducts(currentProducts);

    this.setData({
      activeFilter: filterId,
      filters: productData.decorateFilters(filterId),
      currentProducts,
      filteredCount: currentProducts.length,
      leftProducts: columns.leftProducts,
      rightProducts: columns.rightProducts
    });
  },
  changeFilter(e) {
    const filterId = e.currentTarget.dataset.filter || "all";
    this.applyFilter(filterId);
  },
  previewProduct(e) {
    const productId = e.currentTarget.dataset.id;
    const product = productData.getProductById(productId);

    if (!product) return;

    wx.navigateTo({
      url: productData.buildProductDetailRoute(product.id)
    });
  },
  showSearchHint() {
    wx.showToast({
      title: "搜索功能筹备中",
      icon: "none"
    });
  },
  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }

    wx.redirectTo({
      url: "/pages/home/index"
    });
  }
});
