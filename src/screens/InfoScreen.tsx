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
}

export function InfoScreen({ navigation }: Props) {
  const appName = Constants.expoConfig?.name || "GPX Splice";
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const reviewUrl = getStoreUrl();

  const issueUrl = "https://github.com/pelmers/GPXSpliceApp/issues";
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
        <Text style={styles.link}>View in Store</Text>
      </TouchableHighlight>
      <TouchableHighlight
        style={styles.linkContainer}
        underlayColor={colors.tertiary}
        onPress={() => Linking.openURL(issueUrl)}
      >
        <Text style={styles.link}>Report an Issue</Text>
      </TouchableHighlight>
      <Text style={styles.author}>About the Author</Text>
      <Text style={styles.authorName}>{authorName}</Text>
      <TouchableHighlight
        style={styles.linkContainer}
        underlayColor={colors.tertiary}
        onPress={() => Linking.openURL(authorWebsite)}
      >
        <Text style={styles.link}>Visit Website</Text>
      </TouchableHighlight>
      <TouchableHighlight
        style={styles.linkContainer}
        underlayColor={colors.tertiary}
        onPress={() => Linking.openURL(`mailto:${authorEmail}`)}
      >
        <Text style={styles.link}>Contact</Text>
      </TouchableHighlight>
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
  title: {
    fontSize: 42,
    fontFamily: "BebasNeue-Regular",
    fontWeight: "bold",
    color: colors.primary,
  },
  linkContainer: {
    marginTop: 20,
    backgroundColor: colors.accent,
    width: 180,
    justifyContent: "center",
  },
  link: {
    color: "white",
    padding: 10,
    textAlign: "center",
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
