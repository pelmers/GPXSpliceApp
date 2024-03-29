import React, { useState, useEffect } from "react";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import FileSystem from "../utils/UniversalFileSystem";

import { RootStackParamList } from "../routes";
import { colors } from "../utils/colors";
import { GpxFile, gpxSummaryStats, parseGpxFile } from "../utils/gpx";
import { GpxChartingModule } from "../components/GpxChartingModule";
import { ActivityInfoFragment } from "../components/ActivityInfoFragment";
import { ExportButtonRow } from "../components/ExportButtonRow";

type Props = NativeStackScreenProps<RootStackParamList, "Post Split">;

export function PostSplitScreen({ navigation, route }: Props) {
  const { gpxFileUri, splitIndex } = route.params;

  // Actually do the split, first pop up a loading indicator
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gpxFiles, setGpxFiles] = useState<[GpxFile, GpxFile] | null>(null);

  useEffect(() => {
    async function splitGpxFile() {
      try {
        const fileContents = await FileSystem.readAsStringAsync(gpxFileUri);
        const parsedGpx = parseGpxFile(gpxFileUri, fileContents);
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
        // If the splitIndex was 0 or max, then throw an error
        if (file1.points.length === 0 || file2.points.length === 0) {
          throw new Error("Split index cannot be 0 or max");
        }
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

  if (loading && !gpxFiles) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  // For each file, show a summary of stats + a charting module + 2 buttons (share, upload)
  return (
    <ScrollView style={styles.container}>
      {gpxFiles &&
        gpxFiles.map((file, index) => {
          const stats = gpxSummaryStats(file.points);
          return (
            <View key={index}>
              <View style={styles.activityFragmentContainer}>
                <ActivityInfoFragment
                  stats={stats}
                  name={file.name}
                  isPrivate={false}
                  activityType={file.type}
                  textColor={colors.light}
                />
              </View>
              <GpxChartingModule
                gpxFile={file}
                chartWidth={Dimensions.get("screen").width - 4}
                chartHeight={180}
              />
              <ExportButtonRow gpx={file} onError={setError} />
              <View
                style={{
                  borderBottomColor: colors.light,
                  borderBottomWidth: 1,
                  opacity: 0.2,
                  marginHorizontal: 100,
                  marginVertical: 8,
                }}
              ></View>
            </View>
          );
        })}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  errorText: {
    color: "red",
    fontSize: 30,
    fontWeight: "bold",
    margin: 10,
  },
  activityFragmentContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    marginBottom: 5,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: colors.accent,
  },
  actionButtonsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "center",
  },
  exportButton: {
    backgroundColor: colors.accent,
    padding: 10,
    marginBottom: 10,
    width: 180,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  uploadButton: {
    backgroundColor: colors.strava,
    padding: 10,
    marginBottom: 10,
    marginLeft: 25,
    borderRadius: 5,
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 17,
  },
});
