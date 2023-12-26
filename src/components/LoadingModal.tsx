import React from "react";
import { StyleSheet, View, Modal, ActivityIndicator } from "react-native";

import { colors } from "../utils/colors";

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
