import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import bn from "./locales/bn.json";
import en from "./locales/en.json";
import gu from "./locales/gu.json";
import hi from "./locales/hi.json";
import kn from "./locales/kn.json";
import ml from "./locales/ml.json";
import mr from "./locales/mr.json";
import pa from "./locales/pa.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";

export const LANGUAGE_STORAGE_KEY = "selectedLanguage";
export const SUPPORTED_LANGUAGE_CODES = ["en", "hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa"];

const resources = {
  en,
  hi,
  ta,
  te,
  bn,
  mr,
  gu,
  kn,
  ml,
  pa
};

const languageListeners = new Set();

export function normalizeLanguageCode(value) {
  const raw = String(value || "en").trim();

  if (!raw) {
    return "en";
  }

  const lower = raw.toLowerCase();
  const exact = SUPPORTED_LANGUAGE_CODES.find((item) => item.toLowerCase() === lower);

  if (exact) {
    return exact;
  }

  const prefix = lower.split(/[-_]/)[0];
  const prefixed = SUPPORTED_LANGUAGE_CODES.find((item) => item.toLowerCase() === prefix);
  return prefixed || "en";
}

export async function readStoredLanguage() {
  if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
    return normalizeLanguageCode(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
  }

  const storedValue = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  return normalizeLanguageCode(storedValue);
}

export async function persistLanguage(code) {
  const normalized = normalizeLanguageCode(code);

  if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    return normalized;
  }

  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  return normalized;
}

export function detectBrowserLanguage() {
  if (Platform.OS === "web" && typeof navigator !== "undefined") {
    const browserLang = navigator.languages?.[0] || navigator.language || "en";
    return normalizeLanguageCode(browserLang);
  }

  if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    return normalizeLanguageCode(Intl.DateTimeFormat().resolvedOptions().locale);
  }

  return "en";
}

function getDictionary(language) {
  return resources[normalizeLanguageCode(language)] || resources.en;
}

function resolveNestedValue(dictionary, key) {
  return String(key)
    .split(".")
    .reduce((current, segment) => (current && current[segment] !== undefined ? current[segment] : undefined), dictionary);
}

function interpolate(template, options = {}) {
  if (typeof template !== "string") {
    return template;
  }

  return template.replace(/\{\{(.*?)\}\}/g, (_, token) => {
    const value = options[token.trim()];
    return value === undefined || value === null ? "" : String(value);
  });
}

function isBrokenTranslation(value) {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  return /^[?\s.,:;!()[\]{}\-_/\\|'"`~@#$%^&*+=<>]+$/.test(trimmed);
}

const i18n = {
  language: "en",
  isInitialized: true,
  init: async ({ lng } = {}) => {
    i18n.language = normalizeLanguageCode(lng || i18n.language);
    return i18n;
  },
  changeLanguage: async (nextLanguage) => {
    const normalized = normalizeLanguageCode(nextLanguage);
    i18n.language = normalized;
    languageListeners.forEach((listener) => listener(normalized));
    return normalized;
  },
  t: (key, options = {}) => {
    if (typeof key !== "string") {
      return key;
    }

    const language = normalizeLanguageCode(options.lng || i18n.language);
    const dictionary = getDictionary(language);
    const fallbackDictionary = getDictionary("en");
    const localizedValue = resolveNestedValue(dictionary, key);
    const fallbackValue = resolveNestedValue(fallbackDictionary, key);
    const resolvedValue =
      !isBrokenTranslation(localizedValue)
        ? localizedValue
        : !isBrokenTranslation(fallbackValue)
          ? fallbackValue
          : options.defaultValue ?? key;

    return interpolate(resolvedValue, options);
  },
  on: (eventName, handler) => {
    if (eventName === "languageChanged" && typeof handler === "function") {
      languageListeners.add(handler);
    }
  },
  off: (eventName, handler) => {
    if (eventName === "languageChanged" && typeof handler === "function") {
      languageListeners.delete(handler);
    }
  }
};

export default i18n;
