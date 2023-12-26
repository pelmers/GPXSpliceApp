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
};

type ChartTypes =
  | "elevation"
  | "speed"
  | "heartrate"
  | "cadence"
  | "power"
  | "temperature";

function iconForType(chartType: ChartTypes) {
  switch (chartType) {
    case "elevation":
      return "🏔";
    case "speed":
      return "💨";
    case "heartrate":
      return "❤️";
    case "cadence":
      return "♺";
    case "power":
      return "🔋";
    case "temperature":
      return "🌡";
  }
}

function enabledForType(chartType: ChartTypes, points: GpxPoint[]) {
  switch (chartType) {
    case "heartrate":
      return !points.some((point) => point.heartrate == null);
    case "cadence":
      return !points.some((point) => point.cadence == null);
    case "power":
      return !points.some((point) => point.watts == null);
    case "temperature":
      return !points.some((point) => point.temp == null);
    case "elevation":
      return !points.some((point) => point.altitude == null);
    case "speed":
      return !points.some((point) => point.time == null);
  }
}

function yAxisUnitsForType(chartType: ChartTypes) {
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

function computeXYValues(points: GpxPoint[], chartType: ChartTypes) {
  if (!enabledForType(chartType, points)) {
    throw new Error("Chart type not enabled for this data");
  }
  const xValues = calculateCumulativeDistance(points);
  const yValues: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    switch (chartType) {
      case "elevation":
        yValues.push(point.altitude!);
        break;
      case "speed":
        // TODO: do something about crazy speed values from gps recordings
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
        yValues.push(point.heartrate!);
        break;
      case "cadence":
        yValues.push(point.cadence!);
        break;
      case "power":
        yValues.push(point.watts!);
        break;
      case "temperature":
        yValues.push(point.temp!);
        break;
    }
  }
  return { xValues, yValues };
}

export function GpxChartingModule_(props: Props) {
  const [chartType, setChartType] = useState<ChartTypes>("elevation");
  const { xValues, yValues } = useMemo(
    () => computeXYValues(props.points, chartType),
    [props.points, chartType],
  );

  // A row of buttons with icons, then a chart below
  return (
    <View>
      <View style={styles.buttonRow}>
        {[
          "elevation" as const,
          "speed" as const,
          "heartrate" as const,
          "cadence" as const,
          "power" as const,
          "temperature" as const,
        ].map((type) => {
          const enabled = enabledForType(type, props.points);
          const icon = iconForType(type);
          return (
            <Pressable
              key={type}
              onPress={() => setChartType(type)}
              style={[
                styles.button,
                chartType === type
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
      <View style={styles.chartContainer}>
        <EasyLineChart
          xValues={xValues}
          yValues={yValues}
          yAxisUnits={yAxisUnitsForType(chartType)}
          maxPoints={100}
          width={props.chartWidth}
          height={props.chartHeight}
        />
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

export const GpxChartingModule = React.memo(GpxChartingModule_);
