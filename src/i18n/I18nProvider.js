import React, { createContext, useContext, useMemo } from "react";
import { translateText } from "./translations";

const I18nContext = createContext({
  language: "English",
  t: (value) => value
});

export function I18nProvider({ language, children }) {
  const value = useMemo(
    () => ({
      language,
      t: (text) => translateText(language, text)
    }),
    [language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
