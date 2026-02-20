import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    module: "Field Visit"
  },
  reducers: {
    setModule: (state, action) => {
      state.module = action.payload;
    }
  }
});

export const { setModule } = uiSlice.actions;
export default uiSlice.reducer;
