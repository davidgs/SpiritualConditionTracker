#!/bin/bash

# This script starts Expo with CI=1 environment variable
# to automatically accept alternate port when port is in use

cd expo-app || exit 1
CI=1 npx expo start --web --port 3243 --host lan