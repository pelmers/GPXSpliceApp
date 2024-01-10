import React from "react";
import {
  Text,
  ScrollView,
  Linking,
  TouchableHighlight,
  StyleSheet,
  Platform,
} from "react-native";

import Constants from "expo-constants";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../routes";
import { colors } from "../utils/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Info">;

function getStoreUrl() {
  if (Platform.OS === "ios") {
    return "https://apps.apple.com/app/gpxsplice/id6475313748";
  } else {
    return "https://play.google.com/store/apps/details?id=com.pelmers.gpxsplice";
  }
  // TODO: add a url for the web version
}

export function InfoScreen({ navigation }: Props) {
  const appName = Constants.expoConfig?.name || "GPX Splice";
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const reviewUrl = getStoreUrl();

  const issueUrl = "https://github.com/pelmers/GPXSpliceApp/issues";
  const sourceUrl = "https://github.com/pelmers/GPXSpliceApp";
  const authorName = "Peter Elmers";
  const authorWebsite = "https://pelmers.com";
  // Very slightly obfuscated to avoid spam since this is open source
  const authorEmail = ["peter", "pelmers.com"].join("@");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
    >
      <Text style={styles.title}>
        {appName} v{appVersion}
      </Text>
      <TouchableHighlight
        style={styles.linkContainer}
        underlayColor={colors.tertiary}
        onPress={() => Linking.openURL(reviewUrl)}
      >
        <Text style={styles.link}>📱 View in Store</Text>
      </TouchableHighlight>
      <TouchableHighlight
        style={styles.linkContainer}
        underlayColor={colors.tertiary}
        onPress={() => Linking.openURL(issueUrl)}
      >
        <Text style={styles.link}>🐞 Report Issue</Text>
      </TouchableHighlight>
      <TouchableHighlight
        style={styles.linkContainer}
        underlayColor={colors.tertiary}
        onPress={() => Linking.openURL(sourceUrl)}
      >
        <Text style={styles.link}>💿 View Source</Text>
      </TouchableHighlight>
      <Text style={styles.author}>About the Author</Text>
      <Text style={styles.authorName}>{authorName}</Text>
      <TouchableHighlight
        style={styles.linkContainer}
        underlayColor={colors.tertiary}
        onPress={() => Linking.openURL(authorWebsite)}
      >
        <Text style={styles.link}>🌐 Visit Website</Text>
      </TouchableHighlight>
      <TouchableHighlight
        style={styles.linkContainer}
        underlayColor={colors.tertiary}
        onPress={() => Linking.openURL(`mailto:${authorEmail}`)}
      >
        <Text style={styles.link}>✉️ Contact</Text>
      </TouchableHighlight>
      <Text style={styles.thankYouMessage}>
        Thank you for using {appName}! Your support and feedback help me make
        the app better for everyone.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: colors.dark,
  },
  containerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  thankYouMessage: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.light,
    textAlign: "left",
    marginTop: 24,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 42,
    fontFamily: "BebasNeue-Regular",
    fontWeight: "bold",
    color: colors.light,
  },
  linkContainer: {
    marginTop: 20,
    backgroundColor: colors.accent,
    width: 180,
    height: 45,
    justifyContent: "center",
    borderRadius: 10,
  },
  link: {
    color: "white",
    padding: 10,
    paddingLeft: 20,
    textAlign: "left",
    fontSize: 16,
  },
  author: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 40,
    color: colors.primary,
  },
  authorName: {
    marginTop: 10,
    color: colors.light,
    fontFamily: "BebasNeue-Regular",
    fontSize: 32,
  },
});
