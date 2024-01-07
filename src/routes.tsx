export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Info: undefined;
  Split: undefined;
  Combine: undefined;
  "Combine Preview": {
    gpxFileUris: string[];
  };
  "Combine (Strava)": undefined;
  "Split (Strava)": undefined;
  "Split Map": {
    gpxFileUri: string;
  };
  "Post Split": {
    splitIndex: number;
    gpxFileUri: string;
  };
  AuthRedirect: undefined;
};
