import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  ActivityIndicator,
  FlatList,
} from "react-native";

import { colors } from "../utils/colors";
import {
  StravaActivity,
  StravaAthlete,
  fetchStravaActivities,
} from "../types/strava";
import { StravaActivityRow } from "./StravaActivityRow";

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

type Props = {
  accessToken: string;
  athlete: StravaAthlete;
  onActivityPress: (activity: StravaActivity) => void;
  instructionText: string;
  selectedActivities?: StravaActivity[];
};

export function StravaActivityList(props: Props) {
  const {
    accessToken,
    athlete,
    onActivityPress,
    selectedActivities,
    instructionText,
  } = props;
  const [loadingInline, setLoadingInline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);

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

  return (
    <>
      <View style={{ flexBasis: 75 }}>{displayAthlete(athlete)}</View>
      <View style={{ flexBasis: 25 }}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {!error && (
          <Text style={styles.instructionText}>{instructionText}</Text>
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
            selected={(selectedActivities || []).includes(activity)}
            onPress={(activity) => {
              onActivityPress(activity);
            }}
          />
        )}
        onEndReached={() => setPage((prevPage) => prevPage + 1)}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={refreshActivities}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
});
