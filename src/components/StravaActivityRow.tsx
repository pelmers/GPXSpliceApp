import { StyleSheet, View, Pressable, Text } from "react-native";

import humanizeDuration from "humanize-duration";

import { colors } from "../utils/colors";
import { StravaActivity } from "../types/strava";
import { ActivityInfoFragment } from "./ActivityInfoFragment";

type Props = {
  activity: StravaActivity;
  onPress: (activity: StravaActivity) => void;
};

export function StravaActivityRow(props: Props) {
  const { activity } = props;
  const hasGps =
    activity.map != null &&
    activity.map.summary_polyline != null &&
    activity.map.summary_polyline.length > 0;
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
        <ActivityInfoFragment
          isPrivate={!!activity.private}
          stats={{
            distance: activity.distance ? activity.distance / 1000 : 0,
            durationMs: activity.moving_time ? activity.moving_time * 1000 : 0,
            startTime: activity.start_date,
            averageSpeed: activity.average_speed,
            averageHeartRate: activity.average_heartrate,
            averagePower: activity.average_watts,
            averageCadence: activity.average_cadence,
          }}
          name={activity.name ?? "Unknown name"}
          activityType={activity.type ?? "Unknown type"}
          location={activity.location_city}
        />
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
});
