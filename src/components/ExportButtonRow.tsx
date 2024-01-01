import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  ActivityIndicator,
  Image,
} from "react-native";

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { colors } from "../utils/colors";
import { GpxFile, offsetAllTimes, pointsToGpx } from "../utils/gpx";
import { useStravaToken } from "../providers/StravaTokenProvider";
import { uploadActivity } from "../types/strava";
import { Linking } from "react-native";

type Props = {
  gpx: GpxFile;
  onError: (error: string) => void;
};

async function writeFile(file: GpxFile): Promise<string> {
  const serializedGpxFileString = pointsToGpx(file);
  const path = `${FileSystem.documentDirectory}${encodeURIComponent(
    file.name,
  )}.gpx`;
  await FileSystem.writeAsStringAsync(path, serializedGpxFileString);
  return path;
}

const buttonFontSize = 24;

export function ExportButtonRow(props: Props) {
  const { stravaToken } = useStravaToken();
  const { gpx, onError } = props;
  const [activityId, setActivityId] = useState<number | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [loadingStrava, setLoadingStrava] = useState(false);

  const withLoadingState =
    (
      setter: React.Dispatch<React.SetStateAction<boolean>>,
      fn: () => Promise<void>,
    ) =>
    async () => {
      try {
        setter(true);
        await fn();
      } finally {
        setter(false);
      }
    };

  const handleExportButton = withLoadingState(setLoadingFile, async () => {
    try {
      const path = await writeFile(gpx);
      await Sharing.shareAsync(path, {
        mimeType: "application/gpx+xml",
        dialogTitle: "Share GPX File",
        UTI: "com.topografix.gpx",
      });
    } catch (e) {
      console.error(e);
      onError((e as Error).message);
    }
  });

  const handleStravaButton = withLoadingState(setLoadingStrava, async () => {
    if (activityId) {
      const url = `https://www.strava.com/activities/${activityId}`;
      Linking.openURL(url);
    } else {
      try {
        // Strava detects duplicate activities based on start time within 30 seconds.
        // so we offset by exactly 30.001 seconds to avoid this, otherwise uploading combined
        // activities and the first part of a split activity will not work.
        const uploadResponse = await uploadActivity(
          stravaToken!.accessToken,
          offsetAllTimes(gpx, 30 * 1000 + 1),
        );
        setActivityId(uploadResponse.activity_id);
      } catch (e) {
        console.error(e);
        onError((e as Error).message);
      }
    }
  });

  return (
    <View style={styles.buttonRow}>
      <TouchableHighlight
        underlayColor={colors.primary}
        onPress={handleExportButton}
        style={styles.button}
      >
        {loadingFile ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>💾 SHARE FILE</Text>
        )}
      </TouchableHighlight>
      {stravaToken && (
        <TouchableHighlight
          underlayColor={colors.primary}
          onPress={handleStravaButton}
          style={[styles.button, { backgroundColor: colors.strava }]}
        >
          {loadingStrava ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../assets/strava_icon.png")}
                style={{
                  width: buttonFontSize + 4,
                  height: buttonFontSize + 4,
                  marginRight: 5,
                }}
                resizeMode="contain"
              />
              <Text style={[styles.buttonText, { color: "white" }]}>
                {activityId ? "VIEW" : "UPLOAD"}
              </Text>
            </View>
          )}
        </TouchableHighlight>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  button: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
  },
  buttonText: {
    fontFamily: "BebasNeue-Regular",
    fontSize: buttonFontSize,
    color: colors.light,
  },
});
