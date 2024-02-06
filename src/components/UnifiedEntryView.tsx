import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableHighlight,
} from "react-native";
import queryString, { ParsedQuery } from "query-string";

import * as DocumentPicker from "expo-document-picker";
import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";

import { colors } from "../utils/colors";
import { CLIENT_ID, REDIRECT_SERVER_URL, WEB_ORIGIN } from "../utils/client";
import { StravaAthlete, getStravaAuthEndpoint } from "../types/strava";
import { useStravaToken } from "../providers/StravaTokenProvider";
import { Alert } from "react-native";
import WebView from "react-native-webview";

// On the web platform, oauth token is passed by window.postMessage from a
// redirect page opened in a pop-up window, so this hook listens for that
const useWebOAuthHandler = (handleAuthResponse: (data: any) => void) => {
  useEffect(() => {
    if (Platform.OS === "web") {
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== WEB_ORIGIN) return;

        const { data } = event;
        if (data.scope || data.error_description) {
          handleAuthResponse(data);
        }
      };

      window.addEventListener("message", handleMessage);

      // Clean up the event listener when the component is unmounted
      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }
  }, [handleAuthResponse]);
};

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
  onAuthSuccess: () => void;
  onSelectPress: () => unknown;
};

export function UnifiedEntryScreen(props: Props) {
  const [error, setError] = useState<string | null>(null);
  const [authorizationEndpoint, setAuthorizationEndpoint] = useState<
    string | undefined
  >();
  const [showWebView, setShowWebView] = useState(false);

  const { stravaToken, setStravaToken } = useStravaToken();

  const parseUrlQuery = (url: string) => {
    const queryStringStart = url.indexOf("?");
    const queryPart =
      queryStringStart !== -1 ? url.substring(queryStringStart) : "";
    return queryString.parse(queryPart);
  };

  const handleAuthResponse = (parsed: ParsedQuery) => {
    const { payload, scope } = parsed;
    if (payload) {
      const payloadObj = JSON.parse(decodeURIComponent(payload as string));
      const accessToken = payloadObj.access_token;
      const expiresAt = payloadObj.expires_at;
      setStravaToken({
        accessToken,
        expiresAtUnixSeconds: expiresAt,
        athlete: payloadObj.athlete as StravaAthlete,
        scope: scope as string,
      });
      if (scope?.indexOf("activity:write") === -1) {
        // Show an alert that upload will not work
        Alert.alert(
          "Upload not enabled",
          "You can export results to file, but upload will not work.",
          [
            {
              text: "OK",
              onPress: () => {},
            },
          ],
        );
      }
      props.onAuthSuccess();
    } else {
      const errorDescription = parsed.error_description || parsed.error;
      if (errorDescription) {
        setError(errorDescription as string);
      }
    }
  };

  // The client uri defines a uri that will come back to this screen when it's opened on the client
  // Note that on web this will actually open PostAuthMessagePostScreen, which then posts the token
  // back to this window.
  const clientUri = AuthSession.makeRedirectUri({
    path: "/auth_redirect",
    isTripleSlashed: true,
  });

  // I originally encoded the client uri as a query param, but for some reason this was getting
  // dropped when going through Strava's app-based mobile auth (though worked on the web version)
  // Instead we encode it in the path itself, after the client_uri part (which the server knows)
  const redirectUri = new URL(
    `${REDIRECT_SERVER_URL}/client_uri/${encodeURIComponent(clientUri)}`,
  );

  useEffect(() => {
    (async () => {
      setAuthorizationEndpoint(await getStravaAuthEndpoint());
    })();
  }, []);

  useWebOAuthHandler(handleAuthResponse);

  useEffect(() => {
    // using deeplink handler as workaround for android bug (https://github.com/expo/expo/issues/12044)
    const handler = async (event: Linking.EventType) => {
      // See: https://github.com/expo/expo/issues/12044#issuecomment-889031264
      handleAuthResponse(parseUrlQuery(event.url));
      setShowWebView(false);
    };
    const subscription = Linking.addEventListener("url", handler);
    return () => {
      subscription.remove();
    };
  }, []);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri.toString(),
    response_type: "code",
    scope: "activity:read_all,activity:write",
  });

  const authUrl = `${authorizationEndpoint!}?${params.toString()}`;

  if (showWebView) {
    return <WebView source={{ uri: authUrl }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{props.title}</Text>
      <TouchableHighlight
        underlayColor={colors.primary}
        style={[styles.button, { backgroundColor: colors.strava }]}
        disabled={authorizationEndpoint == null}
        onPress={async () => {
          // If the token still has at least 5 minutes left, don't re-auth
          if (
            stravaToken?.expiresAtUnixSeconds &&
            stravaToken?.expiresAtUnixSeconds - Date.now() / 1000 > 5 * 60
          ) {
            props.onAuthSuccess();
            return;
          }
          try {
            if (Platform.OS === "web") {
              window.open(authUrl, "_blank", "height=600,width=500");
            } else if (
              Platform.OS === "ios" &&
              !authUrl.startsWith("strava://")
            ) {
              // ios app store review tells us to use web view instead of system browser
              setShowWebView(true);
            } else {
              // android or ios with strava app available
              // android implicit intent opens app if installed, otherwise browser
              await Linking.openURL(authUrl);
            }
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <Text style={styles.buttonText}>Load from Strava</Text>
      </TouchableHighlight>
      <TouchableHighlight
        style={styles.button}
        underlayColor={colors.primary}
        onPress={async () => {
          try {
            await props.onSelectPress();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <Text style={styles.buttonText}>Select File(s)</Text>
      </TouchableHighlight>
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
