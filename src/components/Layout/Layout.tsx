import React from "react";
import { Header } from "./Header";

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Header />
        <main>{children}</main>
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 People Search. Built with React + React Query + NestJS</p>
        </footer>
      </div>
    </div>
  );
}
