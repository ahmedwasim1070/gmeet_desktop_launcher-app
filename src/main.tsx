// Imports
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { TitleBar } from "./components/layout/TitleBar";

//
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TitleBar />
    <App />
  </React.StrictMode>,
);
