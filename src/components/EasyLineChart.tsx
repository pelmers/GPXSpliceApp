import { LineChart } from "react-native-chart-kit";
import React from "react";
import { colors } from "../utils/colors";

type Props = {
  xValues: number[];
  yValues: number[];
  yAxisUnits: string;
  maxPoints: number;
  width: number;
  height: number;
};

const segments = 5;

function resample(values: number[], maxPoints: number) {
  if (values.length <= maxPoints) {
    return values;
  }
  const resampled = [];
  const interval = (values.length - 1) / (maxPoints - 1);

  for (let i = 0; i < maxPoints; i++) {
    const index = Math.floor(i * interval);
    if (index === values.length - 1) {
      resampled.push(values[index]);
    } else {
      const fraction = i * interval - index;
      resampled.push(
        values[index] + fraction * (values[index + 1] - values[index]),
      );
    }
  }
  return resampled;
}

// Overall not a fan of this react native chart kit library, but I guess it's okay for now...
function EasyLineChart_(props: Props) {
  const { xValues, yValues, maxPoints } = props;
  if (xValues.length !== yValues.length) {
    throw new Error("xValues and yValues must have the same length");
  }
  // If the data length is larger than maxPoints, then resample with interpolation
  let resampledXValues = resample(xValues, maxPoints);
  let resampledYValues = resample(yValues, maxPoints);
  if (resampledXValues.length < 2) {
    return null;
  }

  const xAxisValuesToShow = new Set();
  for (let i = 0; i < resampledXValues.length; i++) {
    if (i % (Math.floor(resampledXValues.length / segments) - 1) === 0) {
      xAxisValuesToShow.add(i);
    }
  }

  return (
    <LineChart
      data={{
        labels: resampledXValues.map((_, idx) => idx.toString()),
        datasets: [
          {
            data: resampledYValues,
            color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
          },
        ],
      }}
      width={props.width}
      height={props.height}
      yAxisInterval={resampledYValues.length}
      yAxisSuffix={props.yAxisUnits}
      segments={segments}
      formatXLabel={(value) =>
        xAxisValuesToShow.has(parseFloat(value))
          ? resampledXValues[parseFloat(value)].toFixed(1)
          : ""
      }
      withDots={false}
      chartConfig={{
        backgroundColor: colors.dark,
        backgroundGradientFrom: colors.dark,
        backgroundGradientTo: colors.dark,
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        propsForDots: {
          // no dots, just line
          r: "0",
        },
      }}
      style={{
        marginVertical: 8,
        borderRadius: 8,
      }}
    />
  );
}

export const EasyLineChart = React.memo(EasyLineChart_);
