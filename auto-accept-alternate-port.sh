#!/bin/bash

# This script starts Expo with CI=1 environment variable
# We use port 3244 for Expo while 3243 is used for the bundle server
# This ensures the ports don't conflict

cd expo-app || exit 1
CI=1 npx expo start --web --port 3244 --host lan