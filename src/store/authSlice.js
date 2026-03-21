import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  language: "English",
  loggedIn: false,
  lokosId: "",
  crpId: "",
  role: "CRP",
  token: "",
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
    loginSuccess: (state, action) => {
      const { crpId, role, token } = action.payload || {};
      state.loggedIn = true;
      state.crpId = String(crpId || "").trim().toUpperCase();
      state.role = role || "CRP";
      state.token = token || "";
      state.error = "";
    },
    setAuthError: (state, action) => {
      state.error = action.payload || "";
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
  loginSuccess,
  setAuthError,
  logout,
  signupStart,
  signupSuccess,
  signupFailure,
  clearSignupError 
} = authSlice.actions;
export default authSlice.reducer;
