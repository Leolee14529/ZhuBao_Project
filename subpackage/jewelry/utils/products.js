const PRODUCTS_PAGE_PATH = "/subpackage/jewelry/pages/products/index";
const PRODUCT_DETAIL_PAGE_PATH = "/subpackage/jewelry/pages/product-detail/index";

const FILTERS = [
  { id: "all", label: "全部" },
  { id: "new", label: "近期" },
  { id: "necklace", label: "项链" },
  { id: "earwear", label: "耳饰" },
  { id: "ring", label: "戒指" },
  { id: "custom", label: "材质" }
];

const PRODUCTS = [
  {
    id: "jade-circuit-collar",
    name: "翡翠层叠项圈",
    type: "项链 / 冷调层次",
    desc: "墨翠肌理与几何结构层叠，适合偏冷调造型。",
    detail: "项链以冷调层次和墨翠肌理作为主视觉，块面之间保留清晰留白，让颈部线条更利落。适合搭配黑色、墨绿、银白色服装，也适合需要突出层次感的晚间造型。",
    image: "/subpackage/jewelry/assets/product-1.jpg",
    filters: ["new", "necklace", "custom"],
    tag: "近期",
    cardClass: "product-card-xl",
    palette: [
      { label: "墨绿色", color: "#0f3f2f" },
      { label: "银白色", color: "#e2e8f0" },
      { label: "深黑色", color: "#111827" }
    ],
    scene: "适合高领、抹胸或简洁领口，让项圈成为视觉中心。"
  },
  {
    id: "green-module-earwear",
    name: "绿晶耳挂",
    type: "耳饰 / 银白线条",
    desc: "耳廓线条结合银白色结构，带有细链垂坠感。",
    detail: "绿晶耳挂以耳廓线条和轻盈垂坠为重点，绿色晶体靠近面部，银白色线条拉长轮廓。它适合搭配低饱和绿色、灰色或白色衣物，让整体更清爽。",
    image: "/subpackage/jewelry/assets/product-6.jpg",
    filters: ["new", "earwear"],
    tag: "展示",
    cardClass: "product-card-tall",
    palette: [
      { label: "翠绿色", color: "#10b981" },
      { label: "银白色", color: "#dbeafe" },
      { label: "冷灰色", color: "#64748b" }
    ],
    scene: "适合短发、盘发和露出耳廓的造型。"
  },
  {
    id: "jade-core-ring",
    name: "玉石方塔戒",
    type: "戒指 / 翡翠质感",
    desc: "大颗玉石作为主视觉，外圈以深色结构形成层次。",
    detail: "玉石方塔戒突出单颗玉石的体量感，深色外框让绿色更集中。适合与简洁手部配饰搭配，保留一个明确的视觉重点。",
    image: "/subpackage/jewelry/assets/product-7.jpg",
    filters: ["ring", "custom"],
    tag: "材质",
    cardClass: "product-card-xl",
    palette: [
      { label: "翠绿色", color: "#16a34a" },
      { label: "深黑色", color: "#020617" },
      { label: "灰绿色", color: "#647c6f" }
    ],
    scene: "适合单独佩戴，搭配素色袖口或深色针织。"
  },
  {
    id: "cascade-necklace",
    name: "晶核链坠",
    type: "项链 / 透明晶体",
    desc: "几何切面与链条层次组合，适合礼服与晚间造型。",
    detail: "晶核链坠以透明晶体和细链层次组成，视觉上更轻、更亮。适合搭配深色礼服、丝质衬衫或低领上衣，在暗色背景中保留亮点。",
    image: "/subpackage/jewelry/assets/product-5.jpg",
    filters: ["necklace", "custom"],
    tag: "",
    cardClass: "product-card-medium",
    palette: [
      { label: "透明色", color: "#f8fafc" },
      { label: "银白色", color: "#cbd5e1" },
      { label: "蓝黑色", color: "#1e3a8a" }
    ],
    scene: "适合晚间活动和需要轻盈高光的穿搭。"
  },
  {
    id: "jade-ring-lab",
    name: "翠色结构戒",
    type: "戒指 / 开放结构",
    desc: "保留结构感，强调宝石与银白色细节的比例。",
    detail: "翠色结构戒把宝石放在开放式结构中，视觉更有呼吸感。绿色主石与银白色细节形成对比，适合日常造型中做一个小面积亮点。",
    image: "/subpackage/jewelry/assets/product-3.jpg",
    filters: ["ring"],
    tag: "",
    cardClass: "product-card-tall",
    palette: [
      { label: "翠绿色", color: "#22c55e" },
      { label: "银白色", color: "#e5e7eb" },
      { label: "墨黑色", color: "#0f172a" }
    ],
    scene: "适合叠戴细戒，也适合单独作为手部重点。"
  },
  {
    id: "hex-collar",
    name: "六边形结构项圈",
    type: "项链 / 几何结构",
    desc: "六边形块面沿颈部排列，适合未来感造型。",
    detail: "六边形结构项圈强调块面秩序和颈部线条，绿色与深色块面交替出现。适合搭配平直领口、硬挺面料和几何剪裁。",
    image: "/subpackage/jewelry/assets/product-2.jpg",
    filters: ["necklace", "custom"],
    tag: "",
    cardClass: "product-card-xl",
    palette: [
      { label: "祖母绿", color: "#047857" },
      { label: "蓝黑色", color: "#0f172a" },
      { label: "蜜糖色", color: "#d97706" }
    ],
    scene: "适合廓形外套、简洁礼服和强结构穿搭。"
  },
  {
    id: "dark-jade-chip",
    name: "墨翠层叠胸链",
    type: "项链 / 深色层次",
    desc: "深色宝石和层叠结构组合，气质更克制。",
    detail: "墨翠层叠胸链以深色宝石和连续结构营造安静的份量感。适合搭配黑色、深绿或冷灰色服装，让层次细节在近距离更耐看。",
    image: "/subpackage/jewelry/assets/product-4.jpg",
    filters: ["necklace"],
    tag: "",
    cardClass: "product-card-medium",
    palette: [
      { label: "墨绿色", color: "#14532d" },
      { label: "深黑色", color: "#020617" },
      { label: "银白色", color: "#d1d5db" }
    ],
    scene: "适合安静、低调、有层次的深色穿搭。"
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

  return { leftProducts, rightProducts };
}

function getProductById(productId) {
  return PRODUCTS.find((product) => product.id === productId) || null;
}

function buildProductDetailRoute(productId) {
  return `${PRODUCT_DETAIL_PAGE_PATH}?id=${encodeURIComponent(productId || "")}`;
}

module.exports = {
  PRODUCTS_PAGE_PATH,
  PRODUCT_DETAIL_PAGE_PATH,
  FILTERS,
  PRODUCTS,
  decorateFilters,
  getProductsByFilter,
  splitProducts,
  getProductById,
  buildProductDetailRoute
};
