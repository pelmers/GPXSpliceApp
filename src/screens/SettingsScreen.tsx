import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";

import { RootStackParamList } from "../routes";

import {
  SPEED_UNITS,
  DISTANCE_UNITS,
  TEMP_UNITS,
  ELEVATION_UNITS,
} from "../types/settings";
import { useSettings } from "../utils/SettingsProvider";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export function SettingsScreen({ navigation }: Props) {
  const { settings, setSettings } = useSettings();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Distance Units</Text>
      <Picker
        selectedValue={settings.distanceUnit}
        onValueChange={(itemValue) => {
          setSettings({ ...settings, distanceUnit: itemValue });
        }}
      >
        <Picker.Item label="Kilometers" value={DISTANCE_UNITS.KM} />
        <Picker.Item label="Miles" value={DISTANCE_UNITS.MI} />
      </Picker>

      <Text style={styles.label}>Speed Units</Text>
      <Picker
        selectedValue={settings.speedUnit}
        onValueChange={(itemValue) => {
          setSettings({ ...settings, speedUnit: itemValue });
        }}
      >
        <Picker.Item label="Kilometers per hour" value={SPEED_UNITS.KMH} />
        <Picker.Item label="Miles per hour" value={SPEED_UNITS.MPH} />
      </Picker>

      <Text style={styles.label}>Elevation Units</Text>
      <Picker
        selectedValue={settings.elevationUnit}
        onValueChange={(itemValue) => {
          setSettings({ ...settings, elevationUnit: itemValue });
        }}
      >
        <Picker.Item label="Meters" value={ELEVATION_UNITS.M} />
        <Picker.Item label="Feet" value={ELEVATION_UNITS.FT} />
      </Picker>

      <Text style={styles.label}>Temperature Units</Text>
      <Picker
        selectedValue={settings.tempUnit}
        onValueChange={(itemValue) => {
          setSettings({ ...settings, tempUnit: itemValue });
        }}
      >
        <Picker.Item label="Celsius" value={TEMP_UNITS.C} />
        <Picker.Item label="Fahrenheit" value={TEMP_UNITS.F} />
      </Picker>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
});
