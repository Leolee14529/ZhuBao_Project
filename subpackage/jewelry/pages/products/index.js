const i18n = require("../../../../utils/i18n");
const navigation = require("../../../../utils/navigation");
const share = require("../../../../utils/share");
const productData = require("../../utils/products");

function buildView(locale, filterId, moodId, query) {
  const copy = i18n.getCopy("products", locale);
  const products = productData.getProducts({ locale, filterId, moodId, query, copy });
  const columns = productData.splitProducts(products);
  return {
    copy,
    filters: (copy.filters || []).map((item) => ({
      id: item.id,
      label: item.label,
      itemClass: item.id === filterId ? "filter-pill-active" : ""
    })),
    moods: (copy.moods || []).map((item) => ({
      id: item.id,
      label: item.label,
      itemClass: item.id === moodId ? "mood-pill-active" : ""
    })),
    products,
    leftProducts: columns.leftProducts,
    rightProducts: columns.rightProducts
  };
}

Page({
  data: {
    topSpacer: 40,
    activeFilter: "all",
    activeMood: "all",
    query: "",
    searchExpanded: false,
    ...buildView(i18n.getLocale(), "all", "all", "")
  },
  onLoad() {
    share.enableShareMenu();
    const app = getApp();
    const layout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (layout && layout.contentOffset) this.setData({ topSpacer: layout.contentOffset });
    this.applyLocale();
    this.unsubscribeLocale = i18n.subscribe(() => this.applyLocale());
  },
  onUnload() {
    if (this.unsubscribeLocale) this.unsubscribeLocale();
  },
  onShareAppMessage() {
    return { title: this.data.copy.shareList, path: productData.PRODUCTS_PAGE_PATH, imageUrl: this.data.products[0] && this.data.products[0].image };
  },
  onShareTimeline() {
    return { title: this.data.copy.shareList, query: "from=timeline", imageUrl: this.data.products[0] && this.data.products[0].image };
  },
  applyLocale() {
    this.setData(buildView(i18n.getLocale(), this.data.activeFilter, this.data.activeMood, this.data.query));
  },
  applyView(filterId, moodId, query) {
    this.setData({ activeFilter: filterId, activeMood: moodId, query, ...buildView(i18n.getLocale(), filterId, moodId, query) });
  },
  changeFilter(event) {
    this.applyView(event.currentTarget.dataset.filter || "all", this.data.activeMood, this.data.query);
  },
  selectMood(event) {
    this.applyView(this.data.activeFilter, event.currentTarget.dataset.mood || "all", this.data.query);
  },
  toggleSearch() {
    this.setData({ searchExpanded: !this.data.searchExpanded });
  },
  handleSearchInput(event) {
    this.applyView(this.data.activeFilter, this.data.activeMood, event.detail.value || "");
  },
  clearSearch() {
    this.applyView(this.data.activeFilter, this.data.activeMood, "");
  },
  previewProduct(event) {
    const productId = event.currentTarget.dataset.id;
    if (!productData.getProductById(productId, i18n.getLocale(), this.data.copy)) return;
    wx.navigateTo({
      url: productData.buildProductDetailRoute(productId)
    });
  },
  goBack() {
    const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
    if (pages.length > 1) {
      wx.navigateBack({ animationType: "slide-out-right", animationDuration: 220 });
      return;
    }
    navigation.replacePage("/pages/home/index");
  }
});
