import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Alert,
  Text,
  ActivityIndicator,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as AuthSession from "expo-auth-session";

import { colors } from "../colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";

type Props = NativeStackScreenProps<RootStackParamList, "StravaActivities">;

// refer to https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
type StravaActivity = { id: number } & Partial<{
  name: string;
  distance: number; // in meters
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number; // in meters
  type: string;
  sport_type: string;
  kudos_count: number;
  comment_count: number;
  private: boolean;
  average_speed: number; // in meters per second
  max_speed: number;
  location_city: string;
  location_state: string;
  location_country: string;
}>;

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
  console.log("fetchStravaActivities", json);
  // if error in json, throw an error
    if (json.errors != null) {
        throw new Error(json.errors[0].message);
    }
  return json;
}

function displayActivity(activity: StravaActivity) {
  return (
    <View>
      <Text>{activity.name}</Text>
      <Text>TODO: show other fields</Text>
    </View>
  );
}

export function StravaActivitiesScreen({ navigation, route }: Props) {
  const { accessToken, mode } = route.params;
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
    <View>
      <Text>TODO StravaActivitiesScreen</Text>
      {activities.map(displayActivity)}
      {loading && <ActivityIndicator size="large" />}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    marginTop: 10,
  },
});
