import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/global.css";
import { Layout } from "../components/Layout";
import { Averroes } from "../pages/Averroes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
      <Averroes />
    </Layout>
  </StrictMode>,
);
