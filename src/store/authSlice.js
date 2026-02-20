import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  language: "English",
  loggedIn: false,
  lokosId: "",
  role: "CRP",
  error: ""
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    login: (state, action) => {
      const { lokosId, role } = action.payload;
      const trimmed = (lokosId || "").trim().toUpperCase();
      if (!trimmed || !trimmed.startsWith("LOKOS-")) {
        state.error = "LokOS ID must start with LOKOS-";
        return;
      }
      state.loggedIn = true;
      state.lokosId = trimmed;
      state.role = role;
      state.error = "";
    },
    logout: () => initialState
  }
});

export const { setLanguage, login, logout } = authSlice.actions;
export default authSlice.reducer;
