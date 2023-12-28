import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

// For web, consider @teovilla/react-native-web-maps
// e.g. https://stackoverflow.com/a/76702937/2288934

import { colors } from "../utils/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";
import { GpxFile, parseGpxFile, pointsToGpx } from "../utils/gpx";
import { GpxMapView } from "../components/GpxMapView";
import { successToast } from "../utils/toast";

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
    readGpxFiles().catch((e) => {
      setError((e as Error).message);
    });
  }, [gpxFileUris]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>Error!</Text>
        <Text style={[styles.titleText, { color: "red" }]}>{error}</Text>
      </View>
    );
  }

  if (!gpx) {
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>Loading...</Text>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <GpxMapView
      gpx={gpx}
      showSlider={false}
      pressableLabel="💾 EXPORT"
      onPressablePress={async () => {
        try {
          const path = await writeFile(gpx);
          await Sharing.shareAsync(path, {
            mimeType: "application/gpx+xml",
            dialogTitle: "Share GPX File",
            UTI: "com.topografix.gpx",
          });
          successToast(`Exported ${gpx.name}`);
        } catch (e) {
          console.error(e);
          setError((e as Error).message);
        }
      }}
    />
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
});
