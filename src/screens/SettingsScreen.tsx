import React, { useState, useEffect, useContext } from "react";
import { ScrollView, Text, StyleSheet, ActivityIndicator } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

import { colors } from "../utils/colors";
import { RootStackParamList } from "../routes";

import { SPEED_UNITS, DISTANCE_UNITS, TEMP_UNITS } from "../types/settings";
import { SettingsContext, SettingsContextType } from "../SettingsProvider";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export function SettingsScreen({ navigation }: Props) {
  const { settings, setSettings } = useContext(
    SettingsContext,
  ) as SettingsContextType;

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
