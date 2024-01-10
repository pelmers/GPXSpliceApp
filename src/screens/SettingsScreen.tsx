import React from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../routes";

import {
  SPEED_UNITS,
  DISTANCE_UNITS,
  TEMP_UNITS,
  ELEVATION_UNITS,
  SpeedUnit,
  DistanceUnit,
  ElevationUnit,
  TempUnit,
} from "../types/settings";
import { useSettings } from "../providers/SettingsProvider";
import { colors } from "../utils/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

interface ButtonSettingRowProps<T> {
  label: string;
  selectedValue?: T;
  onValueChange: (itemValue: T) => void;
  items: { label: string; value: T }[];
}

function ButtonSettingRow<T>(props: ButtonSettingRowProps<T>) {
  const { label, selectedValue, onValueChange, items } = props;

  // Split items into chunks of two
  const itemChunks = [];
  for (let i = 0; i < items.length; i += 2) {
    itemChunks.push(items.slice(i, i + 2));
  }

  return (
    <View>
      <Text style={buttonRowStyles.labelText}>{label}</Text>
      {itemChunks.map((chunk, i) => (
        <View key={i} style={buttonRowStyles.buttonContainer}>
          {chunk.map((item, j) => (
            <TouchableOpacity
              key={j}
              style={[
                buttonRowStyles.button,
                selectedValue === item.value && buttonRowStyles.selectedButton,
              ]}
              onPress={() => onValueChange(item.value)}
            >
              <Text style={buttonRowStyles.buttonText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const buttonRowStyles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  button: {
    flex: 1,
    margin: 5,
    padding: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    height: 50,
    justifyContent: "center", // Add this line
    alignItems: "center", // Add this line
  },
  selectedButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 17,
    color: "#fff",
    fontWeight: "bold",
  },
  labelText: {
    fontSize: 30,
    fontWeight: "bold",
    marginLeft: 10,
    color: colors.light,
    fontFamily: "BebasNeue-Regular",
  },
});

export function SettingsScreen({ navigation }: Props) {
  const { settings, setSettings } = useSettings();

  const showStravaInfo = () => {
    Alert.alert(
      "Important Information",
      "Due to Strava's duplicate detection, all activities directly uploaded to Strava after a split or combine have their start time offset by 30 seconds later. You can avoid this by exporting to a file instead.",
      [{ text: "OK" }],
    );
  };

  const showSplitsInfo = () => {
    Alert.alert(
      "Important Information",
      "Multiple splits in one file are not supported yet. To do multiple splits, you have to load the activity again after splitting.",
      [{ text: "OK" }],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <ButtonSettingRow
        label="Distance"
        selectedValue={settings.distanceUnit}
        onValueChange={(itemValue: DistanceUnit) =>
          setSettings({ ...settings, distanceUnit: itemValue })
        }
        items={[
          { label: "Kilometers", value: DISTANCE_UNITS.KM },
          { label: "Miles", value: DISTANCE_UNITS.MI },
        ]}
      />
      <ButtonSettingRow
        label="Speed"
        selectedValue={settings.speedUnit}
        onValueChange={(itemValue: SpeedUnit) =>
          setSettings({ ...settings, speedUnit: itemValue })
        }
        items={[
          { label: "KM per hour", value: SPEED_UNITS.KMH },
          { label: "MI per hour", value: SPEED_UNITS.MPH },
        ]}
      />
      <ButtonSettingRow
        label="Elevation"
        selectedValue={settings.elevationUnit}
        onValueChange={(itemValue: ElevationUnit) =>
          setSettings({ ...settings, elevationUnit: itemValue })
        }
        items={[
          { label: "Meters", value: ELEVATION_UNITS.M },
          { label: "Feet", value: ELEVATION_UNITS.FT },
        ]}
      />
      <ButtonSettingRow
        label="Temperature"
        selectedValue={settings.tempUnit}
        onValueChange={(itemValue: TempUnit) =>
          setSettings({ ...settings, tempUnit: itemValue })
        }
        items={[
          { label: "Celsius", value: TEMP_UNITS.C },
          { label: "Fahrenheit", value: TEMP_UNITS.F },
        ]}
      />
      <ButtonSettingRow
        label="Other Info"
        onValueChange={(value) => {
          if (value === "strava") {
            showStravaInfo();
          } else if (value === "splits") {
            showSplitsInfo();
          }
        }}
        items={[
          { label: "Strava Uploads", value: "strava" },
          { label: "Multiple Splits", value: "splits" },
        ]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.dark,
  },
  infoButton: {
    width: "50%",
    margin: 5,
    padding: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  infoButtonText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "bold",
  },
});
