const PRODUCTS_PAGE_PATH = "/subpackage/jewelry/pages/products/index";
const PRODUCT_DETAIL_PAGE_PATH = "/subpackage/jewelry/pages/product-detail/index";

const DEFINITIONS = [
  {
    id: "jade-circuit-collar", image: "/subpackage/jewelry/assets/product-1.jpg", filters: ["new", "necklace", "material"], moods: ["focused", "grounded"], tagKey: "recent", cardClass: "product-card-xl",
    colors: ["#0f3f2f", "#e2e8f0", "#111827"],
    zh: ["翡翠层叠项圈", "项链 / 冷调层次", "墨翠肌理与几何结构层叠，适合偏冷调造型。", "项链以冷调层次和墨翠肌理作为主视觉，块面之间保留清晰留白，让颈部线条更利落。适合搭配黑色、墨绿、银白色服装，也适合需要突出层次感的晚间造型。", "适合高领、抹胸或简洁领口，让项圈成为视觉中心。", ["墨绿色", "银白色", "深黑色"]],
    en: ["Layered jade collar", "Necklace / Cool layers", "Dark jade textures meet precise geometric layers.", "Cool jade blocks create an architectural neckline. Clear spacing keeps the form crisp; pair with black, deep green, or silver-white for a defined evening silhouette.", "Works best with high necks, strapless cuts, or quiet necklines that let the collar lead.", ["Deep jade", "Silver white", "Soft black"]]
  },
  {
    id: "nanhai-rose-quartz-necklace", image: "/subpackage/jewelry/assets/product-6.jpg", filters: ["necklace"], moods: ["relaxed", "calm", "bright"], moodLabels: { zh: ["温柔", "治愈", "明亮"], en: ["Gentle", "Healing", "Bright"] }, tagKey: "", cardClass: "product-card-tall",
    colors: ["#f2b6c2", "#fffaf5", "#c48a62"],
    zh: ["芙蓉石项链《南海》", "项链 / 粉芙蓉石", "项链以天然高透粉芙蓉石打造，结合精细金属结构，呈现柔和通透的粉色光泽。", "《南海》以天然高透粉芙蓉石为主体，晶体温润通透，呈现柔和的粉色光泽。项链通过宝石排列与精细金属结构形成层次，在装饰性之外保留轻盈、温和与疗愈的视觉感受。", "适合搭配低领、露肩或简洁纯色服装，突出粉芙蓉石的通透感与柔和光泽。", ["芙蓉粉", "透明白", "暖金色"]],
    en: ["Nanhai rose quartz necklace", "Necklace / Pink rose quartz", "A necklace made with naturally high-transparency pink rose quartz and fine metal structure, showing a soft, luminous pink glow.", "Nanhai centers on naturally high-transparency pink rose quartz with a warm, clear crystal body and a gentle pink glow. The stone arrangement and fine metal structure create layered lightness, softness, and a quietly restorative visual feeling.", "Pair with low necklines, bare shoulders, or simple solid-color clothing to highlight the stone's clarity and soft glow.", ["Rose quartz pink", "Transparent white", "Warm gold"]]
  },
  {
    id: "jade-core-ring", image: "/subpackage/jewelry/assets/product-7.jpg", filters: ["ring", "material"], moods: ["focused", "grounded"], tagKey: "material", cardClass: "product-card-xl",
    colors: ["#16a34a", "#020617", "#647c6f"],
    zh: ["玉石方塔戒", "戒指 / 翡翠质感", "大颗玉石作为主视觉，外圈以深色结构形成层次。", "玉石方塔戒突出单颗玉石的体量感，深色外框让绿色更集中。适合与简洁手部配饰搭配，保留一个明确的视觉重点。", "适合单独佩戴，搭配素色袖口或深色针织。", ["翠绿色", "深黑色", "灰绿色"]],
    en: ["Jade core ring", "Ring / Jade texture", "A substantial jade core framed by a dark architectural setting.", "A single jade block carries the visual weight, framed in dark metal to concentrate its green tone. Keep nearby jewelry restrained.", "Wear it alone with a plain cuff or dark knit for one deliberate focal point.", ["Jade green", "Deep black", "Grey green"]]
  },
  {
    id: "cascade-necklace", image: "/subpackage/jewelry/assets/product-5.jpg", filters: ["necklace", "material"], moods: ["bright", "relaxed"], tagKey: "", cardClass: "product-card-medium",
    colors: ["#f8fafc", "#cbd5e1", "#1e3a8a"],
    zh: ["晶核链坠", "项链 / 透明晶体", "几何切面与链条层次组合，适合礼服与晚间造型。", "晶核链坠以透明晶体和细链层次组成，视觉上更轻、更亮。适合搭配深色礼服、丝质衬衫或低领上衣，在暗色背景中保留亮点。", "适合晚间活动和需要轻盈高光的穿搭。", ["透明色", "银白色", "蓝黑色"]],
    en: ["Crystal circuit necklace", "Necklace / Clear crystal", "Faceted crystal and fine chain layers create a bright technical line.", "Transparent crystal and fine chains keep the piece light. Against a dark dress, silk shirt, or open neckline, the edges become a controlled highlight.", "A strong fit for evening looks that need one light-reflecting detail.", ["Clear", "Silver white", "Blue black"]]
  },
  {
    id: "jade-ring-lab", image: "/subpackage/jewelry/assets/product-3.jpg", filters: ["ring"], moods: ["focused", "bright"], tagKey: "", cardClass: "product-card-tall",
    colors: ["#22c55e", "#e5e7eb", "#0f172a"],
    zh: ["翠色结构戒", "戒指 / 开放结构", "保留结构感，强调宝石与银白色细节的比例。", "翠色结构戒把宝石放在开放式结构中，视觉更有呼吸感。绿色主石与银白色细节形成对比，适合日常造型中做一个小面积亮点。", "适合叠戴细戒，也适合单独作为手部重点。", ["翠绿色", "银白色", "墨黑色"]],
    en: ["Open jade structure ring", "Ring / Open structure", "An open framework balances green stone with silver-white detail.", "The stone sits in an open frame, giving the form room to breathe. Green and silver-white create a compact everyday highlight.", "Stack with fine bands or wear alone as the hand's single focal point.", ["Jade green", "Silver white", "Ink black"]]
  },
  {
    id: "hex-collar", image: "/subpackage/jewelry/assets/product-2.jpg", filters: ["necklace", "material"], moods: ["grounded", "focused"], tagKey: "", cardClass: "product-card-xl",
    colors: ["#047857", "#0f172a", "#d97706"],
    zh: ["六边形结构项圈", "项链 / 几何结构", "六边形块面沿颈部排列，适合未来感造型。", "六边形结构项圈强调块面秩序和颈部线条，绿色与深色块面交替出现。适合搭配平直领口、硬挺面料和几何剪裁。", "适合廓形外套、简洁礼服和强结构穿搭。", ["祖母绿", "蓝黑色", "蜜糖色"]],
    en: ["Hexagonal structure collar", "Necklace / Geometry", "Hexagonal planes follow the neckline for a future-facing silhouette.", "Alternating green and dark planes form an ordered rhythm around the neck. Pair with straight necklines, firm fabrics, and precise tailoring.", "Best with sculpted outerwear, minimal dresses, and strong geometric cuts.", ["Emerald", "Blue black", "Honey gold"]]
  },
  {
    id: "dark-jade-chip", image: "/subpackage/jewelry/assets/product-4-brooch.jpg", images: ["/subpackage/jewelry/assets/product-4-brooch.jpg", "/subpackage/jewelry/assets/product-4-ring.jpg"], filters: ["ring"], moods: ["calm", "grounded", "relaxed"], tagKey: "", cardClass: "product-card-medium",
    colors: ["#14532d", "#020617", "#d1d5db"],
    zh: ["墨翠层叠戒", "戒指 / 深色层次", "深色宝石与层叠结构组合，气质更克制。", "墨翠层叠戒以深色宝石和连续结构营造安静的份量感。适合搭配黑色、深绿或冷灰色服装，让层次细节在近距离更耐看。", "适合安静、低调、有层次的深色穿搭。", ["墨绿色", "深黑色", "银白色"]],
    en: ["Layered dark-jade ring", "Ring / Dark layers", "Dark stones and repeated structures create a quieter presence.", "The layered dark-jade ring creates measured weight through deep stone and repeated structure. Black, forest green, and cool grey reveal the details at close range.", "For restrained, tonal outfits that rely on depth rather than brightness.", ["Deep jade", "Deep black", "Silver white"]]
  }
];

