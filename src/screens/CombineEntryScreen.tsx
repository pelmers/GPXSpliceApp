import React from "react";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";
import { UnifiedEntryScreen, getGpxFileUris } from "../components/UnifiedEntryView";

type Props = NativeStackScreenProps<RootStackParamList, "Combine">;

export function CombineEntryScreen({ navigation }: Props) {
  return (
    <UnifiedEntryScreen
      title="Combine GPX files"
      onAuthSuccess={(accessToken, athlete) => {
          navigation.navigate("Combine (Strava)", {
            accessToken,
            athlete,
          });
        }
      }
      onSelectPress={async () => {
        const fileUris = await getGpxFileUris({ multiple: true });
        navigation.navigate("Combine Preview", { gpxFileUris: fileUris });
      }}
    />
  );
}
