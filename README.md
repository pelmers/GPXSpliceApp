# GPX Splice

[![Logo](assets/icon.png)](https://gpx.pelmers.com/)

### The _easy_ way to split and combine your GPX files and Strava activities, from your phone!

![](examples/gpx_splice_split_demo.gif)

## Features

- Support GPX files and Strava activities
- Split GPX files into multiple files
- Combine multiple GPX files into one
- Full mapping visualization and interactive stats charts
- Settings for metric and imperial units
- All processing stays on your phone

## Examples

![](examples/examples1.png)

_above:_ **Title screen and Strava authentication**

![](examples/examples2.png)

_above:_ **Activity list and split map view**

## Development

This app is written in React Native using the [Expo](https://expo.io/) framework.

See **[my blog post](https://pelmers.com/TODO_LINK)** for a full technical writeup.

- `yarn ios` to run in the iOS simulator
- `yarn android` to run in the Android emulator

> To show maps on Android, you need a Google Maps API key.
> Create a file named `.env.local` with the line `GOOGLE_MAPS_API_KEY=your_key_here`.

**Code**:
Look at [src/App.tsx](src/App.tsx) for the main app entrypoint.
All screens are contained in [src/screens](src/screens), and other UI components are in [src/components](src/components).

## Future work

- Support for web platform so you can use it as a website
- Direct upload of results to Strava
- Multiple split points (though you can do this today by doing split multiple times)
- Look for other TODO in the codebase
