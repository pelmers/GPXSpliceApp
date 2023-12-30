import { StravaAthlete } from "./types/strava";

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Info: undefined;
  Split: undefined;
  Combine: undefined;
  "Combine Preview": {
    gpxFileUris: string[];
  };
  "Combine (Strava)": {
    accessToken: string;
    athlete: StravaAthlete;
  };
  "Split (Strava)": {
    accessToken: string;
    athlete: StravaAthlete;
  };
  "Split Map": {
    gpxFileUri: string;
  };
  "Post Split": {
    splitIndex: number;
    gpxFileUri: string;
  };
};
