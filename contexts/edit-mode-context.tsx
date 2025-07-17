"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface EditModeContextType {
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(
  undefined
);

interface EditModeProviderProps {
  children: ReactNode;
}

const EDIT_MODE_KEY = "global-pbl-edit-mode";

export function EditModeProvider({ children }: EditModeProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Check for saved edit mode in sessionStorage first
    const savedEditMode = sessionStorage.getItem(EDIT_MODE_KEY);

    if (savedEditMode === "true") {
      setIsEditMode(true);
    }

    // Always check URL parameter for edit commands
    const urlParams = new URLSearchParams(window.location.search);
    const editParam = urlParams.get("edit");

    if (editParam === "true") {
      setIsEditMode(true);
      // Save to sessionStorage
      sessionStorage.setItem(EDIT_MODE_KEY, "true");

      // Remove edit parameter from URL
      urlParams.delete("edit");
      const newUrl = `${window.location.pathname}${
        urlParams.toString() ? "?" + urlParams.toString() : ""
      }`;
      window.history.replaceState({}, "", newUrl);
    } else if (editParam === "false") {
      setIsEditMode(false);
      // Remove from sessionStorage
      sessionStorage.removeItem(EDIT_MODE_KEY);

      // Remove edit parameter from URL
      urlParams.delete("edit");
      const newUrl = `${window.location.pathname}${
        urlParams.toString() ? "?" + urlParams.toString() : ""
      }`;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  const setEditMode = (mode: boolean) => {
    setIsEditMode(mode);

    // Update sessionStorage
    if (mode) {
      sessionStorage.setItem(EDIT_MODE_KEY, "true");
    } else {
      sessionStorage.removeItem(EDIT_MODE_KEY);
    }
  };

  return (
    <EditModeContext.Provider value={{ isEditMode, setEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error("useEditMode must be used within an EditModeProvider");
  }
  return context;
}
