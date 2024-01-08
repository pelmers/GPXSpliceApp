const path = require("path");
const webpack = require("webpack");
const dotenv = require("dotenv").config({
  path: path.join(__dirname, ".env.local"),
});

const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  config.plugins.push(
    new webpack.DefinePlugin({
      "process.env.MAPBOX_ACCESS_TOKEN": JSON.stringify(
        dotenv.parsed.MAPBOX_ACCESS_TOKEN,
      ),
    }),
  );
  return config;
};
