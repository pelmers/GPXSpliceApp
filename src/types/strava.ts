// incomplete, refer to https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
export type StravaActivity = { id: number } & Partial<{
  name: string;
  distance: number; // in meters
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number; // in meters
  type: string;
  sport_type: string;
  kudos_count: number;
  comment_count: number;
  private: boolean;
  average_speed: number; // in meters per second
  max_speed: number;
  location_city: string;
  location_state: string;
  location_country: string;
}>;

export type StravaAthlete = { id: number } & Partial<{
  badge_type_id: number;
  bio: string;
  city: string;
  country: string;
  created_at: string;
  firstname: string;
  follower: null;
  friend: null;
  id: number;
  lastname: string;
  premium: boolean;
  profile: string;
  profile_medium: string;
  resource_state: number;
  sex: string;
  state: string;
  summit: boolean;
  updated_at: string;
  username: string;
  weight: number;
}>;
