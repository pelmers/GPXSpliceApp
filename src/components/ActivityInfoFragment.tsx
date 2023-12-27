import { StyleSheet, View, Pressable, Text } from "react-native";

import humanizeDuration from "humanize-duration";

import { colors } from "../utils/colors";
import { GpxSummary } from "../utils/gpx";

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

function formatDuration(duration: number) {
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
  location?: string | null;
};

export function ActivityInfoFragment(props: Props) {
  const { stats, name, location, activityType, isPrivate } = props;
  const typeEmoji = getActivityEmoji(activityType);
  const distanceKm = stats.distance?.toFixed(2);
  const duration = stats.durationMs
    ? formatDuration(stats.durationMs / 1000)
    : null;
  const timeSinceActivity = stats.startTime
    ? Date.now() - Date.parse(stats.startTime)
    : null;
  const publicText = isPrivate ? "🔒" : "🌎";
  return (
    <>
      <View>
        <Text style={{ fontSize: 30 }}>{typeEmoji}</Text>
      </View>
      <View>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.activityInfoNameText}>{name}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.activityInfoRowExtraText}>{publicText}</Text>
          {duration && (
            <Text style={styles.activityInfoRowExtraText}>{duration}</Text>
          )}
          {distanceKm && (
            <Text style={styles.activityInfoRowExtraText}>{distanceKm}km</Text>
          )}
          {location && (
            <Text style={styles.activityInfoRowExtraText}>{location}</Text>
          )}
          {timeSinceActivity && (
            <Text style={styles.activityInfoRowExtraText}>
              {humanizeDuration(timeSinceActivity, {
                largest: 1,
                round: true,
              })}{" "}
              ago
            </Text>
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
