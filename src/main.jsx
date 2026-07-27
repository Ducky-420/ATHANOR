import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastProvider } from "./hooks/useToast.jsx";
import "./styles/tokens.css";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>
);

const splash = document.getElementById("splash");
requestAnimationFrame(() => {
  setTimeout(() => {
    if (splash) {
      splash.classList.add("hide");
      setTimeout(() => splash.remove(), 400);
    }
  }, 120);
});
