import { Platform } from "react-native";

const REMOTE_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "https://trlm.pickitover.com/api";
const WEB_PROXY_BASE_URL = process.env.EXPO_PUBLIC_MASTER_PROXY_URL || "http://localhost:8787";
const INVALID_BASE_URL_MARKERS = ["YOUR_API_HOST", "YOUR_PORT"];

function getBaseUrl() {
  if (Platform.OS === "web") {
    return WEB_PROXY_BASE_URL;
  }

  return REMOTE_API_BASE_URL;
}

function buildUrl(path) {
  const baseUrl = getBaseUrl();
  const hasPlaceholder = INVALID_BASE_URL_MARKERS.some((marker) =>
    baseUrl.includes(marker)
  );

  if (!baseUrl || hasPlaceholder) {
    throw new Error(
      Platform.OS === "web"
        ? "You are running the web preview. Start `npm run api-proxy` and reload Expo web."
        : "API base URL is not configured. Update EXPO_PUBLIC_API_BASE_URL in .env with your real backend URL."
    );
  }

  return `${baseUrl.replace(/\/$/, "")}${path}`;
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

  return [];
}

async function parseApiResponse(response, entityName) {
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  if (!response.ok) {
    try {
      const payload = JSON.parse(bodyText);
      throw new Error(payload?.message || `Failed to load ${entityName} (${response.status})`);
    } catch {
      throw new Error(bodyText || `Failed to load ${entityName} (${response.status})`);
    }
  }

  if (!bodyText) {
    return {};
  }

  if (!contentType.toLowerCase().includes("application/json")) {
    return { message: bodyText };
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    throw new Error(`Invalid JSON received while loading ${entityName}.`);
  }
}

async function executeRequest(path, entityName, options) {
  try {
    const response = await fetch(buildUrl(path), options);
    return await parseApiResponse(response, entityName);
  } catch (error) {
    if (
      Platform.OS === "web" &&
      /fetch failed|Failed to fetch|Network request failed|ERR_CONNECTION_REFUSED|CORS/i.test(
        String(error?.message || error)
      )
    ) {
      throw new Error(
        "Web preview needs the local proxy. Run `npm run api-proxy`, restart Expo web, and try again."
      );
    }
    throw error;
  }
}

export async function fetchDistricts() {
  const payload = await executeRequest("/api/master/districts", "districts");
  return ensureArray(payload).map((item) => ({
    id: item.districtId ?? item.id ?? item.value,
    name: item.districtName ?? item.name ?? item.label ?? ""
  }));
}

export async function fetchBlocksByDistrict(districtId) {
  const payload = await executeRequest(`/api/master/block/${districtId}`, "blocks");
  return ensureArray(payload).map((item) => ({
    id: item.blockId ?? item.BlockId ?? item.id ?? item.value,
    name: item.blockName ?? item.BlockName ?? item.name ?? item.label ?? ""
  }));
}

export async function fetchGpsByBlock(blockId) {
  const payload = await executeRequest(`/api/master/gp/${blockId}`, "gram panchayats");
  return ensureArray(payload).map((item) => ({
    id: item.gpId ?? item.GPId ?? item.id ?? item.value,
    name: item.gpName ?? item.GPName ?? item.name ?? item.label ?? ""
  }));
}

export async function fetchVillagesByGp(gpId) {
  const payload = await executeRequest(`/api/master/village/${gpId}`, "villages");
  return ensureArray(payload).map((item) => ({
    id: item.villageId ?? item.VillageId ?? item.id ?? item.value,
    name: item.villageName ?? item.VillageName ?? item.name ?? item.label ?? ""
  }));
}

export async function submitCrpSignup(payload) {
  return executeRequest("/api/auth/CRPsignup", "CRP signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}
