import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Alert, Text } from "react-native";

import { ResizeMode, Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as AuthSession from "expo-auth-session";

import { colors } from "../colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";
import { BlurView } from "expo-blur";

type Props = NativeStackScreenProps<RootStackParamList, "Split">;

async function getGpxFileUri(): Promise<string> {
  const result = await DocumentPicker.getDocumentAsync({
    // type: "application/gpx+xml", // TODO: Only allow .gpx files, doesn't work!
    copyToCacheDirectory: true, // Optional: Set to true if you want to copy the file to the app's cache directory
    multiple: false, // Only allow a single file
  });

  if (result.assets != null) {
    const resultFile = result.assets[0];
    // The file was successfully picked
    console.log("Selected file: ", resultFile.uri, resultFile.mimeType);
    // if extension is not gpx, throw an error
    if (resultFile.uri.endsWith(".gpx")) {
      console.log("File is a GPX file");
      return resultFile.uri;
    } else {
      throw new Error("Selected file extension is not .gpx!");
    }
  } else {
    // The user cancelled the file picker
    console.log("File picker was cancelled");
    throw new Error("File selection cancelled");
  }
}

const stravaDiscovery = {
  authorizationEndpoint: "https://www.strava.com/oauth/mobile/authorize",
  tokenEndpoint: "https://www.strava.com/oauth/token",
  revocationEndpoint: "https://www.strava.com/oauth/deauthorize",
};

export function SplitScreen({ navigation }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      // TODO: move this const to another file
      clientId: "118471",
      scopes: ["activity:read_all"],
      redirectUri:"https://gpxspliceredirect.pelmers.com",
    },
    {
      authorizationEndpoint: "https://www.strava.com/oauth/mobile/authorize",
    },
  );

  React.useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      console.log("Strava auth success", code);
      // TODO: navigate to next screen (list of activities)
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Split GPX route</Text>
      <Pressable
        style={styles.button}
        onPress={async () => {
          try {
            const fileUri = await getGpxFileUri();
            setError(null);
            // TODO: navigate to next screen (map with route by reading GPX file)
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <Text style={styles.buttonText}>Select File</Text>
      </Pressable>
      <Pressable
        style={styles.stravaButton}
        disabled={!request}
        onPress={async () => {
          try {
            // TODO: connect to Strava, show list of recent activities on a new screen
            await promptAsync();
            setError(null);
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <Text style={styles.buttonText}>Load Strava Activity</Text>
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.accent,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  stravaButton: {
    backgroundColor: colors.strava,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});
