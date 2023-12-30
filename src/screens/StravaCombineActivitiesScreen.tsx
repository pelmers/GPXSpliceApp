import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TouchableHighlight,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { colors } from "../utils/colors";
import { RootStackParamList } from "../routes";
import { StravaActivity, fetchStravaActivityGpxToDisk } from "../types/strava";
import { LoadingModal } from "../components/LoadingModal";
import { StravaActivityList } from "../components/StravaActivityList";

type Props = NativeStackScreenProps<RootStackParamList, "Combine (Strava)">;

export function StravaCombineActivitiesScreen({ navigation, route }: Props) {
  const { accessToken, athlete } = route.params;
  const [loadingModal, setLoadingModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<
    StravaActivity[]
  >([]);

  const fetchAllSelectedActivities = async () => {
    setLoadingModal(true);
    setError(null);
    try {
      const gpxFileUris = await Promise.all(
        selectedActivities.map((activity) =>
          fetchStravaActivityGpxToDisk(activity, accessToken),
        ),
      );
      navigation.navigate("Combine Preview", {
        gpxFileUris,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingModal(false);
    }
  };

  return (
    <View style={styles.container}>
      <LoadingModal visible={loadingModal} />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <StravaActivityList
        athlete={athlete}
        accessToken={accessToken}
        selectedActivities={selectedActivities}
        instructionText={"Select multiple activities to combine"}
        onActivityPress={(activity) => {
          // Append to selected list, or remove if already selected
          if (selectedActivities.includes(activity)) {
            setSelectedActivities((prevActivities) =>
              prevActivities.filter(
                (prevActivity) => prevActivity !== activity,
              ),
            );
          } else {
            setSelectedActivities((prevActivities) => [
              ...prevActivities,
              activity,
            ]);
          }
        }}
      />
      {selectedActivities.length >= 2 && (
        <TouchableHighlight
          underlayColor={colors.primary}
          style={styles.combineButton}
          onPress={fetchAllSelectedActivities}
        >
          <Text style={styles.combineButtonText}>COMBINE 👟</Text>
        </TouchableHighlight>
      )}
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
  combineButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    height: 65,
    backgroundColor: colors.primary,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  combineButtonText: {
    color: "white",
    fontFamily: "BebasNeue-Regular",
    fontSize: 40,
    fontWeight: "bold",
  },
});
