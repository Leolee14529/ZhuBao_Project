const share = require("../../../../utils/share");

const PRODUCTS_PAGE_PATH = "/subpackage/jewelry/pages/products/index";

const FILTERS = [
  { id: "all", label: "全部" },
  { id: "new", label: "新品" },
  { id: "necklace", label: "项链" },
  { id: "earwear", label: "耳饰" },
  { id: "ring", label: "戒指" },
  { id: "custom", label: "定制" }
];

const PRODUCTS = [
  {
    id: "jade-circuit-collar",
    name: "翡翠电路项圈",
    type: "智能项链 / 传感模块",
    desc: "墨翠肌理与微型电路层叠，适合偏冷调造型。",
    price: "预约定制",
    image: "/subpackage/jewelry/assets/product-1.jpg",
    filters: ["new", "necklace", "custom"],
    tag: "新品",
    cardClass: "product-card-xl"
  },
  {
    id: "green-module-earwear",
    name: "绿晶耳挂",
    type: "智能耳饰 / 轻量佩戴",
    desc: "耳廓线条结合银色芯片结构，带有细链垂坠感。",
    price: "¥ 3,980 起",
    image: "/subpackage/jewelry/assets/product-6.jpg",
    filters: ["new", "earwear"],
    tag: "展陈款",
    cardClass: "product-card-tall"
  },
  {
    id: "jade-core-ring",
    name: "玉芯方塔戒",
    type: "智能戒指 / 翡翠原石",
    desc: "大颗玉石主视觉，外圈以黑金结构保护芯片。",
    price: "预约定制",
    image: "/subpackage/jewelry/assets/product-7.jpg",
    filters: ["ring", "custom"],
    tag: "定制",
    cardClass: "product-card-xl"
  },
  {
    id: "cascade-necklace",
    name: "晶核链坠",
    type: "智能项链 / 透明晶体",
    desc: "几何切面与链路结构组合，适合礼服与晚宴佩戴。",
    price: "¥ 6,800 起",
    image: "/subpackage/jewelry/assets/product-5.jpg",
    filters: ["necklace", "custom"],
    tag: "",
    cardClass: "product-card-medium"
  },
  {
    id: "jade-ring-lab",
    name: "翠芯实验戒",
    type: "智能戒指 / 开放结构",
    desc: "保留设备结构感，强调宝石和芯片的可见关系。",
    price: "¥ 4,680 起",
    image: "/subpackage/jewelry/assets/product-3.jpg",
    filters: ["ring"],
    tag: "",
    cardClass: "product-card-tall"
  },
  {
    id: "hex-collar",
    name: "六边形感应项圈",
    type: "智能项链 / 多点触控",
    desc: "六边模块沿颈部排列，适合未来感造型。",
    price: "预约定制",
    image: "/subpackage/jewelry/assets/product-2.jpg",
    filters: ["necklace", "custom"],
    tag: "",
    cardClass: "product-card-xl"
  },
  {
    id: "dark-jade-chip",
    name: "墨翠芯片胸链",
    type: "智能项链 / 深色金属",
    desc: "深色宝石和电路板叠放，气质更克制。",
    price: "¥ 5,200 起",
    image: "/subpackage/jewelry/assets/product-4.jpg",
    filters: ["necklace"],
    tag: "",
    cardClass: "product-card-medium"
  }
];

function decorateFilters(activeFilter) {
  return FILTERS.map((item) => ({
    id: item.id,
    label: item.label,
    itemClass: item.id === activeFilter ? "filter-pill-active" : ""
  }));
}

function getProductsByFilter(activeFilter) {
  if (activeFilter === "all") return PRODUCTS;

  return PRODUCTS.filter((product) => product.filters.indexOf(activeFilter) >= 0);
}

function splitProducts(products) {
  const leftProducts = [];
  const rightProducts = [];

  products.forEach((product, index) => {
    if (index % 2 === 0) {
      leftProducts.push(product);
      return;
    }

    rightProducts.push(product);
  });

  return {
    leftProducts,
    rightProducts
  };
}

Page({
  data: {
    topSpacer: 40,
    activeFilter: "all",
    filters: decorateFilters("all"),
    currentProducts: PRODUCTS,
    filteredCount: PRODUCTS.length,
    leftProducts: splitProducts(PRODUCTS).leftProducts,
    rightProducts: splitProducts(PRODUCTS).rightProducts
  },
  onLoad() {
    share.enableShareMenu();
    this.applyNavLayout();
    this.applyFilter("all");
  },
  onShareAppMessage() {
    return share.getPageShareAppMessage(PRODUCTS_PAGE_PATH);
  },
  onShareTimeline() {
    return share.getPageShareTimeline(PRODUCTS_PAGE_PATH);
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
    const currentProducts = getProductsByFilter(filterId);
    const columns = splitProducts(currentProducts);

    this.setData({
      activeFilter: filterId,
      filters: decorateFilters(filterId),
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
    const currentProducts = this.data.currentProducts || [];
    const product = currentProducts.find((item) => item.id === productId);

    if (!product) return;

    wx.previewImage({
      current: product.image,
      urls: currentProducts.map((item) => item.image)
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
