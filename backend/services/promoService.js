const mongoose = require("mongoose");
const Promo = require("../models/promoModel");

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return fallback;
}

function toNumber(value, fallback = undefined) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDate(value, fallback = undefined) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function normalizeTargetIds(value) {
  if (!value) return [];

  const raw = Array.isArray(value)
    ? value
    : String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return raw.filter((id) => mongoose.Types.ObjectId.isValid(id));
}

function getPromoName(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value.promo || "").trim();
  }
  return String(value).trim();
}

function normalizeCreatePayload(body = {}) {
  const promoName = getPromoName(body.promoName || body.name);
  if (!promoName) {
    throw new Error("promo name is required");
  }

  const scope = body.scope || "cart";

  const payload = {
    promoName: { promo: promoName },
    code: String(body.code || "").trim(),
    promoType: body.promoType || "percentage",
    value: toNumber(body.value, 0),
    scope,
    targetIds: scope === "cart" ? [] : normalizeTargetIds(body.targetIds),
    minPurchase: toNumber(body.minPurchase),
    startDate: toDate(body.startDate),
    endDate: toDate(body.endDate),
    usageLimit: toNumber(body.usageLimit ?? body.limit),
    usedCount: toNumber(body.usedCount ?? body.useCount, 0),
    active: toBoolean(body.active, true),
  };

  return payload;
}

function normalizeUpdatePayload(body = {}) {
  const payload = {};
  const hasScope = Object.prototype.hasOwnProperty.call(body, "scope");
  const nextScope = hasScope ? body.scope : undefined;

  if (
    Object.prototype.hasOwnProperty.call(body, "promoName") ||
    Object.prototype.hasOwnProperty.call(body, "name")
  ) {
    const promoName = getPromoName(body.promoName || body.name);
    if (!promoName) throw new Error("promo name is required");
    payload.promoName = { promo: promoName };
  }

  if (Object.prototype.hasOwnProperty.call(body, "code")) {
    payload.code = String(body.code || "").trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, "promoType")) {
    payload.promoType = body.promoType;
  }

  if (Object.prototype.hasOwnProperty.call(body, "value")) {
    payload.value = toNumber(body.value, 0);
  }

  if (Object.prototype.hasOwnProperty.call(body, "scope")) {
    payload.scope = body.scope;
    if (body.scope === "cart") {
      payload.targetIds = [];
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "targetIds")) {
    payload.targetIds =
      nextScope === "cart" ? [] : normalizeTargetIds(body.targetIds);
  }

  if (Object.prototype.hasOwnProperty.call(body, "minPurchase")) {
    payload.minPurchase = toNumber(body.minPurchase);
  }

  if (Object.prototype.hasOwnProperty.call(body, "startDate")) {
    payload.startDate = toDate(body.startDate, null);
  }

  if (Object.prototype.hasOwnProperty.call(body, "endDate")) {
    payload.endDate = toDate(body.endDate, null);
  }

  if (
    Object.prototype.hasOwnProperty.call(body, "usageLimit") ||
    Object.prototype.hasOwnProperty.call(body, "limit")
  ) {
    payload.usageLimit = toNumber(body.usageLimit ?? body.limit);
  }

  if (
    Object.prototype.hasOwnProperty.call(body, "usedCount") ||
    Object.prototype.hasOwnProperty.call(body, "useCount")
  ) {
    payload.usedCount = toNumber(body.usedCount ?? body.useCount, 0);
  }

  if (Object.prototype.hasOwnProperty.call(body, "active")) {
    payload.active = toBoolean(body.active, false);
  }

  return payload;
}

exports.getAll = async (request = {}) => {
  const { q } = request.query || {};
  const filters = {};

  if (q && q.trim()) {
    const search = q.trim();
    filters.$or = [
      { "promoName.promo": { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  return Promo.find(filters).sort({ createdAt: -1 });
};

exports.create = async (request = {}) => {
  const payload = normalizeCreatePayload(request.body || {});
  return Promo.create(payload);
};

exports.update = async (request = {}) => {
  const { promoId } = request.params || {};
  if (!promoId) throw new Error("promoId is required");

  const payload = normalizeUpdatePayload(request.body || {});
  const updated = await Promo.findByIdAndUpdate(promoId, payload, {
    new: true,
    runValidators: true,
  });

  if (!updated) throw new Error("promo not found");
  return updated;
};

exports.delete = async (request = {}) => {
  const { promoId } = request.params || {};
  if (!promoId) throw new Error("promoId is required");

  const removed = await Promo.findByIdAndDelete(promoId);
  if (!removed) throw new Error("promo not found");

  return { removed: true, promoId };
};
