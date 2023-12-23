export function jsonToGPX(name: string, points: LatLngEle[]): string {
  let gpx = (
`<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="GPXSplice with Barometer" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3">
    <metadata>
        <name>${name}</name>
    </metadata>
    <trk>
        <name>${name}</name>
        <trkseg>
            ${points
              .map((p) => {
                return `<trkpt lat="${p.lat}" lon="${p.lng}">
                ${p.ele ? `<ele>${p.ele}</ele>` : ""}
            </trkpt>`;
              })
              .join("\n")}
        </trkseg>
    </trk>
</gpx>`
  );
  return gpx;
}
