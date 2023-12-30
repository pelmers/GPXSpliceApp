require("dotenv").config({ path: "./.env.local" });
// If GOOGLE_MAPS_API_KEY is not set, show a warning
if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.warn(
    "GOOGLE_MAPS_API_KEY is not set. Map tiles will not load on Android. See README.md for more information.",
  );
}

module.exports = () => ({
  expo: {
    name: "GPX Splice",
    slug: "gpxsplice",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    entryPoint: "./src/App.js",
    scheme: "com.pelmers.gpxsplice",
    assetBundlePatterns: ["**/*", "!examples/**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.pelmers.gpxsplice",
    },
    android: {
      package: "com.pelmers.gpxsplice",
      intentFilters: [],
      config: {
        googleMaps: {
          // TODO: protect the api key in google maps console https://console.cloud.google.com/google/maps-apis/credentials?project=gpxsplice
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "50ae4f64-4602-433d-ad75-f087dc4feea9",
      },
    },
    owner: "pelmers",
  },
});
