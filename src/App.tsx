import React, { useEffect, useState } from "react";

import * as Font from "expo-font";
import { registerRootComponent } from "expo";

import { HomeScreen } from "./screens/HomeScreen";
import { NavigationContainer } from "@react-navigation/native";
import { RootStackParamList } from "./routes";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SplitEntryScreen } from "./screens/SplitEntryScreen";
import { StravaSplitActivitiesScreen } from "./screens/StravaSplitActivitiesScreen";
import { GpxSplitMapScreen } from "./screens/GpxSplitMapScreen";
import { PostSplitScreen } from "./screens/PostSplitScreen";
import { CombineEntryScreen } from "./screens/CombineEntryScreen";
import { CombinePreviewScreen } from "./screens/CombinePreviewScreen";
import { StravaCombineActivitiesScreen } from "./screens/StravaCombineActivitiesScreen";

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
        <Stack.Screen name="Split" component={SplitEntryScreen} />
        <Stack.Screen
          name="Split (Strava)"
          component={StravaSplitActivitiesScreen}
        />
        <Stack.Screen name="Split Map" component={GpxSplitMapScreen} />
        <Stack.Screen name="Post Split" component={PostSplitScreen} />
        <Stack.Screen name="Combine" component={CombineEntryScreen} />
        <Stack.Screen name="Combine Preview" component={CombinePreviewScreen} />
        <Stack.Screen name="Combine (Strava)" component={StravaCombineActivitiesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

registerRootComponent(App);
