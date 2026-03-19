import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  language: "English",
  loggedIn: false,
  lokosId: "",
  role: "CRP",
  error: "",
  signupStatus: "idle", // 'idle' | 'loading' | 'success' | 'error'
  signupError: ""
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
    logout: () => initialState,
    signupStart: (state) => {
      state.signupStatus = "loading";
      state.signupError = "";
    },
    signupSuccess: (state, action) => {
      state.signupStatus = "success";
      state.signupError = "";
      // Optionally set pending login state here
    },
    signupFailure: (state, action) => {
      state.signupStatus = "error";
      state.signupError = action.payload || "Signup failed";
    },
    clearSignupError: (state) => {
      state.signupStatus = "idle";
      state.signupError = "";
    }
  }
});

export const { 
  setLanguage, 
  login, 
  logout,
  signupStart,
  signupSuccess,
  signupFailure,
  clearSignupError 
} = authSlice.actions;
export default authSlice.reducer;
