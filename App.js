import React from "react";
import { Provider } from "react-redux";
import AppRouter from "./src/routes/AppRouter";
import { store } from "./src/store";

export default function App() {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  );
}
