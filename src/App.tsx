import React, { useEffect, useState } from "react";

import * as Font from "expo-font";
import { registerRootComponent } from "expo";

import { HomeScreen } from "./screens/HomeScreen";
import { NavigationContainer } from "@react-navigation/native";
import { RootStackParamList } from "./routes";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SplitEntryScreen } from "./screens/SplitEntryScreen";
import { StravaActivitiesScreen } from "./screens/StravaActivitiesScreen";
import { GpxSplitMapScreen } from "./screens/GpxSplitMapScreen";

// Title page: autoplays banner.mp4 in top half of page, shows 2 buttons below that, centered
// button 1: split GPS file
// button 2: combine GPS files

const Stack = createNativeStackNavigator<RootStackParamList>();

Font.loadAsync({
  "BebasNeue-Regular": require("../assets/fonts/BebasNeue-Regular.ttf"),
});

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        "Audiowide-Regular": require("../assets/fonts/BebasNeue-Regular.ttf"),
      });
      setFontLoaded(true);
    }

    loadFont();
  }, []);

  if (!fontLoaded) {
    return null;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="SplitEntry" component={SplitEntryScreen} />
        <Stack.Screen
          name="StravaActivities"
          component={StravaActivitiesScreen}
        />
        <Stack.Screen name="GpxSplitMap" component={GpxSplitMapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

registerRootComponent(App);
