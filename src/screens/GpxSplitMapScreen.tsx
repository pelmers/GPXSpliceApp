import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Alert, Text } from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as AuthSession from "expo-auth-session";

import { colors } from "../colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";

type Props = NativeStackScreenProps<RootStackParamList, "GpxSplitMap">;

export function GpxSplitMapScreen({ navigation, route }: Props) {
  const { gpxFileUri } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{"TODO " + gpxFileUri}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.primary,
  },
});
