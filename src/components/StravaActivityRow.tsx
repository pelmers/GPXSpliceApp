import { StyleSheet, View, TouchableHighlight } from "react-native";

import { colors } from "../utils/colors";
import { StravaActivity } from "../types/strava";
import { ActivityInfoFragment } from "./ActivityInfoFragment";

type Props = {
  activity: StravaActivity;
  selected?: boolean;
  onPress: (activity: StravaActivity) => void;
};

export function StravaActivityRow(props: Props) {
  const { activity, selected } = props;
  const hasGps =
    activity.map != null &&
    activity.map.summary_polyline != null &&
    activity.map.summary_polyline.length > 0;
  return (
    <View>
      <TouchableHighlight
        style={[
          styles.activityInfoContainer,
          selected ? { backgroundColor: colors.light + "88" } : {},
          !hasGps ? { opacity: 0.6 } : {},
        ]}
        onPress={() => props.onPress(activity)}
        disabled={!hasGps}
        underlayColor={colors.primary}
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
          location={activity.location_city ?? undefined}
        />
      </TouchableHighlight>
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
});
