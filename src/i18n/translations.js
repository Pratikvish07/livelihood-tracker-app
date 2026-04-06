import i18n from "./config";
import { translateBatch, getCachedTranslation } from "./googleTranslate";

export const LANGUAGE_OPTIONS = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" }
];

export const LANGUAGE_CODE_MAP = Object.fromEntries(
  LANGUAGE_OPTIONS.flatMap((item) => [
    [item.code, item.code],
    [item.name, item.code],
    [item.name.toLowerCase(), item.code]
  ])
);

export function getLanguageCode(language) {
  if (!language) {
    return "en";
  }

  return LANGUAGE_CODE_MAP[String(language)] || LANGUAGE_CODE_MAP[String(language).toLowerCase()] || "en";
}

export function getLanguageName(language) {
  const code = getLanguageCode(language);
  return LANGUAGE_OPTIONS.find((item) => item.code === code)?.name || "English";
}

export function getLanguageNativeName(language) {
  const code = getLanguageCode(language);
  return LANGUAGE_OPTIONS.find((item) => item.code === code)?.nativeName || "English";
}

export function getFallbackTranslation(language, key) {
  if (typeof key !== "string") {
    return key;
  }

  const languageCode = getLanguageCode(language);
  if (languageCode === "en") {
    return i18n.t(key, { lng: languageCode, defaultValue: key });
  }

  // Check cache first
  const cached = getCachedTranslation(language, key);
  if (cached) {
    return cached;
  }

  // Try static translation first
  const staticTranslation = i18n.t(key, { lng: languageCode, defaultValue: key });
  if (staticTranslation !== key) {
    return staticTranslation;
  }

  // Batch translate missing key (single item batch)
  // Note: In real usage, collect multiple missing keys first for batching
  translateBatch(language, [key]).then((results) => {
    const translated = results[key];
    if (translated && translated !== key) {
      // Cache will be set in translateBatch
      return translated;
    }
    return key;
  }).catch(() => key);

  // Synchronous fallback
  return key;
}

export function translateText(language, key) {
  return getFallbackTranslation(language, key);
}
