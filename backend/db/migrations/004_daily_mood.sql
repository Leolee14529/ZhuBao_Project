CREATE TABLE IF NOT EXISTS mood_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  tag TEXT NOT NULL,
  emoji TEXT NOT NULL,
  theme_color TEXT NOT NULL CHECK (theme_color ~ '^#[0-9A-Fa-f]{6}$'),
  bg_color TEXT NOT NULL CHECK (bg_color ~ '^#[0-9A-Fa-f]{6}$'),
  text_color TEXT NOT NULL CHECK (text_color ~ '^#[0-9A-Fa-f]{6}$'),
  icon_url TEXT,
  background_url TEXT,
  background_mood TEXT NOT NULL DEFAULT '',
  encouragement TEXT NOT NULL DEFAULT '',
  weight INTEGER NOT NULL DEFAULT 1 CHECK (weight > 0),
  status TEXT NOT NULL DEFAULT 'enabled' CHECK (status IN ('enabled', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mood_templates_status_idx
  ON mood_templates(status);

CREATE TABLE IF NOT EXISTS user_daily_mood (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  mood_id TEXT NOT NULL REFERENCES mood_templates(id),
  mood_date DATE NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_daily_mood_user_date_unique_idx
  ON user_daily_mood(user_id, mood_date);

CREATE INDEX IF NOT EXISTS user_daily_mood_mood_date_idx
  ON user_daily_mood(mood_date DESC);

WITH mood_bases(
  base_no, slug, base_name, base_description, tag, emoji, theme_color,
  bg_color, text_color, background_mood, encouragement, weight
) AS (
  VALUES
    (1, 'calm', '平静', '今天的你适合把节奏放慢一点，先照顾好自己的呼吸。', '安静', '🌿', '#7BAE9D', '#EDF6F2', '#243B34', '浅绿雾感', '慢一点也没关系，稳定本身就是力量。', 8),
    (2, 'tired', '有点疲惫', '今天不用把每件事都做到满分，身体也需要被听见。', '休息', '🫧', '#8FA0B2', '#EFF3F7', '#2F3A45', '低饱和灰蓝', '先完成一件小事，再给自己留一点空白。', 7),
    (3, 'hug', '想被抱抱', '今天可能更需要温柔回应，不必把所有情绪都藏起来。', '陪伴', '🤍', '#D6A6A1', '#FFF1EE', '#51312E', '暖粉柔光', '把需求说轻一点，也是一种靠近。', 6),
    (4, 'annoyed', '有点烦', '今天容易被小事打断，先把注意力收回到自己身上。', '整理', '🍊', '#E07A5F', '#FFF0E8', '#4E2A1E', '橘调日光', '先离开噪音十分钟，情绪会慢慢松开。', 5),
    (5, 'lazy', '想躺平', '今天不一定要很努力，留一点松弛给自己也很好。', '放松', '🌙', '#7B8FA1', '#EEF2F5', '#2F3A45', '月光灰蓝', '躺一下不是放弃，是把能量慢慢充回来。', 7),
    (6, 'energy', '很有能量', '今天的状态比较亮，可以把想做的事往前推一步。', '热情', '☀️', '#F59E0B', '#FFF7E6', '#4A2D06', '暖金高光', '趁状态在线，先抓住一个最想推进的点。', 6),
    (7, 'treat', '想吃点好的', '今天适合用一顿喜欢的食物，把心情慢慢接回来。', '犒赏', '🍮', '#D99A5B', '#FFF4E8', '#4B2E16', '奶油暖棕', '给生活加一点甜，不需要理由。', 5),
    (8, 'lonely', '有点孤单', '今天可能会想被看见，哪怕只是一句简单的回应。', '连接', '🕯️', '#8B7BB1', '#F3F0FA', '#342B4F', '紫灰烛光', '可以先给一个人发一句轻轻的问候。', 5),
    (9, 'encourage', '需要鼓励', '今天的你值得被肯定，不要只盯着还没完成的部分。', '支持', '🌻', '#E5B454', '#FFF8DE', '#483608', '向日葵暖黄', '你已经做了不少，先承认这一点。', 6),
    (10, 'focus', '适合认真做事', '今天适合减少分心，把任务拆成清楚的第一步。', '专注', '🖋️', '#4F7CAC', '#EDF4FB', '#1F344A', '清爽蓝调', '先做 20 分钟，剩下的路会更清楚。', 7),
    (11, 'soft', '想温柔一点', '今天适合降低语速，也降低对自己的苛刻。', '温柔', '🌸', '#E8A5B5', '#FFF0F5', '#4B2732', '樱粉轻雾', '柔软不是退让，是选择不被拉扯。', 5),
    (12, 'fresh', '想换个空气', '今天适合走出去几分钟，让新的画面进来。', '更新', '🍃', '#36A88F', '#EAF8F4', '#173E36', '清新薄荷', '换个位置，心里的结也会松一点。', 5),
    (13, 'confident', '有点笃定', '今天心里会更清楚自己要什么，适合做一个决定。', '行动', '💎', '#3B82F6', '#EAF2FF', '#17345F', '宝石蓝光', '把想法说出来，它就开始有形状。', 5),
    (14, 'sensitive', '有点敏感', '今天感受会更细，先别急着否定自己的反应。', '觉察', '🫶', '#B18FCF', '#F7F1FB', '#3C2A4D', '淡紫柔雾', '感受到很多，也说明你正在认真生活。', 5),
    (15, 'healing', '适合修复', '今天适合做一点收尾，给自己一个重新开始的空间。', '修复', '🪷', '#6DB6A3', '#ECF7F4', '#214139', '荷叶水光', '不用一下变好，愿意修复就已经在路上。', 6),
    (16, 'curious', '有点好奇', '今天适合尝试一个新角度，不一定马上有答案。', '探索', '✨', '#9F7AEA', '#F4EEFF', '#33235B', '星点紫光', '先问一个好问题，答案会慢慢靠近。', 4),
    (17, 'romantic', '想浪漫一点', '今天适合给平常的事加一点仪式感。', '仪式', '🌹', '#D85D8A', '#FFF0F6', '#4D1F31', '玫瑰微光', '生活不只要有用，也可以有一点漂亮。', 4),
    (18, 'clear', '需要清理', '今天适合删掉一点多余，给重要的事腾位置。', '清爽', '🧊', '#5BA3C7', '#EBF7FC', '#18394A', '冰蓝透明', '少一点负担，行动会轻很多。', 5),
    (19, 'warm', '适合靠近', '今天适合表达善意，也适合接住别人的好意。', '关系', '🧡', '#F08A5D', '#FFF1E9', '#4D2B1B', '暖橙灯光', '一句真诚的话，可能就是今天的小亮点。', 5),
    (20, 'brave', '想勇敢一点', '今天适合迈出半步，不需要一下子做到很大。', '勇气', '🔥', '#EF5350', '#FFF0EF', '#4F1F1D', '珊瑚火光', '你不用完全准备好，也可以先开始。', 4)
),
situations(situation_no, suffix, description_suffix) AS (
  VALUES
    (1, ' · 工作间隙', '给工作留一条缝，让自己有机会缓一口气。'),
    (2, ' · 关系时刻', '面对关系里的小波动，先把话说得更柔和一点。'),
    (3, ' · 独处时间', '独处不是空白，是把注意力重新放回自己身上。'),
    (4, ' · 出门之前', '出门前先确认今天最想保留的一种状态。'),
    (5, ' · 夜晚收尾', '到了晚上，把没完成的事先放下，给明天留余地。')
)
INSERT INTO mood_templates(
  id,
  name,
  description,
  tag,
  emoji,
  theme_color,
  bg_color,
  text_color,
  icon_url,
  background_url,
  background_mood,
  encouragement,
  weight,
  status
)
SELECT
  'mood_' || LPAD(base_no::TEXT, 2, '0') || '_' || LPAD(situation_no::TEXT, 2, '0'),
  base_name || suffix,
  base_description || description_suffix,
  tag,
  emoji,
  theme_color,
  bg_color,
  text_color,
  '',
  '',
  background_mood,
  encouragement,
  weight,
  'enabled'
FROM mood_bases
CROSS JOIN situations
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tag = EXCLUDED.tag,
  emoji = EXCLUDED.emoji,
  theme_color = EXCLUDED.theme_color,
  bg_color = EXCLUDED.bg_color,
  text_color = EXCLUDED.text_color,
  icon_url = EXCLUDED.icon_url,
  background_url = EXCLUDED.background_url,
  background_mood = EXCLUDED.background_mood,
  encouragement = EXCLUDED.encouragement,
  weight = EXCLUDED.weight,
  status = EXCLUDED.status,
  updated_at = NOW();
