import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Slider from "@react-native-community/slider";

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

// For web, consider @teovilla/react-native-web-maps
// e.g. https://stackoverflow.com/a/76702937/2288934
import MapView from "react-native-maps";
import { Polyline, Marker } from "react-native-maps";

import { colors } from "../utils/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";
import {
  GpxFile,
  GpxPoint,
  calculateCumulativeDistance,
  parseGpxFile,
  pointsToGpx,
} from "../utils/gpx";
import { GpxChartingModule } from "../components/GpxChartingModule";

type Props = NativeStackScreenProps<RootStackParamList, "Combine Preview">;

async function writeFile(file: GpxFile): Promise<string> {
  const serializedGpxFileString = pointsToGpx(file);
  const path = `${FileSystem.documentDirectory}${encodeURIComponent(
    file.name,
  )}.gpx`;
  await FileSystem.writeAsStringAsync(path, serializedGpxFileString);
  return path;
}

export function CombinePreviewScreen({ navigation, route }: Props) {
  const [gpx, setGpx] = useState<GpxFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { gpxFileUris, stravaAccessToken } = route.params;
  // Read the gpx file on mount
  useEffect(() => {
    async function readGpxFiles() {
      const parsedGpxs = await Promise.all(
        gpxFileUris.map(async (gpxFileUri) => {
          const fileContents = await FileSystem.readAsStringAsync(gpxFileUri);
          return parseGpxFile(fileContents);
        }),
      );
      // TODO: sort the gpx files by the time of their first point, then concatenate them
      parsedGpxs.sort((a, b) => {
        // If uncomparable, then just return a
        if (
          a.points.length === 0 ||
          b.points.length === 0 ||
          a.points[0].time == null ||
          b.points[0].time == null
        ) {
          return -1;
        }
        // Convert time string to a date object
        const aTime = new Date(a.points[0].time);
        const bTime = new Date(b.points[0].time);
        return aTime.getTime() - bTime.getTime();
      });
      const joinedGpx = {
        name: parsedGpxs[0].name + " (combined)",
        type: parsedGpxs[0].type,
        points: parsedGpxs.flatMap((gpx) => gpx.points),
      };

      setGpx(joinedGpx);
    }
    readGpxFiles();
  }, [gpxFileUris]);

  if (!gpx) {
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>Loading...</Text>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }
  const titleText = `${gpx.name} (${gpx.type})`;

  // TODO: set up a units layer so that the user can choose between miles and km
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{titleText}</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: gpx.points[0].latlng[0],
          longitude: gpx.points[0].latlng[1],
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        <Marker
          coordinate={{
            latitude: gpx.points[0].latlng[0],
            longitude: gpx.points[0].latlng[1],
          }}
          title="Start"
          description="This is the start point"
        >
          <Text style={styles.markerText}>🟢</Text>
        </Marker>
        <Marker
          coordinate={{
            latitude: gpx.points[gpx.points.length - 1].latlng[0],
            longitude: gpx.points[gpx.points.length - 1].latlng[1],
          }}
          title="End"
          description="This is the end point"
        >
          <Text style={styles.markerText}>🏁</Text>
        </Marker>
        <Polyline
          coordinates={gpx.points.map((point) => ({
            latitude: point.latlng[0],
            longitude: point.latlng[1],
          }))}
          strokeColor={colors.primary}
          strokeWidth={5}
        />
      </MapView>
      <View style={styles.splitSliderContainer}>
        <Pressable
          onPress={async () => {
            try {
              const path = await writeFile(gpx);
              await Sharing.shareAsync(path, {
                mimeType: "application/gpx+xml",
                dialogTitle: "Share GPX File",
                UTI: "com.topografix.gpx",
              });
            } catch (e) {
              console.error(e);
              setError((e as Error).message);
            }
          }}
          style={styles.splitButton}
        >
          <Text style={styles.splitButtonText}>💾 EXPORT</Text>
        </Pressable>
      </View>
      <View style={styles.chartContainer}>
        <GpxChartingModule
          points={gpx.points}
          chartWidth={Dimensions.get("window").width - 4}
          chartHeight={200}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    color: colors.light,
    fontSize: 18,
  },
  errorText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 18,
  },
  markerText: {
    fontSize: 50,
  },
  splitMarkerText: {
    fontSize: 30,
    color: colors.light,
  },
  splitMarkerContainer: {
    alignItems: "center",
    position: "absolute",
    // positions the marker caret on the split point (hopefully works across devices?)
    right: -48,
    top: 0,
  },
  splitMarkerCaret: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: colors.dark,
  },
  splitMarkerBox: {
    backgroundColor: colors.dark,
    padding: 2,
    opacity: 0.8,
  },
  map: {
    width: "100%",
    height: "100%",
    flex: 8,
  },
  splitSliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  splitButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 14,
  },
  splitButtonText: {
    color: colors.light,
    fontSize: 24,
    fontFamily: "BebasNeue-Regular",
  },
  chartContainer: {
    flex: 5.6,
  },
});
