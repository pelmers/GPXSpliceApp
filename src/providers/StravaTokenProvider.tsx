import React, { useState } from "react";
import { StravaAthlete } from "../types/strava";

type SavedStravaToken = {
  accessToken: string;
  expiresAtUnixSeconds: number;
  scope: string;
  athlete: StravaAthlete;
};

export type StravaTokenContextType = {
  stravaToken: SavedStravaToken | null;
  setStravaToken: (stravaToken: SavedStravaToken) => void;
};

export const StravaTokenContext = React.createContext<StravaTokenContextType>({
  stravaToken: null,
  setStravaToken: () => {
    throw new Error("setStravaToken must be used within a StravaTokenProvider");
  },
});

export const StravaTokenProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stravaToken, setStravaToken] = useState<SavedStravaToken | null>(null);

  return (
    <StravaTokenContext.Provider value={{ stravaToken, setStravaToken }}>
      {children}
    </StravaTokenContext.Provider>
  );
};

export const useStravaToken = () => {
  const context = React.useContext(StravaTokenContext);
  if (context === undefined) {
    throw new Error("useStravaToken must be used within a StravaTokenProvider");
  }
  return context;
};
