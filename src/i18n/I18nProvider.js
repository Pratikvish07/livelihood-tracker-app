import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getFallbackTranslation } from "./translations";
import { getCachedTranslation, translateBatch } from "./googleTranslate";
import { LANGUAGES } from "../constants/appData";

const I18nContext = createContext({
  language: "English",
  t: (value) => value
});

const CORE_LABELS = [
  "Language Selection",
  "Choose your preferred language",
  "Continue",
  "Select Interface Language",
  "Available Across India",
  "Pick any language and the app will translate labels dynamically using Google Translate when configured.",
  "Government of Tripura",
  "Tripura Rural Livelihood Mission",
  "Home",
  "Loan",
  "Profile",
  "SHG",
  "Reports",
  "Save",
  "Save & Next",
  "Back",
  "Log-In",
  "Sign-up",
  "Logout",
  "Loading",
  "SRS Livelihood App",
  "Digital Livelihood Monitoring System"
].concat(LANGUAGES);

export function I18nProvider({ language, children }) {
  const [dynamicTranslations, setDynamicTranslations] = useState({});

  useEffect(() => {
    let isMounted = true;

    setDynamicTranslations({});

    translateBatch(language, CORE_LABELS).then((translations) => {
      if (!isMounted || !translations) {
        return;
      }

      setDynamicTranslations(translations);
    });

    return () => {
      isMounted = false;
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      t: (text) => {
        if (typeof text !== "string") {
          return text;
        }

        return (
          dynamicTranslations[text] ||
          getCachedTranslation(language, text) ||
          getFallbackTranslation(language, text)
        );
      }
    }),
    [dynamicTranslations, language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useTranslatedValue(value) {
  const { language, t } = useI18n();
  const [translatedValue, setTranslatedValue] = useState(() => {
    if (typeof value !== "string") {
      return value;
    }

    return t(value);
  });

  useEffect(() => {
    let isMounted = true;

    if (typeof value !== "string") {
      setTranslatedValue(value);
      return () => {
        isMounted = false;
      };
    }

    const fallbackValue = t(value);
    setTranslatedValue(fallbackValue);

    translateBatch(language, [value]).then((translations) => {
      if (!isMounted) {
        return;
      }

      setTranslatedValue(translations?.[value] || fallbackValue);
    });

    return () => {
      isMounted = false;
    };
  }, [language, t, value]);

  return translatedValue;
}
