const LANGUAGE_CODE_MAP = {
  English: "en",
  Hindi: "hi",
  Bengali: "bn",
  Assamese: "as",
  Gujarati: "gu",
  Kannada: "kn",
  Kashmiri: "ks",
  Konkani: "gom",
  Malayalam: "ml",
  Manipuri: "mni-Mtei",
  Marathi: "mr",
  Nepali: "ne",
  Odia: "or",
  Punjabi: "pa",
  Sanskrit: "sa",
  Santali: "sat",
  Sindhi: "sd",
  Tamil: "ta",
  Telugu: "te",
  Urdu: "ur",
  Bodo: "brx",
  Dogri: "doi",
  Maithili: "mai"
};

const DICTIONARY = {
  bn: {
    "Language Selection": "ভাষা নির্বাচন",
    "Choose your preferred language": "আপনার পছন্দের ভাষা বেছে নিন",
    Continue: "চালিয়ে যান",
    "Select Interface Language": "ইন্টারফেসের ভাষা নির্বাচন করুন",
    "Available Across India": "ভারত জুড়ে উপলভ্য",
    "Pick any language and the app will translate labels dynamically using Google Translate when configured.": "যেকোনো ভাষা বেছে নিন, কনফিগার করা থাকলে অ্যাপটি গুগল ট্রান্সলেট ব্যবহার করে লেবেল অনুবাদ করবে।",
    "Government of Tripura": "ত্রিপুরা সরকার",
    "Tripura Rural Livelihood Mission": "ত্রিপুরা রুরাল লাইভলিহুড মিশন"
  },
  hi: {
    "Language Selection": "भाषा चयन",
    "Choose your preferred language": "अपनी पसंदीदा भाषा चुनें",
    Continue: "जारी रखें",
    "Select Interface Language": "इंटरफ़ेस भाषा चुनें",
    "Available Across India": "पूरे भारत में उपलब्ध",
    "Pick any language and the app will translate labels dynamically using Google Translate when configured.": "कोई भी भाषा चुनें, और कॉन्फ़िगर होने पर ऐप Google Translate से लेबल का अनुवाद करेगा।",
    "Government of Tripura": "त्रिपुरा सरकार",
    "Tripura Rural Livelihood Mission": "त्रिपुरा ग्रामीण आजीविका मिशन"
  },
  as: {
    "Language Selection": "ভাষা নিৰ্বাচন",
    "Choose your preferred language": "আপোনাৰ পছন্দৰ ভাষা বাছক",
    Continue: "আগবাঢ়ক",
    "Select Interface Language": "ইণ্টাৰফেচ ভাষা বাছক",
    "Available Across India": "সমগ্ৰ ভাৰতত উপলব্ধ",
    "Pick any language and the app will translate labels dynamically using Google Translate when configured.": "যিকোনো ভাষা বাছক, আৰু কনফিগাৰ কৰা থাকিলে এপে Google Translate ব্যৱহাৰ কৰি লেবেল অনুবাদ কৰিব।",
    "Government of Tripura": "ত্ৰিপুৰা চৰকাৰ",
    "Tripura Rural Livelihood Mission": "ত্ৰিপুৰা গ্ৰাম্য জীৱিকাৰ মিছন"
  }
};

export function getLanguageCode(language) {
  return LANGUAGE_CODE_MAP[language] || "en";
}

export function getFallbackTranslation(language, key) {
  if (typeof key !== "string") {
    return key;
  }

  const code = getLanguageCode(language);
  if (code === "en") {
    return key;
  }

  return DICTIONARY[code]?.[key] || key;
}

export function translateText(language, key) {
  return getFallbackTranslation(language, key);
}

export { LANGUAGE_CODE_MAP };
