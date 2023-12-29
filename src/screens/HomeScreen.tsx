import React from "react";
import { StyleSheet, View, Pressable, Text, Platform } from "react-native";

import { ResizeMode, Video } from "expo-av";
import Icon from "react-native-vector-icons/FontAwesome";

import { colors } from "../utils/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";
import { BlurView } from "expo-blur";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  // TODO question icon at bottom right that goes to a contact screen
  // TODO on that screen put app/version info and links to github issues + review page + email link
  return (
    <View style={styles.container}>
      <Video
        source={require("../../assets/banner.mp4")}
        style={styles.bannerVideo}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        resizeMode={ResizeMode.COVER}
        onReadyForDisplay={(videoData) => {
          if (Platform.OS === "web") {
            // @ts-ignore see https://stackoverflow.com/a/74660089/2288934
            videoData.srcElement.style.position = "initial";
          }
        }}
        shouldPlay
        isLooping
      />
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.title}>
        <Text style={styles.titleText}>GPX Splice</Text>
      </View>
      <View style={styles.subtitle}>
        <Text style={styles.subtitleText}>Select an option</Text>
      </View>
      <View style={styles.buttonBackground}>
        <Pressable
          onPress={() => {
            navigation.navigate("Split");
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>SPLIT</Text>
        </Pressable>
      </View>
      <View style={styles.buttonBackground}>
        <Pressable
          onPress={() => {
            navigation.navigate("Combine");
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>COMBINE</Text>
        </Pressable>
      </View>
      <Icon
        name="gear"
        size={40}
        color={colors.primary}
        style={{ position: "absolute", top: 40, right: 40 }}
        onPress={() => {
          navigation.navigate("Settings");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  bannerVideo: {
    flex: 3.1,
    width: "100%",
    alignSelf: "center",
    resizeMode: "contain",
  },
  title: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -120,
  },
  titleText: {
    fontSize: 85,
    fontFamily: "BebasNeue-Regular",
    color: colors.light,
  },
  subtitle: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  subtitleText: {
    fontSize: 30,
    fontFamily: "BebasNeue-Regular",
    color: colors.accent,
  },
  buttonBackground: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.dark,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    width: 200,
    backgroundColor: colors.accent,
  },
  buttonText: {
    fontSize: 21,
    lineHeight: 24,
    fontWeight: "bold",
    letterSpacing: 0.25,
    textAlign: "center",
    color: colors.primary,
  },
});
