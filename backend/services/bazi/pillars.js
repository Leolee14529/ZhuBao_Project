const {
  SOLAR_TERMS,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES
} = require("./constants");

function gregorianToJulianDay(year, month, day, hour = 0, minute = 0, second = 0) {
  let adjustedYear = year;
  let adjustedMonth = month;

  if (adjustedMonth <= 2) {
    adjustedYear -= 1;
    adjustedMonth += 12;
  }

  const century = Math.floor(adjustedYear / 100);
  const correction = 2 - century + Math.floor(century / 4);

  return (
    Math.floor(365.25 * (adjustedYear + 4716)) +
    Math.floor(30.6001 * (adjustedMonth + 1)) +
    day +
    correction -
    1524.5 +
    (hour + minute / 60 + second / 3600) / 24
  );
}

function sunLongitude(julianDay) {
  const centuries = (julianDay - 2451545.0) / 36525;
  const meanLongitude = 280.46646 + 36000.76983 * centuries + 0.0003032 * centuries * centuries;
  const meanAnomaly = 357.52911 + 35999.05029 * centuries - 0.0001537 * centuries * centuries;
  const meanAnomalyRadians = (meanAnomaly * Math.PI) / 180;
  const equationCenter =
    (1.914602 - 0.004817 * centuries - 0.000014 * centuries * centuries) * Math.sin(meanAnomalyRadians) +
    (0.019993 - 0.000101 * centuries) * Math.sin(2 * meanAnomalyRadians) +
    0.000289 * Math.sin(3 * meanAnomalyRadians);

  let longitude = (meanLongitude + equationCenter - 0.00569) % 360;
  if (longitude < 0) longitude += 360;
  return longitude;
}

function getSolarTermIndex(longitude) {
  const normalized = Math.round(((longitude + 360) % 360) * 100) / 100;

  for (let index = 0; index < SOLAR_TERMS.length; index += 1) {
    const termStart = SOLAR_TERMS[index].longitude;
    const termEnd = (termStart + 15) % 360;

    if (termStart > termEnd) {
      if (normalized >= termStart || normalized < termEnd) return index;
    } else if (normalized >= termStart && normalized < termEnd) {
      return index;
    }
  }
  return 0;
}

function calculateYearPillar(year, month, solarTermIndex) {
  let effectiveYear = year;
  if (month <= 2 && solarTermIndex >= 21) effectiveYear -= 1;

  return {
    stem: ((effectiveYear - 4) % 10 + 10) % 10,
    branch: ((effectiveYear - 4) % 12 + 12) % 12
  };
}

function calculateMonthPillar(year, month, solarTermIndex) {
  const monthBranch = (Math.floor(solarTermIndex / 2) + 2) % 12;
  let effectiveYear = year;
  if (month <= 2 && solarTermIndex >= 21) effectiveYear -= 1;

  const yearStem = (((effectiveYear - 4) % 10) + 10) % 10;
  const monthStem = (yearStem * 2 + monthBranch) % 10;
  return {
    stem: (monthStem + 10) % 10,
    branch: (monthBranch + 12) % 12
  };
}

function calculateDayPillar(julianDay) {
  const reference = gregorianToJulianDay(1900, 1, 1, 0, 0, 0);
  const daysSinceReference = Math.floor(julianDay - reference);
  return {
    stem: ((daysSinceReference % 10) + 10) % 10,
    branch: ((10 + daysSinceReference) % 12 + 12) % 12
  };
}

function calculateHourPillar(hour, dayStem) {
  const branch = Math.floor((hour + 1) / 2) % 12;
  return {
    stem: (dayStem * 2 + branch) % 10,
    branch
  };
}

function pillarToText(pillar) {
  return `${HEAVENLY_STEMS.names[pillar.stem]}${EARTHLY_BRANCHES.names[pillar.branch]}`;
}

module.exports = {
  gregorianToJulianDay,
  sunLongitude,
  getSolarTermIndex,
  calculateYearPillar,
  calculateMonthPillar,
  calculateDayPillar,
  calculateHourPillar,
  pillarToText
};
