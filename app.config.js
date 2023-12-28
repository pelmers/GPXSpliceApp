require("dotenv").config();

module.exports = () => ({
  expo: {
    name: "GPXSpliceApp",
    slug: "gpxsplice",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    entryPoint: "./src/App.js",
    scheme: "com.pelmers.gpxsplice",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.pelmers.gpxsplice",
    },
    android: {
      package: "com.pelmers.gpxsplice",
      intentFilters: [],
      config: {
        googleMaps: {
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
