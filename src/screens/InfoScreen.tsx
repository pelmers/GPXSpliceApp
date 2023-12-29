import React from "react";
import {
  View,
  Text,
  ScrollView,
  Linking,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import Constants from "expo-constants";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../routes";
import { colors } from "../utils/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Info">;

export function InfoScreen({ navigation }: Props) {
  const appName = Constants.expoConfig?.name || 'GPX Splice';
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  // TODO update this URL when the app is published
  const reviewUrl = "https://app-review-url";

  const issueUrl = "https://github.com/pelmers/GPXSpliceApp/issues";
  const authorName = "Peter Elmers";
  const authorWebsite = "https://pelmers.com";
  const authorEmail = "peter@pelmers.com";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {appName} v{appVersion}
      </Text>
      <TouchableOpacity onPress={() => Linking.openURL(reviewUrl)}>
        <Text style={styles.link}>Leave a Review</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL(issueUrl)}>
        <Text style={styles.link}>Report an Issue</Text>
      </TouchableOpacity>
      <Text style={styles.author}>Author</Text>
      <Text style={styles.authorName}>{authorName}</Text>
      <TouchableOpacity onPress={() => Linking.openURL(authorWebsite)}>
        <Text style={styles.link}>Visit Website</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => Linking.openURL(`mailto:${authorEmail}`)}
      >
        <Text style={styles.link}>Contact (email)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: colors.dark,
  },
  title: {
    fontSize: 42,
    fontFamily: "BebasNeue-Regular",
    fontWeight: "bold",
    color: colors.primary,
  },
  link: {
    marginTop: 20,
    color: 'white',
    backgroundColor: colors.accent,
    width: 150,
    padding: 10,
    justifyContent: "center",
    textAlign: "center",
  },
  author: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 40,
    color: colors.light,
  },
  authorName: {
    marginTop: 10,
    color: colors.light,
    fontFamily: "BebasNeue-Regular",
    fontSize: 30,
  },
});
