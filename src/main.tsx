import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import { BrowserRouter, Routes, Navigate, Route } from "react-router";
import PeopleSearch from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import TemporaryLogin from "./pages/TemporaryLogin";

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/:username/temporary-login"
              element={<TemporaryLogin />}
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <PeopleSearch />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/search" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
