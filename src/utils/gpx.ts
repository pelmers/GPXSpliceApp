import { point as turfPoint, distance as turfDistance } from "@turf/turf";

import { XMLParser } from "fast-xml-parser";

export type GpxPoint = { latlng: [number, number] } & Partial<{
  temp: number;
  watts: number;
  cadence: number;
  distance: number;
  heartrate: number;
  altitude: number;
  time: string;
}>;

export type GpxFile = {
  points: GpxPoint[];
  name: string;
  type: string;
};

export type GpxSummary = {
  distance: number;
} & Partial<{
  startTime: string | null;
  durationMs: number | null;
  averageSpeed: number | null;
  averageHeartRate: number | null;
  averageCadence: number | null;
  averagePower: number | null;
}>;

// Return a version of the gpx file with all times offset by the given number of milliseconds
export function offsetAllTimes(gpx: GpxFile, offsetMs: number): GpxFile {
  return {
    ...gpx,
    points: gpx.points.map((point) => ({
      ...point,
      time: point.time
        ? new Date(new Date(point.time).getTime() + offsetMs).toISOString()
        : undefined,
    })),
  };
}

// Converts a list of points into a gpx file
export function pointsToGpx(gpx: GpxFile): string {
  // TODO do I want to use multiple trkseg for pauses?
  const { points, name, type } = gpx;
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="GPXSplice with Barometer" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3">
    <metadata>
        <name>${name}</name>
    </metadata>
    <trk>
        <name>${name}</name>
        <type>${type}</type>
        <trkseg>
            ${points
              .map((p) => {
                return `<trkpt lat="${p.latlng?.[0] ?? ""}" lon="${
                  p.latlng?.[1] ?? ""
                }">
                    ${p.altitude != null ? `<ele>${p.altitude}</ele>` : ""}
                    ${p.time != null ? `<time>${p.time}</time>` : ""}
                    <extensions>
                    ${p.watts != null ? `<power>${p.watts}</power>` : ""}
                    <gpxtpx:TrackPointExtension>
                        ${
                          p.cadence != null
                            ? `<gpxtpx:cad>${p.cadence}</gpxtpx:cad>`
                            : ""
                        }
                        ${
                          p.heartrate != null
                            ? `<gpxtpx:hr>${p.heartrate}</gpxtpx:hr>`
                            : ""
                        }
                        ${
                          p.temp != null
                            ? `<gpxtpx:atemp>${p.temp}</gpxtpx:atemp>`
                            : ""
                        }
                    </gpxtpx:TrackPointExtension>
                    </extensions>
            </trkpt>`;
              })
              .join("\n")}
        </trkseg>
    </trk>
</gpx>`;
}

// Parses a gpx file as written by the above function into a list of points and its metadata
export function parseGpxFile(
  filepath: string,
  gpxContents: string,
): {
  points: GpxPoint[];
  name: string;
  type: string;
} {
  const parser = new XMLParser({
    parseAttributeValue: true,
    ignoreAttributes: false,
  });
  const jsGpx = parser.parse(gpxContents).gpx;
  const name =
    jsGpx.metadata?.name ??
    decodeURIComponent(filepath.split("/").pop() ?? "Unknown Name");
  const type = jsGpx.trk.type ?? "Unknown Type";
  // trkseg can either be a single object or an array. if it's an array then join them all
  const trkpts = Array.isArray(jsGpx.trk.trkseg)
    ? jsGpx.trk.trkseg.flatMap((seg: any) => seg.trkpt || [])
    : jsGpx.trk.trkseg.trkpt;
  if (!trkpts) {
    throw new Error(
      "No track points found in gpx file. Check the file contents. If this is a bug in the app, please report it!",
    );
  }
  const points = trkpts.map(
    (point: any): GpxPoint => ({
      latlng: [parseFloat(point["@_lat"]), parseFloat(point["@_lon"])],
      altitude: point.ele,
      time: point.time,
      watts: point.extensions?.power,
      cadence: point.extensions?.["gpxtpx:TrackPointExtension"]?.["gpxtpx:cad"],
      heartrate:
        point.extensions?.["gpxtpx:TrackPointExtension"]?.["gpxtpx:hr"],
      temp: point.extensions?.["gpxtpx:TrackPointExtension"]?.["gpxtpx:atemp"],
    }),
  );
  return { points, name, type };
}

export function calculateCumulativeDistance(points: GpxPoint[]): number[] {
  let cumulativeDistance = 0;
  const cumulativeDistances = [0];

  for (let i = 1; i < points.length; i++) {
    const from = turfPoint([points[i - 1].latlng[1], points[i - 1].latlng[0]]);
    const to = turfPoint([points[i].latlng[1], points[i].latlng[0]]);
    const segmentDistance = turfDistance(from, to, { units: "kilometers" });

    cumulativeDistance += segmentDistance;
    cumulativeDistances.push(cumulativeDistance);
  }

  return cumulativeDistances;
}

export function gpxSummaryStats(points: GpxPoint[]): GpxSummary {
  const cumulativeDistances = calculateCumulativeDistance(points);

  const distance = cumulativeDistances[cumulativeDistances.length - 1];
  const duration = points[points.length - 1].time
    ? new Date(points[points.length - 1].time!).getTime() -
      new Date(points[0].time!).getTime()
    : null;
  const startTime = points[0].time ?? null;

  const averageSpeed = duration ? (distance * 3600 * 1000) / duration : null;
  const averageHeartRate =
    points.reduce((sum, point) => sum + (point.heartrate ?? 0), 0) /
    points.length;
  const averageCadence =
    points.reduce((sum, point) => sum + (point.cadence ?? 0), 0) /
    points.length;
  const averagePower =
    points.reduce((sum, point) => sum + (point.watts ?? 0), 0) / points.length;

  return {
    startTime,
    distance,
    durationMs: duration,
    averageSpeed,
    averageHeartRate: averageHeartRate ? Math.round(averageHeartRate) : null,
    averageCadence: averageCadence ? Math.round(averageCadence) : null,
    averagePower: averagePower ? Math.round(averagePower) : null,
  };
}
