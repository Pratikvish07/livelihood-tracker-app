const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "https://trlm.pickitover.com/api";
const INVALID_BASE_URL_MARKERS = ["YOUR_API_HOST", "YOUR_PORT"];
let authToken = "";


export const API_ENDPOINTS = {
  master: {
    districts: "/api/master/districts",
    blocksByDistrict: (districtId) => `/api/master/block/${districtId}`,
    gpsByBlock: (blockId) => `/api/master/gp/${blockId}`,
    villagesByGp: (gpId) => `/api/master/village/${gpId}`,
    crpTypes: process.env.EXPO_PUBLIC_CRP_TYPES_PATH || "/api/crptype"
  },
  auth: {
    crpSignup:
      process.env.EXPO_PUBLIC_CRP_SIGNUP_PATH || "/api/auth/crp/signup",
    login: process.env.EXPO_PUBLIC_LOGIN_PATH || "/api/auth/crp/login"
  }
};

function getBaseUrl() {
  const sanitizedBaseUrl = API_BASE_URL.trim().replace(/\/+$/, "");
  const hasPlaceholder = INVALID_BASE_URL_MARKERS.some((marker) =>
    sanitizedBaseUrl.includes(marker)
  );

  if (!sanitizedBaseUrl || hasPlaceholder) {
    throw new Error(
      "API base URL is not configured. Update EXPO_PUBLIC_API_BASE_URL in .env with your real backend URL."
    );
  }

  return sanitizedBaseUrl;
}

function normalizeEndpointPath(path) {
  if (!path) {
    throw new Error("API path is missing.");
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `/${String(path).replace(/^\/+/, "")}`;
}

function buildUrl(path) {
  let normalizedPath = normalizeEndpointPath(path);

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  const baseUrl = getBaseUrl();
  const baseEndsWithApi = /\/api$/i.test(baseUrl);

  if (baseEndsWithApi && /^\/api(\/|$)/i.test(normalizedPath)) {
    normalizedPath = normalizedPath.replace(/^\/api(?=\/|$)/i, "");
  }

  return `${baseUrl}${normalizedPath}`;
}

function ensureArray(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.result)) {
    return payload.result;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
}

function extractErrorMessage(payload, fallbackMessage) {
  if (!payload) {
    return fallbackMessage;
  }

  if (typeof payload === "string") {
    return payload;
  }

  return (
    payload.message ||
    payload.error ||
    payload.title ||
    payload.details ||
    fallbackMessage
  );
}

async function parseApiResponse(response, entityName) {
  const fallbackMessage = `Failed to load ${entityName} (${response.status})`;
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();
  const isJsonResponse = contentType.toLowerCase().includes("application/json");

  let parsedPayload = null;

  if (bodyText && isJsonResponse) {
    try {
      parsedPayload = JSON.parse(bodyText);
    } catch {
      throw new Error(`Invalid JSON received while loading ${entityName}.`);
    }
  }

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(parsedPayload || bodyText, fallbackMessage)
    );
  }

  if (parsedPayload !== null) {
    return parsedPayload;
  }

  if (!bodyText) {
    return {};
  }

  return { message: bodyText };
}

async function executeRequest(path, entityName, options = {}) {
  const requestUrl = buildUrl(path);
  const authHeaders = authToken
    ? {
        Authorization: `Bearer ${authToken}`
      }
    : {};
  const response = await fetch(requestUrl, {
    headers: {
      Accept: "application/json",
      ...authHeaders,
      ...options.headers
    },
    ...options
  });

  return parseApiResponse(response, entityName);
}

function mapOption(item, idKeys, nameKeys) {
  const id = idKeys
    .map((key) => item?.[key])
    .find((value) => value !== undefined && value !== null && value !== "");
  const name = nameKeys
    .map((key) => item?.[key])
    .find((value) => typeof value === "string" && value.trim());

  return {
    id,
    name: typeof name === "string" ? name.trim() : ""
  };
}

function mapCollection(payload, idKeys, nameKeys) {
  return ensureArray(payload)
    .map((item) => mapOption(item, idKeys, nameKeys))
    .filter((item) => item.id !== undefined && item.id !== null && item.name);
}

export async function fetchDistricts() {
  const payload = await executeRequest(
    API_ENDPOINTS.master.districts,
    "districts"
  );
  return mapCollection(payload, ["districtId", "id", "value"], [
    "districtName",
    "name",
    "label"
  ]);
}

export async function fetchBlocksByDistrict(districtId) {
  const payload = await executeRequest(
    API_ENDPOINTS.master.blocksByDistrict(districtId),
    "blocks"
  );
  return mapCollection(payload, ["blockId", "BlockId", "id", "value"], [
    "blockName",
    "BlockName",
    "name",
    "label"
  ]);
}

export async function fetchGpsByBlock(blockId) {
  const payload = await executeRequest(
    API_ENDPOINTS.master.gpsByBlock(blockId),
    "gram panchayats"
  );
  return mapCollection(payload, ["gpId", "GPId", "id", "value"], [
    "gpName",
    "GPName",
    "name",
    "label"
  ]);
}

export async function fetchVillagesByGp(gpId) {
  const payload = await executeRequest(
    API_ENDPOINTS.master.villagesByGp(gpId),
    "villages"
  );
  return mapCollection(payload, ["villageId", "VillageId", "id", "value"], [
    "villageName",
    "VillageName",
    "name",
    "label"
  ]);
}

export async function fetchCrpTypes() {
  const payload = await executeRequest(API_ENDPOINTS.master.crpTypes, "CRP types");
  return mapCollection(payload, ["crpTypeId", "CRPTypeId", "CrpTypeId", "id", "value"], [
    "crpTypeName",
    "CRPTypeName",
    "CrpTypeName",
    "name",
    "label"
  ]);
}

export async function submitCrpSignup(payload) {
  return executeRequest(API_ENDPOINTS.auth.crpSignup, "CRP signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export async function loginUser(payload) {
  return executeRequest(API_ENDPOINTS.auth.login, "login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function setAuthToken(token) {
  authToken = String(token || "").trim();
}

export function clearAuthToken() {
  authToken = "";
}
