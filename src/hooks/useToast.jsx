import { createContext, useCallback, useContext, useRef, useState } from "react";
import Toast from "../components/Toast.jsx";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // variant: "info" | "error" | "success"
  const showToast = useCallback(
    ({ message, variant = "info", actionLabel, onAction, duration = 4000 }) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, message, variant, actionLabel, onAction }]);
      if (duration !== Infinity) {
        setTimeout(() => dismissToast(id), duration);
      }
      return id;
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
