import React, { useState, useEffect } from "react";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  StyleSheet,
  View,
  Text,
  Button,
  ActivityIndicator,
  Dimensions,
  Share,
  Alert,
  ScrollView,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { RootStackParamList } from "../routes";
import { colors } from "../utils/colors";
import {
  GpxFile,
  gpxSummaryStats,
  parseGpxFile,
  pointsToGpx,
} from "../utils/gpx";
import { GpxChartingModule } from "../components/GpxChartingModule";
import humanizeDuration from "humanize-duration";

// TODO this screen will receive the gpx file path, split index, and optional strava token as props
// TODO load the file, do the split, and show stats for the two activities
// TODO stats include distance, avg speed, time, elevation gain
// TODO ideally also show graphs for each one
// TODO then a "share" button on each one to export to file or upload to strava directly

type Props = NativeStackScreenProps<RootStackParamList, "Post Split">;

export function PostSplitScreen({ navigation, route }: Props) {
  const { gpxFileUri, splitIndex, stravaAccessToken } = route.params;

  // Actually do the split, first pop up a loading indicator
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gpxFiles, setGpxFiles] = useState<[GpxFile, GpxFile] | null>(null);

  useEffect(() => {
    async function splitGpxFile() {
      try {
        const fileContents = await FileSystem.readAsStringAsync(gpxFileUri);
        const parsedGpx = parseGpxFile(fileContents);
        const file1 = {
          name: parsedGpx.name + " (1-2)",
          type: parsedGpx.type,
          points: parsedGpx.points.slice(0, splitIndex),
        };
        const file2 = {
          name: parsedGpx.name + " (2-2)",
          type: parsedGpx.type,
          points: parsedGpx.points.slice(splitIndex),
        };
        setGpxFiles([file1, file2]);
      } catch (e) {
        console.error(e);
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    splitGpxFile();
  }, [gpxFileUri, splitIndex]);

  if (loading || !gpxFiles) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  // For each file, show a summary of stats + a charting module + 2 buttons (share, upload)
  return (
    <ScrollView>
      {gpxFiles.map((file, index) => {
        const stats = gpxSummaryStats(file.points);
        return (
          <View key={index}>
            <Text>{file.name}</Text>
            <Text>{`Total distance: ${stats.distance} km`}</Text>
            {stats.duration && (
              <Text>{`Total time: ${humanizeDuration(stats.duration)}`}</Text>
            )}
            {stats.averageSpeed && (
              <Text>{`Avg. speed: ${stats.averageSpeed} kph`}</Text>
            )}
            {stats.averageHeartRate && (
              <Text>{`Avg. heart rate: ${stats.averageHeartRate}`}</Text>
            )}
            {stats.averageCadence && (
              <Text>{`Avg. cadence: ${stats.averageCadence}`}</Text>
            )}
            {stats.averagePower && (
              <Text>{`Avg. power: ${stats.averagePower}`}</Text>
            )}
            <GpxChartingModule
              points={file.points}
              chartWidth={Dimensions.get("screen").width}
              chartHeight={180}
            />
            <Button
              title="Share"
              onPress={async () => {
                try {
                  const serializedGpxFileString = pointsToGpx(file);
                  const path = `${
                    FileSystem.documentDirectory
                  }${encodeURIComponent(file.name)}.gpx`;
                  await FileSystem.writeAsStringAsync(
                    path,
                    serializedGpxFileString,
                  );
                  console.log(`Sharing ${path}`);
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
            />
            <Button
              title="Upload"
              onPress={() => {
                // TODO: Implement upload functionality
                console.log(`Uploading ${file.name}`);
                Alert.alert("Not implemented yet");
              }}
            />
          </View>
        );
      })}
      {error && <Text>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    alignItems: "center",
    justifyContent: "center",
  },
});
