import { Platform } from "react-native";
import * as ExpoFileSystem from "expo-file-system";

const inMemoryStorage = new Map<string, string>();

const FileSystem =
  Platform.OS === "web"
    ? {
        cacheDirectory: "MemoryStorageCache",
        documentDirectory: "MemoryStorageDocs",
        writeAsStringAsync: async (uri: string, contents: string) => {
          inMemoryStorage.set(uri, contents);
        },
        readAsStringAsync: async (uri: string) => {
          const fileContents = inMemoryStorage.get(uri);
          if (fileContents === undefined) {
            throw new Error(`No file found at ${uri}`);
          }
          return fileContents;
        },
        // Add other methods as needed
      }
    : ExpoFileSystem;

export default FileSystem;
