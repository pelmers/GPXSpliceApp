import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../routes";
import { fetchStravaActivityGpxToDisk } from "../types/strava";
import { LoadingModal } from "../components/LoadingModal";
import { StravaActivityList } from "../components/StravaActivityList";
import { useStravaToken } from "../providers/StravaTokenProvider";

type Props = NativeStackScreenProps<RootStackParamList, "Split (Strava)">;

export function StravaSplitActivitiesScreen({ navigation, route }: Props) {
  const [loadingModal, setLoadingModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <LoadingModal visible={loadingModal} />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <StravaActivityList
        instructionText="Press an activity to split"
        onActivityPress={async (activity, accessToken) => {
          setLoadingModal(true);
          setError(null);
          try {
            if (accessToken === null) {
              throw new Error("No Strava access token to download activity");
            }
            navigation.navigate("Split Map", {
              gpxFileUri: await fetchStravaActivityGpxToDisk(
                activity,
                accessToken,
              ),
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
