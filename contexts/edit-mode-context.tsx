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
    // Only check URL parameter on initial load
    const urlParams = new URLSearchParams(window.location.search);
    const editParam = urlParams.get("edit");
    if (editParam === "true") {
      setIsEditMode(true);
    }
  }, []);

  const setEditMode = (mode: boolean) => {
    setIsEditMode(mode);
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
