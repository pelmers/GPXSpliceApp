import { XMLParser } from "fast-xml-parser";

export type GpxPoint = Partial<{
  temp: number;
  watts: number;
  latlng: [number, number];
  cadence: number;
  distance: number;
  heartrate: number;
  altitude: number;
  time: number;
}>;

// Converts a list of points into a gpx file
export function pointsToGpx(
  points: GpxPoint[],
  name: string,
  type: string,
): string {
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
export function parseGpxFile(gpxContents: string): {
  points: GpxPoint[];
  name: string;
  type: string;
} {
  const parser = new XMLParser({
    parseAttributeValue: true,
    ignoreAttributes: false,
  });
  const jsGpx = parser.parse(gpxContents).gpx;
  const name = jsGpx.metadata.name;
  const type = jsGpx.trk.type;
  const trkpts = jsGpx.trk.trkseg.trkpt;
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
