import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import i18n, { persistLanguage } from "./config";
import { getLanguageCode } from "./translations";

const I18nContext = createContext({
  language: "en",
  setLanguage: async () => {},
  t: (value) => value
});

export function I18nProvider({ language, onChangeLanguage, children }) {
  const resolvedLanguage = getLanguageCode(language);
  const [, setLanguageVersion] = useState(0);

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageVersion((current) => current + 1);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    if (i18n.language !== resolvedLanguage) {
      i18n.changeLanguage(resolvedLanguage);
    }
  }, [resolvedLanguage]);

  const value = useMemo(
    () => ({
      language: resolvedLanguage,
      setLanguage: async (nextLanguage) => {
        const nextCode = getLanguageCode(nextLanguage);
        await persistLanguage(nextCode);
        await i18n.changeLanguage(nextCode);
        if (onChangeLanguage) {
          await onChangeLanguage(nextCode);
        }
      },
      t: (text, options = {}) => {
        if (typeof text !== "string") {
          return text;
        }

        return i18n.t(text, {
          lng: resolvedLanguage,
          defaultValue: text,
          ...options
        });
      }
    }),
    [onChangeLanguage, resolvedLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useTranslatedValue(value) {
  const { t } = useI18n();

  return useMemo(() => {
    if (typeof value !== "string") {
      return value;
    }

    return t(value);
  }, [t, value]);
}
