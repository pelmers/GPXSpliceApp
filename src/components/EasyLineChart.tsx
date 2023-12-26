// import { LineChart } from "react-native-wagmi-charts";
import { LineChart } from "react-native-chart-kit";
import React from "react";

type Props = {
  xValues: number[];
  yValues: number[];
  maxPoints: number;
  width: number;
  height: number;
};

function EasyLineChart_(props: Props) {
  const { xValues, yValues, maxPoints } = props;
  if (xValues.length !== yValues.length) {
    throw new Error("xValues and yValues must have the same length");
  }
  if (xValues.length < 2) {
    return null;
  }
  // If the data length is larger than maxPoints, then resample with interpolation
  let resampledXValues = xValues;
  let resampledYValues = yValues;

  if (xValues.length > maxPoints) {
    const interval = (xValues.length - 1) / (maxPoints - 1);
    resampledXValues = [];
    resampledYValues = [];

    for (let i = 0; i < maxPoints; i++) {
      const index = Math.floor(i * interval);
      if (index === xValues.length - 1) {
        resampledXValues.push(xValues[index]);
        resampledYValues.push(yValues[index]);
      } else {
        const fraction = i * interval - index;
        resampledXValues.push(
          xValues[index] + fraction * (xValues[index + 1] - xValues[index]),
        );
        resampledYValues.push(
          yValues[index] + fraction * (yValues[index + 1] - yValues[index]),
        );
      }
    }
  }

  return (
    <LineChart
      data={{
        labels: resampledXValues.map((_, idx) => idx.toString()),
        datasets: [
          {
            data: resampledYValues,
          },
        ],
      }}
      width={props.width}
      height={props.height}
      chartConfig={{
        backgroundColor: "#e26a00",
        backgroundGradientFrom: "#fb8c00",
        backgroundGradientTo: "#ffa726",
        decimalPlaces: 2, // optional, defaults to 2dp
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16,
        },
        propsForDots: {
          r: "6",
          strokeWidth: "2",
          stroke: "#ffa726",
        },
      }}
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}

      // ... other props
    />
  );

  //   return (
  //     <LineChart.Provider data={data}>
  //       <LineChart width={props.width} height={props.height}>
  //         <LineChart.Path />
  //       </LineChart>
  //     </LineChart.Provider>
  //   );
}

export const EasyLineChart = React.memo(EasyLineChart_);
