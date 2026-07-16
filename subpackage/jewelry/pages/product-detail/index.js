const share = require("../../../../utils/share");
const productData = require("../../utils/products");
const pageLayout = require("../../utils/page-layout");
const topLayout = require("../../../../utils/top-layout");

Page({
  data: {
    topSpacer: pageLayout.getContentOffset(64),
    backButtonTop: topLayout.getTopLayout().backButtonTop,
    product: null,
    palette: []
  },

  onLoad(options) {
    share.enableShareMenu();
    this.applyNavLayout();
    this.loadProduct(options && options.id);
  },

  onShareAppMessage() {
    const product = this.data.product;
    if (!product) {
      return share.getPageShareAppMessage(productData.PRODUCT_DETAIL_PAGE_PATH);
    }

    return {
      title: "Haimi Power | " + product.name,
      path: productData.buildProductDetailRoute(product.id),
      imageUrl: product.image
    };
  },

  onShareTimeline() {
    const product = this.data.product;
    const path = product
      ? productData.buildProductDetailRoute(product.id)
      : productData.PRODUCT_DETAIL_PAGE_PATH;

    return {
      title: product ? "Haimi Power | " + product.name : "Haimi Power | Style Detail",
      query: "from=timeline&page=" + encodeURIComponent(path),
      imageUrl: product ? product.image : "/subpackage/jewelry/assets/product-6.jpg"
    };
  },

  applyNavLayout() {
    const topSpacer = pageLayout.getContentOffset(64);
    const backButtonTop = topLayout.getTopLayout().backButtonTop;
    if (topSpacer !== this.data.topSpacer || backButtonTop !== this.data.backButtonTop) {
      this.setData({ topSpacer, backButtonTop });
    }
  },

  loadProduct(productId) {
    const product = productData.getProductById(productId) || productData.PRODUCTS[0];

    this.setData({
      product,
      palette: product.palette || []
    });
  },

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }

    wx.redirectTo({
      url: productData.PRODUCTS_PAGE_PATH
    });
  },

  handleBack() {
    this.goBack();
  }
});
