import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import { DefaultSettings, SavedSettings } from "../types/settings";

export type SettingsContextType = {
  settings: SavedSettings;
  setSettings: (settings: SavedSettings) => void;
};

export const SettingsContext = React.createContext<
  SettingsContextType | undefined
>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<SavedSettings>(DefaultSettings);

  useEffect(() => {
    AsyncStorage.getItem("settings").then((storedSettings) => {
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    });
  }, []);

  const value: SettingsContextType = {
    settings,
    setSettings: (newSettings) => {
      setSettings(newSettings);
      AsyncStorage.setItem("settings", JSON.stringify(newSettings));
    },
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
