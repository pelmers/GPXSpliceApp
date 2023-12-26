import { StravaAthlete } from "./types/strava";

export type RootStackParamList = {
  Home: undefined;
  Split: undefined;
  "Strava List": {
    accessToken: string;
    mode: "split" | "combine";
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
