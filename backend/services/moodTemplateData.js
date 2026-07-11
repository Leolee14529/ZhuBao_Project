const MOOD_BASES = [
  {
    name: "平静",
    description: "今天的你适合把节奏放慢一点，先照顾好自己的呼吸。",
    tag: "安静",
    emoji: "🌿",
    themeColor: "#7BAE9D",
    bgColor: "#EDF6F2",
    textColor: "#243B34",
    backgroundMood: "浅绿雾感",
    encouragement: "慢一点也没关系，稳定本身就是力量。",
    weight: 8
  },
  {
    name: "有点疲惫",
    description: "今天不用把每件事都做到满分，身体也需要被听见。",
    tag: "休息",
    emoji: "🫧",
    themeColor: "#8FA0B2",
    bgColor: "#EFF3F7",
    textColor: "#2F3A45",
    backgroundMood: "低饱和灰蓝",
    encouragement: "先完成一件小事，再给自己留一点空白。",
    weight: 7
  },
  {
    name: "想被抱抱",
    description: "今天可能更需要温柔回应，不必把所有情绪都藏起来。",
    tag: "陪伴",
    emoji: "🤍",
    themeColor: "#D6A6A1",
    bgColor: "#FFF1EE",
    textColor: "#51312E",
    backgroundMood: "暖粉柔光",
    encouragement: "把需求说轻一点，也是一种靠近。",
    weight: 6
  },
  {
    name: "有点烦",
    description: "今天容易被小事打断，先把注意力收回到自己身上。",
    tag: "整理",
    emoji: "🍊",
    themeColor: "#E07A5F",
    bgColor: "#FFF0E8",
    textColor: "#4E2A1E",
    backgroundMood: "橘调日光",
    encouragement: "先离开噪音十分钟，情绪会慢慢松开。",
    weight: 5
  },
  {
    name: "想躺平",
    description: "今天不一定要很努力，留一点松弛给自己也很好。",
    tag: "放松",
    emoji: "🌙",
    themeColor: "#7B8FA1",
    bgColor: "#EEF2F5",
    textColor: "#2F3A45",
    backgroundMood: "月光灰蓝",
    encouragement: "躺一下不是放弃，是把能量慢慢充回来。",
    weight: 7
  },
  {
    name: "很有能量",
    description: "今天的状态比较亮，可以把想做的事往前推一步。",
    tag: "热情",
    emoji: "☀️",
    themeColor: "#F59E0B",
    bgColor: "#FFF7E6",
    textColor: "#4A2D06",
    backgroundMood: "暖金高光",
    encouragement: "趁状态在线，先抓住一个最想推进的点。",
    weight: 6
  },
  {
    name: "想吃点好的",
    description: "今天适合用一顿喜欢的食物，把心情慢慢接回来。",
    tag: "犒赏",
    emoji: "🍮",
    themeColor: "#D99A5B",
    bgColor: "#FFF4E8",
    textColor: "#4B2E16",
    backgroundMood: "奶油暖棕",
    encouragement: "给生活加一点甜，不需要理由。",
    weight: 5
  },
  {
    name: "有点孤单",
    description: "今天可能会想被看见，哪怕只是一句简单的回应。",
    tag: "连接",
    emoji: "🕯️",
    themeColor: "#8B7BB1",
    bgColor: "#F3F0FA",
    textColor: "#342B4F",
    backgroundMood: "紫灰烛光",
    encouragement: "可以先给一个人发一句轻轻的问候。",
    weight: 5
  },
  {
    name: "需要鼓励",
    description: "今天的你值得被肯定，不要只盯着还没完成的部分。",
    tag: "支持",
    emoji: "🌻",
    themeColor: "#E5B454",
    bgColor: "#FFF8DE",
    textColor: "#483608",
    backgroundMood: "向日葵暖黄",
    encouragement: "你已经做了不少，先承认这一点。",
    weight: 6
  },
  {
    name: "适合认真做事",
    description: "今天适合减少分心，把任务拆成清楚的第一步。",
    tag: "专注",
    emoji: "🖋️",
    themeColor: "#4F7CAC",
    bgColor: "#EDF4FB",
    textColor: "#1F344A",
    backgroundMood: "清爽蓝调",
    encouragement: "先做 20 分钟，剩下的路会更清楚。",
    weight: 7
  },
  {
    name: "想温柔一点",
    description: "今天适合降低语速，也降低对自己的苛刻。",
    tag: "温柔",
    emoji: "🌸",
    themeColor: "#E8A5B5",
    bgColor: "#FFF0F5",
    textColor: "#4B2732",
    backgroundMood: "樱粉轻雾",
    encouragement: "柔软不是退让，是选择不被拉扯。",
    weight: 5
  },
  {
    name: "想换个空气",
    description: "今天适合走出去几分钟，让新的画面进来。",
    tag: "更新",
    emoji: "🍃",
    themeColor: "#36A88F",
    bgColor: "#EAF8F4",
    textColor: "#173E36",
    backgroundMood: "清新薄荷",
    encouragement: "换个位置，心里的结也会松一点。",
    weight: 5
  },
  {
    name: "有点笃定",
    description: "今天心里会更清楚自己要什么，适合做一个决定。",
    tag: "行动",
    emoji: "💎",
    themeColor: "#3B82F6",
    bgColor: "#EAF2FF",
    textColor: "#17345F",
    backgroundMood: "宝石蓝光",
    encouragement: "把想法说出来，它就开始有形状。",
    weight: 5
  },
  {
    name: "有点敏感",
    description: "今天感受会更细，先别急着否定自己的反应。",
    tag: "觉察",
    emoji: "🫶",
    themeColor: "#B18FCF",
    bgColor: "#F7F1FB",
    textColor: "#3C2A4D",
    backgroundMood: "淡紫柔雾",
    encouragement: "感受到很多，也说明你正在认真生活。",
    weight: 5
  },
  {
    name: "适合修复",
    description: "今天适合做一点收尾，给自己一个重新开始的空间。",
    tag: "修复",
    emoji: "🪷",
    themeColor: "#6DB6A3",
    bgColor: "#ECF7F4",
    textColor: "#214139",
    backgroundMood: "荷叶水光",
    encouragement: "不用一下变好，愿意修复就已经在路上。",
    weight: 6
  },
  {
    name: "有点好奇",
    description: "今天适合尝试一个新角度，不一定马上有答案。",
    tag: "探索",
    emoji: "✨",
    themeColor: "#9F7AEA",
    bgColor: "#F4EEFF",
    textColor: "#33235B",
    backgroundMood: "星点紫光",
    encouragement: "先问一个好问题，答案会慢慢靠近。",
    weight: 4
  },
  {
    name: "想浪漫一点",
    description: "今天适合给平常的事加一点仪式感。",
    tag: "仪式",
    emoji: "🌹",
    themeColor: "#D85D8A",
    bgColor: "#FFF0F6",
    textColor: "#4D1F31",
    backgroundMood: "玫瑰微光",
    encouragement: "生活不只要有用，也可以有一点漂亮。",
    weight: 4
  },
  {
    name: "需要清理",
    description: "今天适合删掉一点多余，给重要的事腾位置。",
    tag: "清爽",
    emoji: "🧊",
    themeColor: "#5BA3C7",
    bgColor: "#EBF7FC",
    textColor: "#18394A",
    backgroundMood: "冰蓝透明",
    encouragement: "少一点负担，行动会轻很多。",
    weight: 5
  },
  {
    name: "适合靠近",
    description: "今天适合表达善意，也适合接住别人的好意。",
    tag: "关系",
    emoji: "🧡",
    themeColor: "#F08A5D",
    bgColor: "#FFF1E9",
    textColor: "#4D2B1B",
    backgroundMood: "暖橙灯光",
    encouragement: "一句真诚的话，可能就是今天的小亮点。",
    weight: 5
  },
  {
    name: "想勇敢一点",
    description: "今天适合迈出半步，不需要一下子做到很大。",
    tag: "勇气",
    emoji: "🔥",
    themeColor: "#EF5350",
    bgColor: "#FFF0EF",
    textColor: "#4F1F1D",
    backgroundMood: "珊瑚火光",
    encouragement: "你不用完全准备好，也可以先开始。",
    weight: 4
  }
];

