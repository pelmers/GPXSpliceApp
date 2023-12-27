import { GpxPoint, parseGpxFile, pointsToGpx } from "../utils/gpx";

// incomplete, refer to https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
export type StravaActivity = { id: number } & Partial<{
  achievement_count: number;
  athlete: {
    id: number;
    resource_state: number;
  };
  athlete_count: number;
  average_cadence: number;
  average_heartrate: number;
  average_speed: number;
  average_temp: number;
  average_watts: number;
  comment_count: number;
  commute: boolean;
  device_watts: boolean;
  display_hide_heartrate_option: boolean;
  distance: number;
  elapsed_time: number;
  elev_high: number;
  elev_low: number;
  end_latlng: [number, number];
  external_id: string;
  flagged: boolean;
  from_accepted_tag: boolean;
  gear_id: string;
  has_heartrate: boolean;
  has_kudoed: boolean;
  heartrate_opt_out: boolean;
  id: number;
  kilojoules: number;
  kudos_count: number;
  location_city: null | string;
  location_country: string;
  location_state: null | string;
  manual: boolean;
  map: {
    id: string;
    resource_state: number;
    summary_polyline: string;
  };
  max_heartrate: number;
  max_speed: number;
  max_watts: number;
  moving_time: number;
  name: string;
  photo_count: number;
  pr_count: number;
  private: boolean;
  resource_state: number;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  start_latlng: [number, number];
  suffer_score: number;
  timezone: string;
  total_elevation_gain: number;
  total_photo_count: number;
  trainer: boolean;
  type: string;
  upload_id: number;
  upload_id_str: string;
  utc_offset: number;
  visibility: string;
  weighted_average_watts: number;
  workout_type: string;
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

export type StravaStream =
  | { type: "temp"; data: number[] }
  | { type: "watts"; data: number[] }
  | { type: "latlng"; data: [number, number][] }
  | { type: "cadence"; data: number[] }
  | { type: "distance"; data: number[] }
  | { type: "heartrate"; data: number[] }
  | { type: "altitude"; data: number[] }
  | ({ type: "time"; data: number[] } & {
      original_size: number;
      resolution: string;
      series_type: string;
    });

export async function fetchStravaActivities(
  accessToken: string,
  page: number = 1,
): Promise<StravaActivity[]> {
  const response = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?page=${page}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const json = await response.json();
  // if error in json, throw an error
  if (json.errors != null) {
    throw new Error(json.errors[0].message);
  }
  return json;
}

// Attempt to download a activity from strava, save it to a cache and return the uri
// Strava doesn't give us a direct gpx file unless it was uploaded from a device in that format
// Instead we can download all the streams and build our own gpx file
// This function returns the gpx contents as a string.
export async function fetchStravaActivityGpx(
  activity: StravaActivity,
  accessToken: string,
): Promise<string> {
  const activityId = activity.id;
  // Ask for all streams
  const response = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}/streams/time,distance,latlng,altitude,heartrate,cadence,watts,temp`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  // just log the result for now
  const streams = (await response.json()) as StravaStream[];
  return stravaStreamsToGpx(activity, streams);
}

function stravaStreamsToGpx(
  activity: StravaActivity,
  streams: StravaStream[],
): string {
  const name = activity.name;
  const type = activity.type;
  const start_date = new Date(activity.start_date!);
  // Join all the stream types into point objects by zipping them together
  const n_points = streams.find((s) => s.type === "latlng")?.data.length;
  if (n_points == null) {
    throw new Error("No latlng stream for activity");
  }
  // Keep all the streams with data of the same length
  const points: GpxPoint[] = [];
  for (let i = 0; i < n_points; i++) {
    const point: { [key: string]: any } = {};
    streams.forEach((s) => {
      if (s.type === "time") {
        // Strava stream gives back seconds since the start. We want to save as ISO string so need to add to the start date
        point.time = new Date(
          start_date.getTime() + s.data[i] * 1000,
        ).toISOString();
      } else {
        point[s.type] = s.data[i];
      }
    });
    points.push(point as GpxPoint);
  }

  return pointsToGpx({
    points,
    name: name ?? "Unnamed Activity",
    type: type ?? "UnknownSport",
  });
}
