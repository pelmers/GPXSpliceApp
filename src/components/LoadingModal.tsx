import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Alert,
  Image,
  Modal,
  Text,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as AuthSession from "expo-auth-session";

import { colors } from "../utils/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../routes";
import {
  StravaActivity,
  StravaAthlete,
  fetchStravaActivities,
  fetchStravaActivityGpx,
} from "../types/strava";
import { StravaActivityRow } from "../components/StravaActivityRow";

export function LoadingModal(props: { visible: boolean }) {
  return (
    <Modal animationType="fade" transparent={true} visible={props.visible}>
      <View style={styles.centeredView}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
