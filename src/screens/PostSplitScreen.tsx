import React, { useState, useEffect } from "react";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  Pressable,
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
import { ActivityInfoFragment } from "../components/ActivityInfoFragment";

type Props = NativeStackScreenProps<RootStackParamList, "Post Split">;

async function writeFile(file: GpxFile): Promise<string> {
  const serializedGpxFileString = pointsToGpx(file);
  const path = `${FileSystem.documentDirectory}${encodeURIComponent(
    file.name,
  )}.gpx`;
  await FileSystem.writeAsStringAsync(path, serializedGpxFileString);
  return path;
}

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
    <ScrollView>
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
                />
              </View>
              <GpxChartingModule
                points={file.points}
                chartWidth={Dimensions.get("screen").width - 4}
                chartHeight={180}
              />
              <View style={styles.actionButtonsContainer}>
                <Pressable
                  style={styles.exportButton}
                  onPress={async () => {
                    try {
                      const path = await writeFile(file);
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
                >
                  <Text style={styles.buttonText}>💾 Export</Text>
                </Pressable>

                {/* <Pressable
                  style={styles.uploadButton}
                  onPress={() => {
                    // TODO: Implement upload functionality
                    console.log(`Uploading ${file.name}`);
                    Alert.alert("Not implemented yet");
                  }}
                >
                  <Text style={styles.buttonText}>⬆️ Upload</Text>
                </Pressable> */}
              </View>
              <View
                style={{
                  borderBottomColor: colors.light,
                  borderBottomWidth: 1,
                  opacity: 0.2,
                  marginHorizontal: 100,
                }}
              ></View>
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
  activityFragmentContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    marginBottom: 5,
    paddingHorizontal: 15,
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
    // marginRight: 25,
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
    color: "white",
    fontSize: 16,
  },
});
