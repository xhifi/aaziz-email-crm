const dateTimeMs = () => {
  const epoch = new Date();
  const d = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(epoch);
  const h = epoch.getHours().toString();
  const m = epoch.getMinutes().toString();
  const s = epoch.getSeconds().toString();
  const ms = epoch.getMilliseconds().toString();
  const verboseTime = `${d}\t${h}:${m}:${s}:${ms}`;
  return { d, h, m, s, ms, verboseTime };
};

module.exports = { dateTimeMs };
