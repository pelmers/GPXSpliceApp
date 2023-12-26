import React, { useState, useEffect } from "react";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../routes";
import { View, Text } from "react-native";

// TODO this screen will receive the gpx file path, split index, and optional strava token as props
// TODO load the file, do the split, and show stats for the two activities
// TODO stats include distance, avg speed, time, elevation gain
// TODO ideally also show graphs for each one
// TODO then a "share" button on each one to export to file or upload to strava directly

type Props = NativeStackScreenProps<RootStackParamList, "Post Split">;

export function PostSplitScreen({ navigation, route }: Props) {
  const { gpxFileUri, splitIndex, stravaAccessToken } = route.params;

  return (
    <View>
      <Text>TODO</Text>
    </View>
  );
}
