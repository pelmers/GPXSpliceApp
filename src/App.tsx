import React from 'react';
import { StyleSheet, View, Pressable, Alert, Text } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { registerRootComponent } from 'expo';
import { colors } from './colors';

// Title page: autoplays banner.mp4 in top half of page, shows 2 buttons below that, centered
// button 1: split GPS file
// button 2: combine GPS files


export default function App() {
  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/banner.mp4')}
        style={styles.banner}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
      />
      <View style={styles.buttonBackground}>
        <Pressable
          onPress={() => {
            Alert.alert('split')
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>SPLIT</Text>
        </Pressable>
      </View>
      <View style={styles.buttonBackground}>
        <Pressable
          onPress={() => {
            Alert.alert('combine')
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>COMBINE</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  banner: {
    flex: 2,
    width: '100%',
  },
  buttonBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.dark,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: colors.accent,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    textAlign: 'center',
    color: colors.primary,
  },
});

registerRootComponent(App);