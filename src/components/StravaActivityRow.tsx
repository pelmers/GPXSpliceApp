import { StyleSheet, View, Pressable, Text } from "react-native";

import humanizeDuration from "humanize-duration";

import { colors } from "../utils/colors";
import { StravaActivity } from "../types/strava";

// See full list at https://developers.strava.com/docs/reference/#api-models-SportType
function getActivityEmoji(activity: StravaActivity) {
  switch (activity.type) {
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
      return "🤨";
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
  activity: StravaActivity;
  onPress: (activity: StravaActivity) => void;
};

export function StravaActivityRow(props: Props) {
  const { activity } = props;
  const typeEmoji = getActivityEmoji(activity);
  const hasGps =
    activity.map != null &&
    activity.map.summary_polyline != null &&
    activity.map.summary_polyline.length > 0;
  const distanceKm = activity.distance
    ? (activity.distance / 1000).toFixed(2)
    : null;
  const location = activity.location_city ? activity.location_city : null;
  const duration = activity.moving_time
    ? formatDuration(activity.moving_time)
    : null;
  const timeSinceActivity = activity.start_date
    ? Date.now() - Date.parse(activity.start_date)
    : null;
  const publicText = activity.private ? "🔒" : "🌎";
  return (
    <View>
      <Pressable
        style={
          hasGps
            ? styles.activityInfoContainer
            : styles.disabledActivityInfoContainer
        }
        onPress={() => props.onPress(activity)}
        disabled={!hasGps}
      >
        <View>
          <Text style={{ fontSize: 30 }}>{typeEmoji}</Text>
        </View>
        <View>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.activityInfoNameText}>{activity.name}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.activityInfoRowExtraText}>{publicText}</Text>
            {duration && (
              <Text style={styles.activityInfoRowExtraText}>{duration}</Text>
            )}
            {distanceKm && (
              <Text style={styles.activityInfoRowExtraText}>
                {distanceKm}km
              </Text>
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
      </Pressable>
      <View
        style={{
          borderBottomColor: colors.light,
          borderBottomWidth: 1,
          opacity: 0.2,
          marginHorizontal: 100,
        }}
      ></View>
    </View>
  );
}

const styles = StyleSheet.create({
  activityInfoContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    marginBottom: 5,
    paddingHorizontal: 15,
  },
  disabledActivityInfoContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    marginBottom: 5,
    paddingHorizontal: 15,
    opacity: 0.6,
  },
  activityInfoNameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  activityInfoTimeSinceText: {
    fontSize: 16,
    fontWeight: "bold",
    paddingRight: 10,
  },
  activityInfoRowExtraText: {
    fontSize: 14,
    fontStyle: "italic",
    paddingRight: 10,
  },
});
