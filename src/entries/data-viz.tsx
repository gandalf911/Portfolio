import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/global.css";
import { Layout } from "../components/Layout";
import { DataViz } from "../pages/DataViz";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
      <DataViz />
    </Layout>
  </StrictMode>,
);
