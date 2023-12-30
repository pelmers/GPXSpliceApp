import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  Dimensions,
  TouchableHighlight,
} from "react-native";
import Slider from "@react-native-community/slider";

// For web, consider @teovilla/react-native-web-maps
// e.g. https://stackoverflow.com/a/76702937/2288934
import MapView from "react-native-maps";
import { Polyline, Marker } from "react-native-maps";

import { colors } from "../utils/colors";
import { GpxFile, calculateCumulativeDistance } from "../utils/gpx";
import { GpxChartingModule } from "./GpxChartingModule";

type Props = {
  gpx: GpxFile;
  showSlider: boolean;
  pressableLabel: string;
  onPressablePress: (sliderIndex: number) => unknown;
};

// MapView usage docs: https://docs.expo.dev/versions/latest/sdk/map-view/

export function GpxMapView({
  gpx,
  showSlider,
  pressableLabel,
  onPressablePress,
}: Props) {
  const [sliderValue, setSliderValue] = useState(0);
  const [distances, setDistances] = useState<number[]>([]);

  // Set distances on mount
  useEffect(() => {
    setDistances(calculateCumulativeDistance(gpx.points));
  }, [gpx]);

  const titleText = `${gpx.name} (${gpx.type})`;
  const sliderIndex = Math.min(
    Math.floor(sliderValue * gpx.points.length),
    gpx.points.length - 1,
  );
  const splitData =
    distances.length > 0 && showSlider
      ? {
          index: sliderIndex,
          cumulativeDistances: distances,
        }
      : undefined;

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
        {showSlider && (
          <Marker
            coordinate={{
              latitude: gpx.points[sliderIndex].latlng[0],
              longitude: gpx.points[sliderIndex].latlng[1],
            }}
            title="Split"
            description="This is the split point"
          >
            <Text style={styles.markerText}>⭐️</Text>
          </Marker>
        )}
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
        {showSlider && (
          <Slider
            style={{ flex: 5, marginHorizontal: 14 }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor={colors.light}
            maximumTrackTintColor={colors.accent}
            onValueChange={(value) => setSliderValue(value)}
          />
        )}
        <TouchableHighlight
          underlayColor={colors.primary}
          onPress={async () => {
            await onPressablePress(sliderIndex);
          }}
          style={styles.splitButton}
        >
          <Text style={styles.splitButtonText}>{pressableLabel}</Text>
        </TouchableHighlight>
      </View>
      <View style={styles.chartContainer}>
        <GpxChartingModule
          gpxFile={gpx}
          chartWidth={Dimensions.get("window").width - 4}
          chartHeight={200}
          splitData={splitData}
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
  markerText: {
    fontSize: 40,
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
