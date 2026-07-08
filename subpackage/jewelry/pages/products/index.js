const share = require("../../../../utils/share");
const productData = require("../../utils/products");

Page({
  data: {
    topSpacer: 40,
    activeFilter: "all",
    filters: productData.decorateFilters("all"),
    currentProducts: productData.PRODUCTS,
    filteredCount: productData.PRODUCTS.length,
    leftProducts: productData.splitProducts(productData.PRODUCTS).leftProducts,
    rightProducts: productData.splitProducts(productData.PRODUCTS).rightProducts
  },
  onLoad() {
    share.enableShareMenu();
    this.applyNavLayout();
    this.applyFilter("all");
  },
  onShareAppMessage() {
    return share.getPageShareAppMessage(productData.PRODUCTS_PAGE_PATH);
  },
  onShareTimeline() {
    return share.getPageShareTimeline(productData.PRODUCTS_PAGE_PATH);
  },
  applyNavLayout() {
    const app = getApp();
    const navLayout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;

    if (navLayout && navLayout.contentOffset) {
      this.setData({
        topSpacer: navLayout.contentOffset
      });
    }
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
