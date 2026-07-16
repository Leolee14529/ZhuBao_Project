const PRODUCTS_PAGE_PATH = "/subpackage/jewelry/pages/products/index";
const PRODUCT_DETAIL_PAGE_PATH = "/subpackage/jewelry/pages/product-detail/index";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "new", label: "Recent" },
  { id: "necklace", label: "Necklaces" },
  { id: "earwear", label: "Earrings" },
  { id: "ring", label: "Rings" },
  { id: "custom", label: "Materials" }
];

const PRODUCTS = [
  {
    id: "jade-circuit-collar",
    name: "Emerald Layered Collar",
    type: "Necklace / Cool Layers",
    desc: "Dark jade texture and geometric layers for cool-toned styling.",
    detail: "This collar uses dark jade texture and cool layered geometry as its visual focus. Clear spacing between the blocks keeps the neckline sharp. Pair it with black, deep green, or silver-white clothing, especially for evening looks that need structure.",
    image: "/subpackage/jewelry/assets/product-1.jpg",
    filters: ["new", "necklace", "custom"],
    tag: "Recent",
    cardClass: "product-card-xl",
    palette: [
      { label: "Deep Green", color: "#0f3f2f" },
      { label: "Silver White", color: "#e2e8f0" },
      { label: "Deep Black", color: "#111827" }
    ],
    scene: "Best with high necklines, strapless cuts, or clean collars that let the piece lead."
  },
  {
    id: "green-module-earwear",
    name: "Green Crystal Ear Cuff",
    type: "Earrings / Silver Lines",
    desc: "Ear-contour lines and silver-white structure with a light chain drop.",
    detail: "The green crystal sits close to the face while silver-white lines lengthen the profile. It works well with soft greens, gray, and white for a fresh, precise look.",
    image: "/subpackage/jewelry/assets/product-6.jpg",
    filters: ["new", "earwear"],
    tag: "Showcase",
    cardClass: "product-card-tall",
    palette: [
      { label: "Emerald", color: "#10b981" },
      { label: "Silver White", color: "#dbeafe" },
      { label: "Cool Gray", color: "#64748b" }
    ],
    scene: "Best with short hair, pinned-up hair, or styling that reveals the ear."
  },
  {
    id: "jade-core-ring",
    name: "Jade Tower Ring",
    type: "Ring / Jade Texture",
    desc: "A bold jade stone framed by dark structure for a layered focus.",
    detail: "The ring highlights the weight of a single jade stone. A dark frame concentrates the green and keeps the hand styling clean. Wear it alone or with simple sleeves for one clear focal point.",
    image: "/subpackage/jewelry/assets/product-7.jpg",
    filters: ["ring", "custom"],
    tag: "Material",
    cardClass: "product-card-xl",
    palette: [
      { label: "Emerald", color: "#16a34a" },
      { label: "Deep Black", color: "#020617" },
      { label: "Gray Green", color: "#647c6f" }
    ],
    scene: "Best worn solo with plain cuffs or dark knitwear."
  },
  {
    id: "cascade-necklace",
    name: "Crystal Core Pendant",
    type: "Necklace / Clear Crystal",
    desc: "Geometric facets and fine chain layers for evening styling.",
    detail: "Clear crystal and fine chain layers make this pendant feel light and bright. It pairs with dark dresses, silk shirts, and low necklines, keeping a subtle highlight against darker fabrics.",
    image: "/subpackage/jewelry/assets/product-5.jpg",
    filters: ["necklace", "custom"],
    tag: "",
    cardClass: "product-card-medium",
    palette: [
      { label: "Clear", color: "#f8fafc" },
      { label: "Silver White", color: "#cbd5e1" },
      { label: "Blue Black", color: "#1e3a8a" }
    ],
    scene: "Best for evening events or outfits that need a light-catching accent."
  },
  {
    id: "jade-ring-lab",
    name: "Emerald Open Ring",
    type: "Ring / Open Structure",
    desc: "A structured ring that balances gemstone volume with silver-white detail.",
    detail: "The open setting gives the gemstone more breathing room. Emerald and silver-white details create contrast, making it an easy small accent for daily outfits.",
    image: "/subpackage/jewelry/assets/product-3.jpg",
    filters: ["ring"],
    tag: "",
    cardClass: "product-card-tall",
    palette: [
      { label: "Emerald", color: "#22c55e" },
      { label: "Silver White", color: "#e5e7eb" },
      { label: "Ink Black", color: "#0f172a" }
    ],
    scene: "Best stacked with slim rings or worn alone as a hand accent."
  },
  {
    id: "hex-collar",
    name: "Hexagonal Structure Collar",
    type: "Necklace / Geometric Structure",
    desc: "Hexagonal blocks line the neck for a futuristic silhouette.",
    detail: "This collar emphasizes geometric order and neckline structure. Green and dark blocks alternate across the piece, pairing well with straight necklines, crisp fabrics, and architectural tailoring.",
    image: "/subpackage/jewelry/assets/product-2.jpg",
    filters: ["necklace", "custom"],
    tag: "",
    cardClass: "product-card-xl",
    palette: [
      { label: "Emerald", color: "#047857" },
      { label: "Blue Black", color: "#0f172a" },
      { label: "Honey", color: "#d97706" }
    ],
    scene: "Best with structured coats, clean dresses, and geometric styling."
  },
  {
    id: "dark-jade-chip",
    name: "Dark Jade Layered Chest Chain",
    type: "Necklace / Dark Layers",
    desc: "Dark gemstones and layered structure with a restrained mood.",
    detail: "Dark gemstones and repeating structure create a calm sense of weight. Pair it with black, deep green, or cool gray so the layered details reward a closer look.",
    image: "/subpackage/jewelry/assets/product-4.jpg",
    filters: ["necklace"],
    tag: "",
    cardClass: "product-card-medium",
    palette: [
      { label: "Deep Green", color: "#14532d" },
      { label: "Deep Black", color: "#020617" },
      { label: "Silver White", color: "#d1d5db" }
    ],
    scene: "Best for calm, understated dark outfits with visible layering."
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
