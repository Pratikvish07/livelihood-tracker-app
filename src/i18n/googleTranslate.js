const GOOGLE_TRANSLATE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
const translationCache = new Map();
const pendingRequests = new Set();
const translationListeners = new Set();

function getLanguageCode(language) {
  const normalized = String(language || "en").toLowerCase();
  const supported = new Set(["en", "hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa"]);

  if (supported.has(normalized)) {
    return normalized;
  }

  return "en";
}

function getCacheKey(language, text) {
  return `${language}::${text}`;
}

function notifyTranslationListeners() {
  translationListeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.warn("Translation listener failed:", error);
    }
  });
}

export function addTranslationListener(listener) {
  if (typeof listener === "function") {
    translationListeners.add(listener);
  }
}

export function removeTranslationListener(listener) {
  translationListeners.delete(listener);
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

  const requestableTexts = uncachedTexts.filter((item) => {
    const cacheKey = getCacheKey(language, item);
    if (pendingRequests.has(cacheKey)) {
      return false;
    }

    pendingRequests.add(cacheKey);
    return true;
  });

  const fallbackMap = Object.fromEntries(uncachedTexts.map((item) => [item, item]));

  const releasePendingTexts = () => {
    requestableTexts.forEach((item) => {
      pendingRequests.delete(getCacheKey(language, item));
    });
  };

  if (!GOOGLE_TRANSLATE_API_KEY) {
    requestableTexts.forEach((item) => {
      translationCache.set(getCacheKey(language, item), fallbackMap[item]);
    });
    releasePendingTexts();
    notifyTranslationListeners();

    return Object.fromEntries(
      uniqueTexts.map((item) => [item, translationCache.get(getCacheKey(language, item)) || fallbackMap[item] || item])
    );
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
          q: requestableTexts,
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

    requestableTexts.forEach((item, index) => {
      const translatedText = translated[index]?.translatedText || fallbackMap[item] || item;
      translationCache.set(getCacheKey(language, item), translatedText);
    });
  } catch {
    requestableTexts.forEach((item) => {
      translationCache.set(getCacheKey(language, item), fallbackMap[item]);
    });
  } finally {
    releasePendingTexts();
    notifyTranslationListeners();
  }

  return Object.fromEntries(
    uniqueTexts.map((item) => [item, translationCache.get(getCacheKey(language, item)) || fallbackMap[item] || item])
  );
}
