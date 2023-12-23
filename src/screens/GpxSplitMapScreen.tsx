import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Alert, Text } from "react-native";

import * as FileSystem from "expo-file-system";
import MapView from "react-native-maps";
import { Polyline } from "react-native-maps";

import { colors } from "../utils/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";
import { LoadingModal } from "../components/LoadingModal";
import { GpxPoint, parseGpxFile } from "../utils/gpx";

type Props = NativeStackScreenProps<RootStackParamList, "GpxSplitMap">;

export function GpxSplitMapScreen({ navigation, route }: Props) {
  const [loadingModal, setLoadingModal] = useState(false);
  const [gpx, setGpx] = useState<{
    points: GpxPoint[];
    name: string;
    type: string;
  } | null>(null);

  const { gpxFileUri } = route.params;
  // Read the gpx file on mount
  useEffect(() => {
    async function readGpxFile() {
      try {
        setLoadingModal(true);
        const fileContents = await FileSystem.readAsStringAsync(gpxFileUri);
        setGpx(parseGpxFile(fileContents));
      } finally {
        setLoadingModal(false);
      }
    }
    readGpxFile();
  }, [gpxFileUri]);

  return (
    <View style={styles.container}>
      <LoadingModal visible={loadingModal} />
      <Text style={styles.text}>{"TODO " + gpxFileUri}</Text>
      {gpx && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: gpx?.points[0]?.latlng![0],
            longitude: gpx?.points[0]?.latlng![1],
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          <Polyline
            coordinates={gpx.points.map((point) => ({
              latitude: point.latlng![0],
              longitude: point.latlng![1],
            }))}
            strokeColor={colors.accent}
            strokeWidth={3}
          />
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.primary,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
