import { StravaAthlete } from "./types/strava";

export type RootStackParamList = {
  Home: undefined;
  SplitEntry: undefined;
  StravaActivities: {
    accessToken: string;
    mode: "split" | "combine";
    athlete: StravaAthlete;
  };
  GpxSplitMap: {
    gpxFileUri: string;
    stravaAccessToken?: string;
  };
  PostSplit: {
    stravaAccessToken: string;
    splitIndex: number;
    gpxFileUri: string;
  }
};
