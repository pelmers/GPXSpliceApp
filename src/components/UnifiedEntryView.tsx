import React, { useEffect, useState } from "react";
import { StyleSheet, View, Pressable, Text, Platform } from "react-native";
import queryString from "query-string";

import * as DocumentPicker from "expo-document-picker";
import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";

import { colors } from "../utils/colors";
import { STRAVA_AUTH_ENDPOINT, CLIENT_ID, REDIRECT_URL } from "../utils/client";
import { StravaAthlete } from "../types/strava";

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
      if (!file.uri.endsWith(".gpx") && !file.file?.name.endsWith(".gpx")) {
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

  const redirectUri = new URL(REDIRECT_URL);
  redirectUri.searchParams.append(
    "client_uri",
    AuthSession.makeRedirectUri({
      path: "/auth_redirect",
      isTripleSlashed: true,
    }),
  );

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ["activity:read_all"],
      // TODO ask for write when we implement upload, btw scopes needs to be a single string
      // scopes: ["activity:read_all,activity:write"],
      redirectUri: redirectUri.toString(),
    },
    {
      authorizationEndpoint: STRAVA_AUTH_ENDPOINT,
    },
  );

  const handleAuthResponse = (url: string) => {
    const queryStringStart = url.indexOf("?");
    const queryPart =
      queryStringStart !== -1 ? url.substring(queryStringStart) : "";
    const parsed = queryString.parse(queryPart);

    const { payload, scope } = parsed;
    if (payload) {
      const payloadObj = JSON.parse(decodeURIComponent(payload as string));
      const accessToken = payloadObj.access_token;
      if (scope && !scope.includes("activity:write")) {
        // TODO Alert uncomment alert below when we implement upload
        // Alert.alert(
        //   "Warning",
        //   "Without write permission, I cannot help you upload activities after splitting!",
        // );
      }
      props.onAuthSuccess(accessToken, payloadObj.athlete);
    } else {
      const errorDescription = parsed.error_description;
      if (errorDescription) {
        setError(errorDescription as string);
      }
    }
  };

  useEffect(() => {
    if (response != null && response.type === "success") {
      handleAuthResponse(response.url);
    }
  }, [response]);

  useEffect(() => {
    // workaround android bug (https://github.com/expo/expo/issues/12044), so if not android, skip
    if (Platform.OS !== "android") {
      return;
    }
    const handler = async (event: Linking.EventType) => {
      // See: https://github.com/expo/expo/issues/12044#issuecomment-889031264
      handleAuthResponse(event.url);
    };
    const subscription = Linking.addEventListener("url", handler);
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{props.title}</Text>
      <Pressable
        style={[styles.button, { backgroundColor: colors.strava }]}
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
    backgroundColor: colors.dark,
  },
  title: {
    fontSize: 45,
    marginBottom: 20,
    fontFamily: "BebasNeue-Regular",
    color: colors.light,
  },
  button: {
    justifyContent: "center",
    backgroundColor: colors.accent,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    height: 50,
    width: 200,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    lineHeight: 24,
    fontSize: 21,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});
