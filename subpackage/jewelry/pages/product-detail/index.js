const i18n = require("../../../../utils/i18n");
const navigation = require("../../../../utils/navigation");
const share = require("../../../../utils/share");
const productData = require("../../utils/products");

Page({
  data: {
    topSpacer: 40,
    copy: i18n.getCopy("products"),
    product: null,
    palette: [],
    displayImages: [],
    currentImageIndex: 0
  },
  onLoad(options) {
    share.enableShareMenu();
    const app = getApp();
    const layout = app.getNavLayout ? app.getNavLayout() : app.globalData.navLayout;
    if (layout && layout.contentOffset) this.setData({ topSpacer: layout.contentOffset });
    this.productId = options && options.id;
    this.previewImagePaths = {};
    this.applyLocale();
    this.unsubscribeLocale = i18n.subscribe(() => this.applyLocale());
  },
  onUnload() {
    if (this.unsubscribeLocale) this.unsubscribeLocale();
  },
  applyLocale() {
    const locale = i18n.getLocale();
    const copy = i18n.getCopy("products", locale);
    const product = productData.getProductById(this.productId, locale, copy) || productData.getProducts({ locale, copy })[0];
    const displayImages = product ? product.images : [];
    const currentImageIndex = Math.min(this.data.currentImageIndex, Math.max(displayImages.length - 1, 0));
    this.setData({ copy, product, palette: product ? product.palette : [], displayImages, currentImageIndex });
  },
  onShareAppMessage() {
    const product = this.data.product;
    return {
      title: i18n.t("products.shareDetail", { name: product ? product.name : this.data.copy.title }),
      path: product ? productData.buildProductDetailRoute(product.id) : productData.PRODUCT_DETAIL_PAGE_PATH,
      imageUrl: product && product.image
    };
  },
  onShareTimeline() {
    const product = this.data.product;
    return {
      title: i18n.t("products.shareDetail", { name: product ? product.name : this.data.copy.title }),
      query: "id=" + encodeURIComponent(product ? product.id : ""),
      imageUrl: product && product.image
    };
  },
  changeHeroImage(event) {
    const currentImageIndex = Number(event.detail && event.detail.current) || 0;
    this.setData({ currentImageIndex });
  },
  previewProductImage() {
    const product = this.data.product;
    const image = this.data.displayImages[this.data.currentImageIndex];
    if (!product || !image) return;
    const openPreview = (imagePath) => {
      wx.previewImage({
        current: imagePath,
        urls: [imagePath],
        showmenu: true
      });
    };
    if (this.previewImagePaths[image]) {
      openPreview(this.previewImagePaths[image]);
      return;
    }
    const resolveWithImageInfo = () => {
      wx.getImageInfo({
        src: image,
        success: (result) => openPreview(result.path || image),
        fail: () => openPreview(image)
      });
    };
    const userDataPath = wx.env && wx.env.USER_DATA_PATH;
    if (!userDataPath || typeof wx.getFileSystemManager !== "function") {
      resolveWithImageInfo();
      return;
    }
    const extensionMatch = image.match(/\.(png|jpe?g|webp)$/i);
    const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "jpg";
    const safeProductId = String(product.id || "jewelry").replace(/[^a-z0-9_-]/gi, "-");
    const previewPath = userDataPath + "/product-preview-" + safeProductId + "-" + this.data.currentImageIndex + "." + extension;
    const fileSystem = wx.getFileSystemManager();
    fileSystem.readFile({
      filePath: image.replace(/^\//, ""),
      success: (readResult) => {
        fileSystem.writeFile({
          filePath: previewPath,
          data: readResult.data,
          success: () => {
            this.previewImagePaths[image] = previewPath;
            openPreview(previewPath);
          },
          fail: resolveWithImageInfo
        });
      },
      fail: resolveWithImageInfo
    });
  },
  goBack() {
    const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
    if (pages.length > 1) {
      wx.navigateBack({ animationType: "slide-out-right", animationDuration: 220 });
      return;
    }
    navigation.replacePage(productData.PRODUCTS_PAGE_PATH);
  }
});
