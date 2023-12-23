import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Alert,
  Image,
  Text,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as AuthSession from "expo-auth-session";

import { colors } from "../colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";
import { StravaActivity, StravaAthlete } from "../types/strava";
import { StravaActivityRow } from "../components/StravaActivityRow";

type Props = NativeStackScreenProps<RootStackParamList, "StravaActivities">;

async function fetchStravaActivities(
  accessToken: string,
  page: number = 1,
): Promise<StravaActivity[]> {
  const response = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?page=${page}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const json = await response.json();
  // if error in json, throw an error
  if (json.errors != null) {
    throw new Error(json.errors[0].message);
  }
  return json;
}


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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchStravaActivities(accessToken)
      .then((activities) => {
        setActivities(activities);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError((error as Error).message);
        setLoading(false);
      });
  }, [accessToken]);

  return (
    <View style={styles.container}>
      <View style={{ flexBasis: 75 }}>{displayAthlete(athlete)}</View>
      <View style={{ flexBasis: 25 }}>
        <Text style={styles.instructionText}>Select an activity to split</Text>
      </View>
      <ScrollView style={{ flexGrow: 1 }}>
        {activities.map(
          (activity, index) => <StravaActivityRow key={index}
          activity={activity}
          onPress={(activity) => {console.log(activity);}}
          />)}
        {loading && <ActivityIndicator size="large" />}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </View>
  );
}

// TODO: pretty colors and styles
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
