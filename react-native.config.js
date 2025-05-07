module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/assets'],
  // Using default configurations for all libraries
  dependencies: {
    "react-native-sqlite-storage": {
      platforms: {
        ios: {
          project: "src/database/platforms/SQLite.xcodeproj",
          sourceDir: "src/database/platforms/ios",
          podspecPath: "node_modules/react-native-sqlite-storage/react-native-sqlite-storage.podspec"
        },
        android: {
          sourceDir: "src/database/platforms/android",
          implementationPath: "expo-app/src/database/platforms/android/src/main/java/org/pgsqlite/SQLitePluginPackage.java",
          packageImportPath: "import org.pgsqlite.SQLitePluginPackage;",
          packageInstance: "new SQLitePluginPackage()"
        }
      }
    }
  }
};