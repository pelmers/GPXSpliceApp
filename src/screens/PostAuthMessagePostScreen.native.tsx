import React from "react";
import { View, Text } from "react-native";

// The native version of this screen should be unreachable.

const PostAuthMessagePostScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Unreachable state reached: this screen should not be visible.</Text>
    </View>
  );
};

export default PostAuthMessagePostScreen;
