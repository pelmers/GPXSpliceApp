import { StyleSheet, View, Text } from "react-native";
import * as RNLocalize from "react-native-localize";

import { colors } from "../utils/colors";
import { GpxSummary } from "../utils/gpx";
import { useSettings } from "../providers/SettingsProvider";
import { convert } from "../types/settings";

// See full list at https://developers.strava.com/docs/reference/#api-models-SportType
function getActivityEmoji(activityType: string) {
  switch (activityType) {
    case "Run":
      return "🏃";
    case "Ride":
      return "🚴";
    case "Swim":
      return "🏊";
    case "Yoga":
      return "🧘";
    case "Skateboard":
      return "🛹";
    case "Walk":
      return "🚶";
    case "Hike":
      return "🥾";
    case "AlpineSki":
      return "⛷";
    case "BackcountrySki":
      return "🎿";
    case "Canoeing":
      return "🛶";
    case "Crossfit":
      return "🏋️";
    case "EBikeRide":
      return "🚴";
    case "Sail":
      return "⛵";
    default:
      return "👍";
  }
}

function formatDuration(durationMs: number) {
  // Get a whole number of milliseconds
  const duration = Math.floor(durationMs);
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  if (hours > 0) {
    const formattedHours = hours.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedMinutes}:${formattedSeconds}`;
  }
}

type Props = {
  stats: GpxSummary;
  name: string;
  activityType: string;
  isPrivate: boolean;
  location?: string;
  textColor?: string;
};

function getLocale() {
  try {
    return RNLocalize.getLocales()[0].languageTag;
  } catch (e) {
    console.error("Error getting locale", e);
    return "en-US";
  }
}

export function ActivityInfoFragment(props: Props) {
  const { stats, name, location, activityType, isPrivate } = props;
  const color = props.textColor || colors.dark;
  const { settings } = useSettings();

  const activityNameTextStyle = [styles.activityInfoNameText, { color }];
  const extraTextStyle = [styles.activityInfoRowExtraText, { color }];

  const typeEmoji = getActivityEmoji(activityType);
  const distanceDisplay = convert(stats.distance || 0, "km", settings);
  const duration = stats.durationMs
    ? formatDuration(stats.durationMs / 1000)
    : null;
  const activityDateString = stats.startTime
    ? new Date(stats.startTime).toLocaleDateString(getLocale(), {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const publicText = isPrivate ? "🔒" : "🌎";
  return (
    <>
      <View>
        <Text style={{ fontSize: 30, color }}>{typeEmoji}</Text>
      </View>
      <View>
        <View style={{ flexDirection: "row" }}>
          <Text style={activityNameTextStyle}>{name}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={extraTextStyle}>{publicText}</Text>
          {duration && <Text style={extraTextStyle}>{duration}</Text>}
          {distanceDisplay && (
            <Text style={extraTextStyle}>
              {distanceDisplay.value.toFixed(2) + " " + distanceDisplay.unit}
            </Text>
          )}
          {location && <Text style={extraTextStyle}>{location}</Text>}
          {activityDateString && (
            <Text style={extraTextStyle}>{activityDateString}</Text>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  activityInfoNameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  activityInfoRowExtraText: {
    fontSize: 14,
    fontStyle: "italic",
    paddingRight: 10,
  },
});
