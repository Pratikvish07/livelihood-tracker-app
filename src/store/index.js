import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import workflowReducer from "./workflowSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workflow: workflowReducer,
    ui: uiReducer
  }
});
