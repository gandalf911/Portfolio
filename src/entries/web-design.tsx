import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/global.css";
import { Layout } from "../components/Layout";
import { WebDesign } from "../pages/WebDesign";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
      <WebDesign />
    </Layout>
  </StrictMode>,
);
