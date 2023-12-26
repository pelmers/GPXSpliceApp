import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Alert,
  Image,
  Modal,
  Text,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as AuthSession from "expo-auth-session";

import { colors } from "../utils/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";
import {
  StravaActivity,
  StravaAthlete,
  fetchStravaActivities,
  fetchStravaActivityGpx,
} from "../types/strava";
import { StravaActivityRow } from "../components/StravaActivityRow";
import { LoadingModal } from "../components/LoadingModal";

type Props = NativeStackScreenProps<RootStackParamList, "StravaActivities">;

function displayAthlete(athlete: StravaAthlete) {
  // Render a banner that shows information about the logged in athlete
  // On the left a profile picture, on the right two lines: name and location
  const name = athlete.firstname + " " + athlete.lastname;
  const location = athlete.city + ", " + athlete.country;
  const profile = athlete.profile;
  return (
    <View style={styles.athleteInfoContainer}>
      <Image
        style={{ width: 60, height: 60, marginLeft: 10, marginRight: 15 }}
        source={{
          uri: profile,
        }}
      />
      <View>
        <Text style={styles.athleteNameText}>{name}</Text>
        <Text style={styles.athleteLocationText}>{location}</Text>
      </View>
    </View>
  );
}

export function StravaActivitiesScreen({ navigation, route }: Props) {
  const { accessToken, mode, athlete } = route.params;
  const [loadingInline, setLoadingInline] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);

  useEffect(() => {
    setLoadingInline(true);
    setError(null);
    fetchStravaActivities(accessToken)
      .then((activities) => {
        setActivities(activities);
        setLoadingInline(false);
      })
      .catch((error) => {
        console.error(error);
        setError((error as Error).message);
        setLoadingInline(false);
      });
  }, [accessToken]);

  // TODO: paginate when scrolling to bottom of list
  // TODO: implement drag up to refresh
  // TODO: look at this query library? tanstack/use-query, e.g. https://github.com/TanStack/query/discussions/1275
  return (
    <View style={styles.container}>
      <LoadingModal visible={loadingModal} />
      <View style={{ flexBasis: 75 }}>{displayAthlete(athlete)}</View>
      <View style={{ flexBasis: 25 }}>
        <Text style={styles.instructionText}>Select an activity to split</Text>
      </View>
      <ScrollView style={{ flexGrow: 1 }}>
        {activities.map((activity, index) => (
          <StravaActivityRow
            key={index}
            activity={activity}
            onPress={async (activity) => {
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
                // navigate to next screen
                navigation.navigate("GpxSplitMap", { gpxFileUri: fileUri, stravaAccessToken: accessToken });
              } catch (e) {
                setError((e as Error).message);
                console.error(e);
              } finally {
                setLoadingModal(false);
              }
            }}
          />
        ))}
        {loadingInline && <ActivityIndicator size="large" />}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  athleteInfoContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  athleteNameText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  athleteLocationText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  instructionText: {
    fontSize: 15,
    textAlign: "center",
    fontStyle: "italic",
    color: colors.accent,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});
