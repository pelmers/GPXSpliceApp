import React, { useState } from "react";
import { StyleSheet, View, Pressable, Alert, Text } from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import { colors } from "../utils/colors";
import { STRAVA_AUTH_ENDPOINT, CLIENT_ID, REDIRECT_URL } from "../utils/client";
import { StravaAthlete } from "../types/strava";

// TODO does this random fix work? from https://github.com/expo/expo/issues/12044#issuecomment-1609531747
WebBrowser.maybeCompleteAuthSession();

export async function getGpxFileUris(options: {
  multiple: boolean;
}): Promise<string[]> {
  const { multiple } = options;
  const result = await DocumentPicker.getDocumentAsync({
    // type: "application/gpx+xml", // TODO: want to only allow .gpx files, this doesn't work!
    copyToCacheDirectory: true, // Optional: Set to true if you want to copy the file to the app's cache directory
    multiple, // Only allow a single file
  });

  if (result.assets != null) {
    const uris = result.assets.map((file) => {
      if (!file.uri.endsWith(".gpx")) {
        throw new Error("All selected files must be .gpx files");
      }
      return file.uri;
    });

    if (multiple && uris.length < 2) {
      throw new Error("Please select at least 2 .gpx files");
    }
    return uris;
  } else {
    // The user cancelled the file picker
    throw new Error("File selection cancelled");
  }
}

type Props = {
  title: string;
  onAuthSuccess: (accessToken: string, athlete: StravaAthlete) => void;
  onSelectPress: () => unknown;
};

export function UnifiedEntryScreen(props: Props) {
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ["activity:read_all"],
      // TODO ask for write when we implement upload, btw scopes needs to be a single string
      // scopes: ["activity:read_all,activity:write"],
      redirectUri:
        REDIRECT_URL + "?client_uri=" + AuthSession.makeRedirectUri(),
    },
    {
      authorizationEndpoint: STRAVA_AUTH_ENDPOINT,
    },
  );

  React.useEffect(() => {
    console.log(response);
    if (response != null && response.type === "success") {
          // read access token from response by parsing 'payload' param which the redirect server gives us
          const payload = JSON.parse(response.params.payload);
          const accessToken = payload.access_token;
          const { scope } = response.params;
          if (!scope.includes("activity:write")) {
            // TODO Alert uncomment alert below when we implement upload
            // Alert.alert(
            //   "Warning",
            //   "Without write permission, I cannot help you upload activities after splitting!",
            // );
          }
          props.onAuthSuccess(accessToken, payload.athlete);
        } else if (response != null && response.type === "error") {
        setError(response.params.error_description);
        }
    } , [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{props.title}</Text>
      <Pressable
        style={styles.stravaButton}
        disabled={!request}
        onPress={async () => {
          try {
            await promptAsync({ showInRecents: false });
            setError(null);
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <Text style={styles.buttonText}>Load from Strava</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={async () => {
          try {
            await props.onSelectPress();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <Text style={styles.buttonText}>Select File(s)</Text>
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
