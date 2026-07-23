const ALLOWED_TAGS = new Set(["专注", "放松", "社交", "疲惫", "平静"]);

function integer(value, code) {
  const text = String(value === undefined ? "" : value).trim();
  if (!/^\d+$/.test(text)) throw new Error(code);
  return Number(text);
}

function buildCheckinInput(form, checkinDate) {
  const mood = integer(form.mood, "MOOD_INVALID");
  const energy = integer(form.energy, "ENERGY_INVALID");
  const hours = integer(form.sleepHours, "SLEEP_INVALID");
  const minutes = integer(form.sleepMinutes, "SLEEP_INVALID");
  const sleepMinutes = hours * 60 + minutes;
  const tags = Array.isArray(form.tags) ? form.tags.filter((tag) => ALLOWED_TAGS.has(tag)) : [];
  const note = String(form.note || "").trim();

  if (mood < 1 || mood > 5) throw new Error("MOOD_INVALID");
  if (energy < 1 || energy > 5) throw new Error("ENERGY_INVALID");
  if (minutes > 59 || sleepMinutes > 1440) throw new Error("SLEEP_INVALID");
  if (tags.length > 5) throw new Error("TAGS_INVALID");
  if (note.length > 200) throw new Error("NOTE_INVALID");

  return {
    checkinDate,
    mood,
    energy,
    sleepMinutes,
    isWearingJewelry: Boolean(form.isWearingJewelry),
    tags,
    note
  };
}

module.exports = { buildCheckinInput };
