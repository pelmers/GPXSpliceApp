import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";

import * as FileSystem from "expo-file-system";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../routes";
import { fetchStravaActivityGpx } from "../types/strava";
import { LoadingModal } from "../components/LoadingModal";
import { UnifiedStravaActivityListView } from "../components/UnifiedStravaActivityListView";

type Props = NativeStackScreenProps<RootStackParamList, "Split (Strava)">;

export function StravaSplitActivitiesScreen({ navigation, route }: Props) {
  const { accessToken, athlete } = route.params;
  const [loadingModal, setLoadingModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <LoadingModal visible={loadingModal} />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <UnifiedStravaActivityListView
        accessToken={accessToken}
        athlete={athlete}
        instructionText="Press an activity to split"
        onActivityPress={async (activity) => {
          setLoadingModal(true);
          setError(null);
          try {
            const gpxContents = await fetchStravaActivityGpx(
              activity,
              accessToken,
            );
            if (FileSystem.cacheDirectory == null) {
              throw new Error("FileSystem.cacheDirectory is null");
            }
            const fileUri = `${FileSystem.cacheDirectory}/activity-${activity.id}.gpx`;
            await FileSystem.writeAsStringAsync(fileUri, gpxContents);
            navigation.navigate("Split Map", {
              gpxFileUri: fileUri,
              stravaAccessToken: accessToken,
            });
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setLoadingModal(false);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  errorText: {
    color: "red",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
});
