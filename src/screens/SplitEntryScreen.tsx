import React from "react";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";
import { UnifiedEntryScreen, getGpxFileUris } from "../components/UnifiedEntryView";

type Props = NativeStackScreenProps<RootStackParamList, "Split">;

export function SplitEntryScreen({ navigation }: Props) {
  return (
    <UnifiedEntryScreen
      title="Split GPX files"
      onAuthSuccess={(accessToken, athlete) => {
          navigation.navigate("Split (Strava)", {
            accessToken,
            athlete,
          });
        }
      }
      onSelectPress={async () => {
        const [fileUri] = await getGpxFileUris({ multiple: false });
        navigation.navigate("Split Map", { gpxFileUri: fileUri });
      }}
    />
  );
}
