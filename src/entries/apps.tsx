import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/global.css";
import { Layout } from "../components/Layout";
import { Apps } from "../pages/Apps";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
      <Apps />
    </Layout>
  </StrictMode>,
);
