import { StravaAthlete } from "./types/strava";

export type RootStackParamList = {
  Home: undefined;
  Split: undefined;
  Combine: undefined;
  "Combine Preview": {
    gpxFileUris: string[];
    stravaAccessToken?: string;
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
    stravaAccessToken?: string;
  };
  "Post Split": {
    stravaAccessToken?: string;
    splitIndex: number;
    gpxFileUri: string;
  };
};
