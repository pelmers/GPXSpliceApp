// Component that displays elevation, speed, heartrate charts from gpx data
// Contains a row of selector buttons, depending on which button is selected shows an easy line chart
// Which buttons are available depends on the data in the gpx

import React, { useState, useMemo } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";

import { colors } from "../utils/colors";
import { GpxPoint, calculateCumulativeDistance } from "../utils/gpx";
import { EasyLineChart } from "./EasyLineChart";

type Props = {
  points: GpxPoint[];
  chartHeight: number;
  chartWidth: number;
  splitData?: {
    index: number;
    cumulativeDistances: number[];
  };
};

type ChartType =
  | "elevation"
  | "speed"
  | "heartrate"
  | "cadence"
  | "power"
  | "temperature";

const ChartTypesArray: ChartType[] = [
  "elevation",
  "speed",
  "heartrate",
  "cadence",
  "power",
  "temperature",
];

function iconForType(chartType: ChartType) {
  switch (chartType) {
    case "elevation":
      return "🏔";
    case "speed":
      return "💨";
    case "heartrate":
      return "❤️";
    case "cadence":
      return "👟";
    case "power":
      return "🔋";
    case "temperature":
      return "🌡";
  }
}

function enabledForType(chartType: ChartType, points: GpxPoint[]) {
  switch (chartType) {
    case "heartrate":
      return points.some((point) => point.heartrate != null);
    case "cadence":
      return points.some((point) => point.cadence != null);
    case "power":
      return points.some((point) => point.watts != null);
    case "temperature":
      return points.some((point) => point.temp != null);
    case "elevation":
      return points.some((point) => point.altitude != null);
    case "speed":
      return points.some((point) => point.time != null);
  }
}

function yAxisUnitsForType(chartType: ChartType) {
  switch (chartType) {
    case "elevation":
      return "m";
    case "speed":
      return "kph";
    case "heartrate":
      return "";
    case "cadence":
      return "rpm";
    case "power":
      return "W";
    case "temperature":
      return "°C";
  }
}

function computeXYValues(points: GpxPoint[], chartType: ChartType) {
  if (!enabledForType(chartType, points)) {
    throw new Error("Chart type not enabled for this data");
  }
  const xValues = calculateCumulativeDistance(points);
  const yValues: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    switch (chartType) {
      case "elevation":
        yValues.push(point.altitude ?? 0);
        break;
      case "speed":
        // speed is distance / time, so it needs 2 points
        if (i == 0) {
          yValues.push(0);
        } else {
          const distance = xValues[i] - xValues[i - 1];
          const time1 = new Date(points[i].time!).getTime() / 1000;
          const time2 = new Date(points[i - 1].time!).getTime() / 1000;
          const duration = time1 - time2;
          // to avoid a divide by zero, if the time is almost 0, just use the previous speed
          if (duration < 0.1) {
            yValues.push(yValues[i - 1]);
          } else {
            // convert time from seconds to hours
            yValues.push(distance / (duration / 3600));
          }
        }
        break;
      case "heartrate":
        yValues.push(point.heartrate ?? 0);
        break;
      case "cadence":
        yValues.push(point.cadence ?? 0);
        break;
      case "power":
        yValues.push(point.watts ?? 0);
        break;
      case "temperature":
        yValues.push(point.temp ?? 0);
        break;
    }
  }
  return { xValues, yValues };
}

function ChartButtonRow(props: {
  currentType: ChartType;
  points: GpxPoint[];
  onPress: (chartType: ChartType) => void;
}) {
  return (
    <View style={styles.buttonRow}>
      {ChartTypesArray.map((type) => {
        const enabled = enabledForType(type, props.points);
        const icon = iconForType(type);
        return (
          <Pressable
            key={type}
            onPress={() => props.onPress(type)}
            style={[
              styles.button,
              props.currentType === type
                ? styles.currentButton
                : enabled
                  ? styles.enabledButton
                  : styles.disabledButton,
            ]}
            disabled={!enabled}
          >
            <Text style={styles.buttonText}>{icon}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// The split slider units are indices, but the chart is in distance on the x axis.
// So we want to get the distance of the split point, and then find the index of the point closest to that distance
// Return the proportion of the total distance that the split point is at
function computeSplitPercent(
  cumulativeDistances: number[],
  splitIndex: number,
) {
  const totalDistance = cumulativeDistances[cumulativeDistances.length - 1];
  const splitDistance = cumulativeDistances[splitIndex];
  return splitDistance / totalDistance;
}

export function GpxChartingModule(props: Props) {
  const [chartType, setChartType] = useState<ChartType>("elevation");
  const { xValues, yValues } = useMemo(
    () => computeXYValues(props.points, chartType),
    [props.points, chartType],
  );

  const splitPercent =
    props.splitData != null
      ? computeSplitPercent(
          props.splitData.cumulativeDistances,
          props.splitData.index,
        )
      : null;
  // A row of buttons with icons, then a chart below and a split marker that follows the slider if given
  return (
    <View>
      <ChartButtonRow
        currentType={chartType}
        points={props.points}
        onPress={setChartType}
      />
      <View style={styles.chartContainer}>
        <EasyLineChart
          xValues={xValues}
          yValues={yValues}
          yAxisUnits={yAxisUnitsForType(chartType)}
          maxPoints={100}
          width={props.chartWidth}
          height={props.chartHeight}
        />
        {splitPercent != null && (
          // 64 and 32 are the margins of the chart axes, determined by inspection
          <View
            style={{
              position: "absolute",
              left: 64 + (props.chartWidth - 64) * splitPercent,
              top: 16,
              bottom: 32,
              width: 2,
              opacity: 0.7,
              backgroundColor: colors.primary,
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginVertical: 6,
  },
  button: {
    width: 50,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  enabledButton: {
    backgroundColor: colors.tertiary,
  },
  currentButton: {
    backgroundColor: colors.light,
  },
  disabledButton: {
    backgroundColor: colors.accent,
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 20,
  },
  chartContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
