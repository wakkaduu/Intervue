"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Category } from "@/types";
import { getCategories } from "@/lib/questions";

const allCategories = getCategories();

interface SidebarContextType {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>(allCategories[0]);

  // Remember the last practised track across visits
  useEffect(() => {
    try {
      const saved = localStorage.getItem("intervue_last_category");
      if (saved && (allCategories as string[]).includes(saved)) {
        setSelectedCategory(saved as Category);
      }
    } catch {
      // storage unavailable
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("intervue_last_category", selectedCategory);
    } catch {
      // storage unavailable
    }
  }, [selectedCategory]);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Close sidebar on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextType {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
