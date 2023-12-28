import Toast from "react-native-toast-message";

export function successToast(message: string) {
  Toast.show({
    type: "success",
    position: "bottom",
    text1: "Success",
    text2: message,
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 30,
    bottomOffset: 40,
  });
}
