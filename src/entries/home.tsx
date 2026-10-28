import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/global.css";
import { Layout } from "../components/Layout";
import { Home } from "../pages/Home";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
      <Home />
    </Layout>
  </StrictMode>,
);
