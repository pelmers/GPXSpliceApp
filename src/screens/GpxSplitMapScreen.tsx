import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Alert,
  Text,
  ActivityIndicator,
} from "react-native";
import Slider from "@react-native-community/slider";

import * as FileSystem from "expo-file-system";

// For web, consider @teovilla/react-native-web-maps
// e.g. https://stackoverflow.com/a/76702937/2288934
import MapView from "react-native-maps";
import { Polyline, Marker } from "react-native-maps";

import { colors } from "../utils/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";
import { GpxPoint, parseGpxFile } from "../utils/gpx";

type Props = NativeStackScreenProps<RootStackParamList, "GpxSplitMap">;

// MapView usage docs: https://docs.expo.dev/versions/latest/sdk/map-view/

export function GpxSplitMapScreen({ navigation, route }: Props) {
  const [gpx, setGpx] = useState<{
    points: GpxPoint[];
    name: string;
    type: string;
  } | null>(null);
  const [sliderValue, setSliderValue] = useState(0);

  const { gpxFileUri, stravaAccessToken } = route.params;
  // Read the gpx file on mount
  useEffect(() => {
    async function readGpxFile() {
      const fileContents = await FileSystem.readAsStringAsync(gpxFileUri);
      setGpx(parseGpxFile(fileContents));
    }
    readGpxFile();
  }, [gpxFileUri]);

  if (!gpx) {
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>Loading...</Text>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }
  const titleText = `${gpx.name} (${gpx.type})`;
  const sliderIndex = Math.min(
    Math.floor(sliderValue * gpx.points.length),
    gpx.points.length - 1,
  );

  // TODO: compute cumulative distances and show that in the split marker
  // TODO: set up a units layer so that the user can choose between miles and km
  // TODO: show an elevation profile
  // TODO: show a speed profile (maybe with a switch between them to save space)
  // TODO: show a heartrate profile if the data is available
  // charting library: https://github.com/coinjar/react-native-wagmi-charts
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{titleText}</Text>
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
        <Marker
          coordinate={{
            latitude: gpx.points[sliderIndex].latlng[0],
            longitude: gpx.points[sliderIndex].latlng[1],
          }}
          title="Split"
          description="This is the split point"
        >
          <Text style={styles.splitMarkerText}>
            {(100 * sliderValue).toFixed(1) + "%"}
          </Text>
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
        <Slider
          style={{ flex: 5, marginHorizontal: 14 }}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor={colors.light}
          maximumTrackTintColor={colors.accent}
          onValueChange={(value) => setSliderValue(value)}
        />
        <Pressable
          onPress={() => {
            // TODO: navigate to the post split screen, sending the split file + split index + strava token as prop
            // TODO: the post split screen will show the 2 activities each with a summary and each has a button to save or upload to strava (which will have private/public checkbox)
            console.log("Split button pressed")}}
          style={styles.splitButton}
        >
          <Text style={styles.splitButtonText}>SPLIT</Text>
        </Pressable>
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
  markerText: {
    fontSize: 50,
  },
  splitMarkerText: {
    fontSize: 30,
    color: colors.light,
    marginTop: 50,
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
});
