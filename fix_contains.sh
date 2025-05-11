#!/bin/bash

# Files to fix
FILES=(
  "expo-app/node_modules/react-native/ReactCommon/reactperflogger/fusebox/FuseboxTracer.cpp"
  "expo-app/node_modules/react-native/ReactCommon/react/renderer/scheduler/SurfaceManager.cpp"
  "expo-app/node_modules/react-native/ReactCommon/react/renderer/observers/events/EventPerformanceLogger.cpp"
  "expo-app/node_modules/react-native/ReactCommon/react/bridging/tests/BridgingTest.cpp"
  "expo-app/node_modules/react-native/ReactCommon/react/performance/timeline/PerformanceObserver.cpp"
  "expo-app/node_modules/react-native/ReactAndroid/src/main/jni/react/fabric/FabricMountingManager.cpp"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Create a backup
    cp "$file" "$file.bak"
    
    # Replace .contains(x) with .find(x) != .end()
    sed -i '' 's/\([a-zA-Z0-9_]\+\)\.contains(\([^)]\+\))/\1.find(\2) != \1.end()/g' "$file"
    
    echo "Fixed: $file"
  else
    echo "Warning: File not found: $file"
  fi
done

echo "All files processed. You should now be able to build the project."
