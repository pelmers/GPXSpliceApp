import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Pressable,
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

type Props = NativeStackScreenProps<RootStackParamList, "Combine (Strava)">;

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

export function StravaCombineActivitiesScreen({ navigation, route }: Props) {
  const { accessToken, athlete } = route.params;
  const [loadingInline, setLoadingInline] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<
    StravaActivity[]
  >([]);

  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [accessToken, page]);

  const loadActivities = async () => {
    setLoadingInline(true);
    setError(null);
    try {
      const newActivities = await fetchStravaActivities(accessToken, page);
      setActivities((prevActivities) => [...prevActivities, ...newActivities]);
      setLoadingInline(false);
    } catch (error) {
      console.error(error);
      setError((error as Error).message);
      setLoadingInline(false);
    }
  };

  const refreshActivities = async () => {
    setRefreshing(true);
    setPage(1);
    setActivities([]);
    await loadActivities();
    setRefreshing(false);
  };

  const fetchAllSelectedActivities = async () => {
    setLoadingModal(true);
    setError(null);
    try {
      const gpxFileUris = await Promise.all(
        selectedActivities.map(async (activity) => {
          const gpxContents = await fetchStravaActivityGpx(
            activity,
            accessToken,
          );
          if (FileSystem.cacheDirectory == null) {
            throw new Error("FileSystem.cacheDirectory is null");
          }
          const fileUri = `${FileSystem.cacheDirectory}/activity-${activity.id}.gpx`;
          await FileSystem.writeAsStringAsync(fileUri, gpxContents);
          return fileUri;
        }),
      );
      navigation.navigate("Combine Preview", {
        gpxFileUris,
        stravaAccessToken: accessToken,
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
      <View style={{ flexBasis: 75 }}>{displayAthlete(athlete)}</View>
      <View style={{ flexBasis: 25 }}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {!error && (
          <Text style={styles.instructionText}>Select multiple activities to combine</Text>
        )}
        {loadingInline && (
          <ActivityIndicator size="large" color={colors.secondary} />
        )}
      </View>
      <FlatList
        style={{ flexGrow: 1 }}
        data={activities}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item: activity }) => (
          <StravaActivityRow
            activity={activity}
            selected={selectedActivities.includes(activity)}
            onPress={(activity) => {
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
        )}
        onEndReached={() => setPage((prevPage) => prevPage + 1)}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={refreshActivities}
      />
      {selectedActivities.length >= 2 && (
        <Pressable
          style={styles.combineButton}
          onPress={fetchAllSelectedActivities}
        >
          <Text style={styles.combineButtonText}>COMBINE</Text>
        </Pressable>
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
    fontSize: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
  combineButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: colors.primary, // replace with your preferred color
    justifyContent: "center",
    alignItems: "center",
  },
  combineButtonText: {
    color: "white",
    fontFamily: "BebasNeue-Regular",
    fontSize: 36,
    fontWeight: "bold",
  },
});
