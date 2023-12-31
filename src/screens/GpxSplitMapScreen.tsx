import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";

import * as FileSystem from "expo-file-system";

// For web, consider @teovilla/react-native-web-maps
// e.g. https://stackoverflow.com/a/76702937/2288934

import { colors } from "../utils/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";
import { GpxFile, parseGpxFile } from "../utils/gpx";
import { GpxMapView } from "../components/GpxMapView";

type Props = NativeStackScreenProps<RootStackParamList, "Split Map">;

// MapView usage docs: https://docs.expo.dev/versions/latest/sdk/map-view/

export function GpxSplitMapScreen({ navigation, route }: Props) {
  const [gpx, setGpx] = useState<GpxFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { gpxFileUri } = route.params;
  // Read the gpx file on mount
  useEffect(() => {
    async function readGpxFile() {
      const fileContents = await FileSystem.readAsStringAsync(gpxFileUri);
      const parsedGpx = parseGpxFile(fileContents);
      setGpx(parsedGpx);
    }
    readGpxFile().catch((e) => {
      setError(e.message);
    });
  }, [gpxFileUri]);

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

  // TODO let the user set multiple split points (and then add an undo button i guess)
  return (
    <GpxMapView
      gpx={gpx}
      sliderOptions={{
        onSplitPress: (sliderIndex) => {
          navigation.navigate("Post Split", {
            gpxFileUri,
            splitIndex: sliderIndex,
          });
        },
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
