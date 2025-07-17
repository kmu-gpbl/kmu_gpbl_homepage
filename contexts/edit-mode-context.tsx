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

export function EditModeProvider({ children }: EditModeProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Check for edit parameter in URL on mount
    const urlParams = new URLSearchParams(window.location.search);
    const editParam = urlParams.get("edit");
    setIsEditMode(editParam === "true");
  }, []);

  const setEditMode = (mode: boolean) => {
    setIsEditMode(mode);

    // Update URL parameter
    const url = new URL(window.location.href);
    if (mode) {
      url.searchParams.set("edit", "true");
    } else {
      url.searchParams.delete("edit");
    }
    window.history.replaceState({}, "", url);
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
