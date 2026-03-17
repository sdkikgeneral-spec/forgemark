import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { WebviewApp } from "./WebviewApp";

const root = document.getElementById("root");
if (!root) throw new Error("#root が見つかりません");

createRoot(root).render(
  <StrictMode>
    <WebviewApp />
  </StrictMode>
);
