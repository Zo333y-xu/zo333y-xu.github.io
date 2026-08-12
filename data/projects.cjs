const placeholder = "assets/images/project-placeholder.svg";

function project({ slug, title, titleZh, client = "", year, type, services, sourceUrl = null, featuredOrder = null }) {
  return {
    slug,
    title,
    titleZh,
    client,
    year,
    background: `${title} is a ${year} ${type} project${client ? ` for ${client}` : ""}.`,
    poster: placeholder,
    video: null,
    sourceUrl,
    imageAlt: `${title} project preview`,
    type,
    services,
    search: [titleZh, title, client, year, type, ...services].filter(Boolean).join(" "),
    featuredOrder,
    recommendedProjects: [],
  };
}

module.exports = [
  project({ slug: "showreel", title: "showreel", titleZh: "混剪", year: 2026, type: "3C & Tech", services: ["CG & VFX", "Online"], featuredOrder: 1 }),
  project({ slug: "huawei-freebuds-pro-3", title: "HUAWEI FreeBuds Pro 3", titleZh: "领听原声 不同凡响", client: "HUAWEI", year: 2023, type: "3C & Tech", services: ["CG & VFX", "Online"], sourceUrl: "https://www.xinpianchang.com/a12725011?from=UserProfile", featuredOrder: 2 }),
  project({ slug: "huawei-nora-band-10", title: "HUAWEI｜NORA BAND 10", titleZh: "NORA手环", client: "HUAWEI", year: 2025, type: "3C & Tech", services: ["CG & VFX", "Online"], sourceUrl: "https://www.xinpianchang.com/a13392086?from=UserProfile", featuredOrder: 3 }),
  project({ slug: "sanrio-brand-2025", title: "Sanrio Brand 2025", titleZh: "三丽鸥2025宣传片", client: "Sanrio", year: 2025, type: "Beauty & Fashion", services: ["CG & VFX", "Online"], sourceUrl: "https://www.xinpianchang.com/a13510387?searchKw=sanrio&from=search_post", featuredOrder: 4 }),
  project({ slug: "friso-x-volvo", title: "Friso x volvo", titleZh: "皇家美素佳儿 x volvo", client: "Friso x volvo", year: 2025, type: "FMCG", services: ["2D Animation", "CG & VFX"], sourceUrl: "https://www.xinpianchang.com/a13513627?searchKw=%E7%BE%8E%E7%B4%A0%E4%BD%B3%E5%84%BF&from=search_post", featuredOrder: 5 }),
  project({ slug: "cubee", title: "Cubee", titleZh: "Cubee", year: 2026, type: "Short Film", services: ["AIGC"], featuredOrder: 6 }),
  project({ slug: "universal-studio", title: "Universal Studio", titleZh: "北京环球万圣节‘惊彩’来袭", client: "Universal Studio", year: 2024, type: "Short Film", services: ["CG & VFX"], sourceUrl: "https://www.xinpianchang.com/a13165516?from=UserProfile", featuredOrder: 7 }),
  project({ slug: "huawei-watch-ultimate-design", title: "HUAWEI WATCH ULTIMATE DESIGN", titleZh: "非凡大师 星钻绽放_艺术家视频", client: "HUAWEI", year: 2026, type: "3C & Tech", services: ["Online"], sourceUrl: "https://www.xinpianchang.com/a13700670?from=share&xpcApp=xpc&channel=wx&type=URL", featuredOrder: 8 }),
  project({ slug: "game-for-peace", title: "Game for Peace", titleZh: "虞书欣《心弦》X和平精英", client: "Game for Peace", year: 2025, type: "3C & Tech", services: ["Online"], sourceUrl: "https://www.xinpianchang.com/a13262972?from=share&xpcApp=xpc&channel=wx&type=URL", featuredOrder: 9 }),
  project({ slug: "huawei-watch-fit-5-niki", title: "HUAWEI WATCH Fit 5 Niki", titleZh: "HUAWEI WATCH Fit 5 Niki熊猫", client: "HUAWEI", year: 2026, type: "3C & Tech", services: ["Online", "AIGC", "CG & VFX"], sourceUrl: "https://www.xinpianchang.com/a13700638?from=UserProfile", featuredOrder: 10 }),
  project({ slug: "anta-milan", title: "ANTA Milan", titleZh: "安踏助力90支中国国家队征战米兰！", client: "ANTA", year: 2026, type: "Beauty & Fashion", services: ["Online", "AIGC", "CG & VFX"], sourceUrl: "https://www.xinpianchang.com/a13700640?from=UserProfile" }),
  project({ slug: "sprite", title: "sprite", titleZh: "雪碧 ｜透心凉，心飞扬", client: "sprite", year: 2026, type: "FMCG", services: ["Online", "AIGC", "CG & VFX"], sourceUrl: "https://www.xinpianchang.com/a13392000?from=share&xpcApp=xpc&channel=wx&type=URL" }),
  project({ slug: "huawei-home", title: "HUAWEI Home", titleZh: "HUAWEI ｜华为鸿蒙智家 住进未来家", client: "HUAWEI", year: 2025, type: "3C & Tech", services: ["Online"], sourceUrl: "https://www.xinpianchang.com/a13392077?from=UserProfile" }),
  project({ slug: "master-kong-ice-tea-x-tnt", title: "Master Kong Ice Tea x TNT", titleZh: "康师傅冰红茶 x 时代少年团｜热带风味 果燃痛快", client: "Master Kong", year: 2023, type: "FMCG", services: ["Online"], sourceUrl: "https://www.xinpianchang.com/a12789695?from=UserProfile" }),
  project({ slug: "pepsi-summer-campaign", title: "Pepsi Summer Campaign", titleZh: "百事可乐夏日企划｜够爽够夏天", client: "Pepsi", year: 2023, type: "FMCG", services: ["Online"], sourceUrl: "https://www.xinpianchang.com/a12789669?from=UserProfile" }),
  project({ slug: "audi-x-zheng-qinwen", title: "Audi x Zheng Qinwen", titleZh: "Audi x 郑钦文 ｜ 行于心动间", client: "Audi", year: 2025, type: "Automotive", services: ["Online"], sourceUrl: "https://www.xinpianchang.com/a13263005?from=UserProfile" }),
  project({ slug: "descente-x-daniel-wu", title: "DESCENTE x Daniel Wu", titleZh: "迪桑特X吴彦祖｜自顶峰而来 一切始于滑雪", client: "DESCENTE", year: 2025, type: "Beauty & Fashion", services: ["Online"], sourceUrl: "https://www.xinpianchang.com/a13262961?from=UserProfile" }),
  project({ slug: "honor-x-fifa", title: "HONOR x FIFA", titleZh: "荣耀是你不断追逐的那条路 FIFA", client: "HONOR", year: 2026, type: "3C & Tech", services: ["Online"], sourceUrl: "https://www.xinpianchang.com/a13730535?from=UserProfile" }),
  project({ slug: "lays-cny-campaign", title: "Lay’s CNY Campaign", titleZh: "乐事CNY｜吃乐事有乐事", client: "Lay's", year: 2026, type: "FMCG", services: ["Online", "CG & VFX"], sourceUrl: "https://www.xinpianchang.com/a13574429?from=UserProfile" }),
  project({ slug: "adidas-zne", title: "Adidas ZNE", titleZh: "没有什么能阻止我们奔向未来— Adidas ZNE", client: "Adidas", year: 2020, type: "Beauty & Fashion", services: ["Online"], sourceUrl: "https://www.xinpianchang.com/a10913287?from=UserProfile" }),
  project({ slug: "touareg-x-wu-jing", title: "Touareg x Wu Jing", titleZh: "途锐Touareg x 吴京", client: "Touareg", year: 2019, type: "Automotive", services: ["Online", "CG & VFX"], sourceUrl: "https://www.xinpianchang.com/a10560730?from=UserProfile" }),
  project({ slug: "oppo-r11", title: "OPPO R11", titleZh: "OPPO R11 x 杨幂 & 张彬彬 “两个小星球”", client: "OPPO", year: 2018, type: "3C & Tech", services: ["Online", "CG & VFX"], sourceUrl: "https://www.xinpianchang.com/a118168?from=UserProfile" }),
  project({ slug: "sumsung-x-hua-chenyu", title: "sumsung x Hua Chenyu", titleZh: "花花和他的“花花世界”", client: "sumsung", year: 2018, type: "3C & Tech", services: ["Online", "CG & VFX"], sourceUrl: "https://www.xinpianchang.com/a10332515?from=UserProfile" }),
];
