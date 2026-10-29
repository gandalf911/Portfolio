import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/global.css";
import { Layout } from "../components/Layout";
import { Onboarding } from "../pages/Onboarding";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
      <Onboarding />
    </Layout>
  </StrictMode>,
);
