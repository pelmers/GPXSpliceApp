import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableHighlight } from "react-native";

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

// For web, consider @teovilla/react-native-web-maps
// e.g. https://stackoverflow.com/a/76702937/2288934

import { colors } from "../utils/colors";
import { GpxFile, pointsToGpx } from "../utils/gpx";
import { useStravaToken } from "../providers/StravaTokenProvider";
import { StravaUploadResult, uploadActivity } from "../types/strava";

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

export function ExportButtonRow(props: Props) {
  const { stravaToken } = useStravaToken();
  const { gpx, onError } = props;

  return (
    <View style={styles.buttonRow}>
      <TouchableHighlight
        underlayColor={colors.primary}
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
            onError((e as Error).message);
          }
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>💾 SHARE FILE</Text>
      </TouchableHighlight>
      {stravaToken && (
        <TouchableHighlight
          underlayColor={colors.primary}
          onPress={async () => {
            try {
              const uploadResponse = await uploadActivity(
                stravaToken.accessToken,
                gpx,
              );
              uploadResponse.activity_id;
            } catch (e) {
              console.error(e);
              onError((e as Error).message);
            }
          }}
          style={[styles.button, { backgroundColor: colors.strava }]}
        >
          <Text style={[styles.buttonText, { color: "white" }]}>
            ☁️ UPLOAD STRAVA
          </Text>
        </TouchableHighlight>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    fontFamily: "BebasNeue-Regular",
    fontSize: 24,
    color: colors.light,
  },
});
