import { useCallback, useRef, useState } from "react";
import Toast from "../components/Toast.jsx";
import { ToastContext } from "./ToastContext.js";

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