const SITUATIONS = [
  { suffix: " · 工作间隙", description: "给工作留一条缝，让自己有机会缓一口气。" },
  { suffix: " · 关系时刻", description: "面对关系里的小波动，先把话说得更柔和一点。" },
  { suffix: " · 独处时间", description: "独处不是空白，是把注意力重新放回自己身上。" },
  { suffix: " · 出门之前", description: "出门前先确认今天最想保留的一种状态。" },
  { suffix: " · 夜晚收尾", description: "到了晚上，把没完成的事先放下，给明天留余地。" }
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function buildMoodTemplates() {
  const templates = [];

  MOOD_BASES.forEach((base, baseIndex) => {
    SITUATIONS.forEach((situation, situationIndex) => {
      templates.push({
        id: `mood_${pad(baseIndex + 1)}_${pad(situationIndex + 1)}`,
        name: base.name + situation.suffix,
        description: base.description + situation.description,
        tag: base.tag,
        emoji: base.emoji,
        theme_color: base.themeColor,
        bg_color: base.bgColor,
        text_color: base.textColor,
        icon_url: "",
        background_url: "",
        background_mood: base.backgroundMood,
        encouragement: base.encouragement,
        weight: base.weight,
        status: "enabled"
      });
    });
  });

  return templates;
}

module.exports = {
  buildMoodTemplates,
  MOOD_TEMPLATE_COUNT: MOOD_BASES.length * SITUATIONS.length
};
