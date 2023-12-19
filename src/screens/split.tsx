import React from "react";
import { StyleSheet, View, Pressable, Alert, Text } from "react-native";

import { ResizeMode, Video } from "expo-av";

import { colors } from "../colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";
import { BlurView } from "expo-blur";

type Props = NativeStackScreenProps<RootStackParamList, "Split">;

export function SplitScreen({ navigation }: Props) {
  return (
    <View>
      <Text>
        TODO: select a gpx file or connect to a strava activity, then navigate
        to a map screen
      </Text>
      <Text>TODO: so create 2 buttons</Text>
    </View>
  );
}
