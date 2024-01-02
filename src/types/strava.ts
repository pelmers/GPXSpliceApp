import { Platform, Linking } from "react-native";
import { GpxFile, GpxPoint, pointsToGpx } from "../utils/gpx";

import FileSystem from "../utils/UniversalFileSystem";

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

export type StravaUploadResult = {
  id_str: string;
  activity_id: number;
  external_id: string;
  id: number;
  error: string;
  status: string;
  message?: string;
};

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

async function writeGpxToCache(
  id: number,
  gpxContents: string,
): Promise<string> {
  if (FileSystem.cacheDirectory == null) {
    throw new Error("FileSystem.cacheDirectory is null");
  }
  const fileUri = `${FileSystem.cacheDirectory}/activity-${id}.gpx`;
  await FileSystem.writeAsStringAsync(fileUri, gpxContents);
  return fileUri;
}

// Attempt to download a activity from strava, save it to a cache and return the uri
// Strava doesn't give us a direct gpx file unless it was uploaded from a device in that format
// Instead we can download all the streams and build our own gpx file
// This function saves the GPX file to cache and returns the path to the saved file on disk.
export async function fetchStravaActivityGpxToDisk(
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
  const parsedResponse = await response.json();
  if (parsedResponse.errors != null) {
    throw new Error(`${parsedResponse.message}, try logging in again`);
  }
  const streams = parsedResponse as StravaStream[];
  const gpxContents = stravaStreamsToGpx(activity, streams);
  return await writeGpxToCache(activity.id, gpxContents);
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
          // TODO: what is this -200000 for? do i need it for avoiding strava dupe detection?
          // start_date.getTime() + s.data[i] * 1000 - 200000,
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

export async function uploadActivity(
  accessToken: string,
  gpx: GpxFile,
): Promise<StravaUploadResult> {
  const data = new FormData();
  const externalId = `gpxsplice-${Date.now()}`;

  // @ts-ignore difference between React Native fetch and browser fetch
  data.append("file", {
    uri: await writeGpxToCache(Date.now(), pointsToGpx(gpx)),
    type: "application/gpx+xml",
    name: gpx.name,
  });

  data.append("name", gpx.name);
  data.append("external_id", externalId);
  data.append("description", "Uploaded from GPX Splice");
  data.append("data_type", "gpx");

  const request = new Request("https://www.strava.com/api/v3/uploads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });

  const uploadResponse = await fetch(request);
  const responseJson: StravaUploadResult = await uploadResponse.json();

  if (responseJson.error || responseJson.message) {
    const error = responseJson.error || responseJson.message;
    throw new Error(error);
  }

  const { id } = responseJson;

  const retryLimit = 30;
  let retryCount = 0;
  while (retryCount < retryLimit) {
    const statusResponse = await fetch(
      `https://www.strava.com/api/v3/uploads/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const statusJson: StravaUploadResult = await statusResponse.json();

    if (statusJson.error || statusJson.message) {
      const error = statusJson.error || statusJson.message;
      throw new Error(error);
    }

    if (statusJson.status === "Your activity is ready.") {
      return statusJson;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    retryCount++;
  }

  throw new Error(
    "Upload timed out after 30 seconds. It's possible Strava is just slow today. Try checking your activities later.",
  );
}

export async function getStravaAuthEndpoint() {
  const defaultEndpoint = "https://www.strava.com/oauth/mobile/authorize";
  const appEndpoint = "strava://oauth/mobile/authorize";
  // If the platform is android or web, use the default endpoint
  // On android the implicit intent will open the Strava app if it's installed
  if (Platform.OS === "android" || Platform.OS === "web") {
    return defaultEndpoint;
  } else {
    // On iOS we should first check if the Strava app is installed, and if so, use the custom URL scheme
    if (await Linking.canOpenURL(appEndpoint)) {
      return appEndpoint;
    }
    // Otherwise use the default
    return defaultEndpoint;
  }
}
