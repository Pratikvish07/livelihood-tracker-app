const LANGUAGE_CODE_MAP = {
  English: "en",
  Bengali: "bn",
  Hindi: "hi",
  Assamese: "as"
};

const DICTIONARY = {
  bn: {
    "Language Selection": "ভাষা নির্বাচন",
    "Choose your preferred language": "আপনার পছন্দের ভাষা বেছে নিন",
    "Continue": "চালিয়ে যান",
    English: "ইংরেজি",
    Bengali: "বাংলা",
    Hindi: "হিন্দি",
    Home: "হোম",
    SHG: "এসএইচজি",
    Loan: "ঋণ",
    Reports: "রিপোর্ট",
    Profile: "প্রোফাইল",
    "Save & Next": "সেভ করুন ও পরবর্তী",
    Save: "সেভ",
    Back: "ফিরে যান",
    "Log-In": "লগ-ইন",
    "Sign-up": "সাইন-আপ",
    Logout: "লগআউট",
    Loading: "লোড হচ্ছে",
    "SRS Livelihood App": "এসআরএস জীবিকা অ্যাপ",
    "Digital Livelihood Monitoring System": "ডিজিটাল জীবিকা মনিটরিং সিস্টেম"
  },
  hi: {
    "Language Selection": "भाषा चयन",
    "Choose your preferred language": "अपनी पसंदीदा भाषा चुनें",
    Continue: "जारी रखें",
    English: "अंग्रेजी",
    Bengali: "बंगाली",
    Hindi: "हिंदी",
    Home: "होम",
    SHG: "एसएचजी",
    Loan: "ऋण",
    Reports: "रिपोर्ट",
    Profile: "प्रोफाइल",
    "Save & Next": "सेव करें और आगे बढ़ें",
    Save: "सेव करें",
    Back: "वापस",
    "Log-In": "लॉग-इन",
    "Sign-up": "साइन-अप",
    Logout: "लॉगआउट",
    Loading: "लोड हो रहा है",
    "SRS Livelihood App": "एसआरएस आजीविका ऐप",
    "Digital Livelihood Monitoring System": "डिजिटल आजीविका मॉनिटरिंग सिस्टम"
  },
  as: {
    "Language Selection": "ভাষা নিৰ্বাচন",
    "Choose your preferred language": "আপোনাৰ পছন্দৰ ভাষা বাছি লওক",
    Continue: "আগবাঢ়ক",
    English: "ইংৰাজী",
    Bengali: "বাংলা",
    Hindi: "হিন্দী",
    Assamese: "অসমীয়া",
    Home: "গৃহ",
    SHG: "এছএইচজি",
    Loan: "ঋণ",
    Reports: "প্রতিবেদন",
    Profile: "প্রোফাইল",
    "Save & Next": "সংরক্ষণ কৰক আৰু আগবাঢ়ক",
    Save: "সংরক্ষণ",
    Back: "পিছলৈ যাওক",
    "Log-In": "লগ-ইন",
    "Sign-up": "নিবন্ধন",
    Logout: "লগ-আউট",
    Loading: "লোড হৈ আছে",
    "SRS Livelihood App": "এছআৰএছ জীৱিকা এপ",
    "Digital Livelihood Monitoring System": "ডিজিটেল জীৱিকা পর্যবেক্ষণ ব্যৱস্থা"
  }
};

export function translateText(language, key) {
  if (typeof key !== "string") return key;
  const code = LANGUAGE_CODE_MAP[language] || "en";
  if (code === "en") return key;
  return DICTIONARY[code]?.[key] || key;
}
