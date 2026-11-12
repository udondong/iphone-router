(function (root) {
  "use strict";
  function dateKey(date) {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  }
  function cycle(now, resetDay) {
    var month = now.getMonth() - (now.getDate() < resetDay ? 1 : 0);
    var start = new Date(now.getFullYear(), month, resetDay);
    var next = new Date(start.getFullYear(), start.getMonth() + 1, resetDay);
    return {
      key: dateKey(start),
      start: start,
      end: new Date(next.getFullYear(), next.getMonth(), next.getDate() - 1),
      next: next,
    };
  }
  function normalizePlan(value) {
    var plan = { limit: 0, resetDay: 1, records: {} };
    if (!value || typeof value !== "object") return plan;
    if (
      Number.isFinite(value.limit) &&
      value.limit >= 0 &&
      value.limit <= 1000000
    )
      plan.limit = value.limit;
    if (
      Number.isInteger(value.resetDay) &&
      value.resetDay >= 1 &&
      value.resetDay <= 28
    )
      plan.resetDay = value.resetDay;
    if (value.records && typeof value.records === "object") {
      Object.keys(value.records).forEach(function (key) {
        var record = value.records[key];
        if (
          /^\d{4}-\d{2}-\d{2}$/.test(key) &&
          record &&
          Number.isFinite(record.used) &&
          record.used >= 0 &&
          record.used <= 1000000 &&
          typeof record.updated === "string"
        ) {
          plan.records[key] = { used: record.used, updated: record.updated };
        }
      });
    }
    return plan;
  }
  function summary(plan, now) {
    var period = cycle(now, plan.resetDay);
    var record = plan.records[period.key] || null;
    var ratio = plan.limit > 0 && record ? record.used / plan.limit : null;
    return {
      period: period,
      record: record,
      ratio: ratio,
      remaining: ratio === null ? null : Math.max(0, plan.limit - record.used),
      status: !plan.limit
        ? "unconfigured"
        : !record
          ? "unrecorded"
          : ratio >= 1
            ? "over"
            : ratio >= 0.8
              ? "near"
              : "normal",
    };
  }
  function parsePlan(limitText, dayText, usedText) {
    var limit = limitText.trim() === "" ? 0 : Number(limitText);
    var resetDay = Number(dayText);
    var used = usedText.trim() === "" ? null : Number(usedText);
    if (!Number.isFinite(limit) || limit < 0 || limit > 1000000)
      return { error: "데이터 한도는 0~1,000,000 GB로 입력해 주세요." };
    if (!Number.isInteger(resetDay) || resetDay < 1 || resetDay > 28)
      return { error: "기준일은 매월 1~28일 중에서 선택해 주세요." };
    if (used !== null && (!Number.isFinite(used) || used < 0 || used > 1000000))
      return { error: "누적 사용량은 0~1,000,000 GB로 입력해 주세요." };
    return { limit: limit, resetDay: resetDay, used: used };
  }
  root.RouterCore = Object.freeze({
    cycle: cycle,
    normalizePlan: normalizePlan,
    summary: summary,
    parsePlan: parsePlan,
  });
})(globalThis);