function localize(definition, locale, copy) {
  const text = locale === "en-US" ? definition.en : definition.zh;
  const moodLabels = (copy.moods || []).reduce((labels, item) => {
    labels[item.id] = item.label;
    return labels;
  }, {});
  return {
    id: definition.id, image: definition.image, images: definition.images || [definition.image], filters: definition.filters, moodIds: definition.moods, cardClass: definition.cardClass,
    tag: definition.tagKey ? copy.tags[definition.tagKey] : "",
    name: text[0], type: text[1], desc: text[2], detail: text[3], scene: text[4],
    palette: definition.colors.map((color, index) => ({ color, label: text[5][index] })),
    moods: definition.moodLabels && definition.moodLabels[locale === "en-US" ? "en" : "zh"]
      ? definition.moodLabels[locale === "en-US" ? "en" : "zh"]
      : definition.moods.map((moodId) => moodLabels[moodId] || moodId)
  };
}

function getProducts(options) {
  const state = options || {};
  const locale = state.locale === "en-US" ? "en-US" : "zh-CN";
  const defaultCopy = locale === "en-US"
    ? { tags: { recent: "Recent", display: "Display", material: "Material" }, moods: [{ id: "calm", label: "Calm" }, { id: "focused", label: "Focused" }, { id: "bright", label: "Bright" }, { id: "relaxed", label: "Relaxed" }, { id: "grounded", label: "Grounded" }] }
    : { tags: { recent: "近期", display: "展示", material: "材质" }, moods: [{ id: "calm", label: "平静" }, { id: "focused", label: "专注" }, { id: "bright", label: "明亮" }, { id: "relaxed", label: "松弛" }, { id: "grounded", label: "沉稳" }] };
  const copy = state.copy && state.copy.tags ? state.copy : defaultCopy;
  const query = String(state.query || "").trim().toLocaleLowerCase();
  return DEFINITIONS.map((item) => localize(item, locale, copy)).filter((item) => {
    const matchesFilter = !state.filterId || state.filterId === "all" || item.filters.includes(state.filterId);
    const matchesMood = !state.moodId || state.moodId === "all" || item.moodIds.includes(state.moodId);
    const haystack = [item.name, item.type, item.desc].join(" ").toLocaleLowerCase();
    return matchesFilter && matchesMood && (!query || haystack.includes(query));
  });
}

function splitProducts(products) {
  return (products || []).reduce((columns, product, index) => {
    columns[index % 2 === 0 ? "leftProducts" : "rightProducts"].push(product);
    return columns;
  }, { leftProducts: [], rightProducts: [] });
}

function getProductById(productId, locale, copy) {
  return getProducts({ locale, copy }).find((item) => item.id === productId) || null;
}

function buildProductDetailRoute(productId) {
  return PRODUCT_DETAIL_PAGE_PATH + "?id=" + encodeURIComponent(productId || "");
}

module.exports = { PRODUCTS_PAGE_PATH, PRODUCT_DETAIL_PAGE_PATH, buildProductDetailRoute, getProductById, getProducts, splitProducts };
