import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { BrowserRouter, Routes, Navigate, Route } from "react-router";
import PeopleSearch from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import TemporaryLogin from "./pages/TemporaryLogin";
import { Loader2 } from "lucide-react";

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

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Animated spinner */}
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        </div>
        
        {/* Loading text */}
        <h2 className="text-xl font-semibold text-white mb-2">
          Loading
        </h2>
        <p className="text-sm text-gray-400">
          Restoring your session...
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

// App Routes Component - has access to auth context
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading screen while checking auth
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Admin login page - redirect to search if already logged in */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/search" replace /> : <Login />} 
      />

      {/* Temporary token entry page - redirect to search if already logged in */}
      <Route 
        path="/temporary-login" 
        element={isAuthenticated ? <Navigate to="/search" replace /> : <TemporaryLogin />} 
      />

      {/* Protected search page */}
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <PeopleSearch />
          </ProtectedRoute>
        }
      />

      {/* Default redirect - if authenticated go to search, else to temporary login */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/search" : "/temporary-login"} replace />} 
      />
    </Routes>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);