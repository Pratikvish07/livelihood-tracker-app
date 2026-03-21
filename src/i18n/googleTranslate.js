import { getFallbackTranslation, getLanguageCode } from "./translations";

const GOOGLE_TRANSLATE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
const translationCache = new Map();

function getCacheKey(language, text) {
  return `${language}::${text}`;
}

export function getCachedTranslation(language, text) {
  const cacheKey = getCacheKey(language, text);
  return translationCache.get(cacheKey);
}

export async function translateBatch(language, texts) {
  const code = getLanguageCode(language);
  const uniqueTexts = [...new Set(texts.filter((item) => typeof item === "string" && item.trim() !== ""))];

  if (code === "en" || uniqueTexts.length === 0) {
    return {};
  }

  const uncachedTexts = uniqueTexts.filter((item) => !translationCache.has(getCacheKey(language, item)));
  if (uncachedTexts.length === 0) {
    return Object.fromEntries(uniqueTexts.map((item) => [item, translationCache.get(getCacheKey(language, item))]));
  }

  const fallbackMap = Object.fromEntries(
    uncachedTexts.map((item) => [item, getFallbackTranslation(language, item)])
  );

  if (!GOOGLE_TRANSLATE_API_KEY) {
    uncachedTexts.forEach((item) => {
      translationCache.set(getCacheKey(language, item), fallbackMap[item]);
    });

    return Object.fromEntries(uniqueTexts.map((item) => [item, translationCache.get(getCacheKey(language, item)) || fallbackMap[item] || item]));
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          q: uncachedTexts,
          target: code,
          source: "en",
          format: "text"
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Translation request failed (${response.status})`);
    }

    const payload = await response.json();
    const translated = payload?.data?.translations || [];

    uncachedTexts.forEach((item, index) => {
      const translatedText = translated[index]?.translatedText || fallbackMap[item] || item;
      translationCache.set(getCacheKey(language, item), translatedText);
    });
  } catch {
    uncachedTexts.forEach((item) => {
      translationCache.set(getCacheKey(language, item), fallbackMap[item]);
    });
  }

  return Object.fromEntries(
    uniqueTexts.map((item) => [item, translationCache.get(getCacheKey(language, item)) || fallbackMap[item] || item])
  );
}
