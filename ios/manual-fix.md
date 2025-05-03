# Manual Fix for "Invalid character ';' in unquoted string" Error

The error you're seeing is caused by a very specific syntax issue in the project.pbxproj file. Since automated fixes may not be working properly, here's a step-by-step manual fix:

## 1. Open the project.pbxproj file in a text editor

```bash
cd ios/AARecoveryTracker.xcodeproj
nano project.pbxproj
# or use any text editor you prefer
```

## 2. Look for this specific section at the beginning of the file:

```
// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	;
	};
	objectVersion = 54;
```

## 3. Remove the extra semicolon

Change it to:

```
// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 54;
```

## 4. Save the file and try pod deintegrate again

This should fix the specific error you're seeing.

## 5. Generate a clean Podfile

After successfully running `pod deintegrate`, create a new Podfile with the following content:

```ruby
require_relative '../node_modules/react-native/scripts/react_native_pods'

platform :ios, '15.1'
install! 'cocoapods', :deterministic_uuids => false

# Force workspace creation
workspace 'AARecoveryTracker'

target 'AARecoveryTracker' do
  config = { :reactNativePath => "../node_modules/react-native" }
  
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )
  
  # Add SQLite explicitly
  pod 'react-native-sqlite-storage', :podspec => '../node_modules/react-native-sqlite-storage/react-native-sqlite-storage.podspec'
end
```

## 6. Run pod install

```bash
cd ios
pod install
```

This should install the pods successfully.