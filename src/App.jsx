import React from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { routes } from "./routes";

// hooks
import useAuth from "./hooks/useAuth";
import useStorageSync from "./hooks/useStorageSync";
import { DarkModeProvider } from "./hooks/dark-mode";

// components
import AtomLoader from "./components/loader/AtomLoader";

// styles
import "./assets/styles/global.css";
import "./assets/styles/typography.css";
import "./assets/styles/layout.css";

const App = () => {
  const { isLoading, authChecked } = useAuth();
  
  // Enable real-time storage sync across tabs
  useStorageSync();

  if (!authChecked || isLoading) {
    return (
      <div className="h-screen w-screen center">
        <AtomLoader />
      </div>
    );
  }
  return (
    <DarkModeProvider>
      <RouterProvider router={routes} />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            borderRadius: "8px",
            background: "#222",
            color: "#eee",
            fontSize: "14px",
            padding: "16px",
            border: "1px solid #333",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          },
        }}
      />
    </DarkModeProvider>
  );
};

export default App;
