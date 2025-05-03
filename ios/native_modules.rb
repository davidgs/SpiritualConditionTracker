# Custom native_modules.rb implementation for when @react-native-community/cli-platform-ios is missing
# or not properly installed.

def use_native_modules!(config = nil)
  puts "Using custom native_modules implementation"
  
  # Create a basic config if none is provided
  config = {}
  config[:reactNativePath] = File.join(File.dirname(__FILE__), '../node_modules/react-native')

  # Define pod specs for each native module
  pod_specs = []

  # Core React Native libraries
  pod_specs << {
    'name' => 'React-RCTActionSheet',
    'path' => "#{config[:reactNativePath]}/Libraries/ActionSheetIOS"
  }
  
  pod_specs << {
    'name' => 'React-RCTAnimation',
    'path' => "#{config[:reactNativePath]}/Libraries/NativeAnimation"
  }
  
  pod_specs << {
    'name' => 'React-RCTBlob',
    'path' => "#{config[:reactNativePath]}/Libraries/Blob"
  }
  
  pod_specs << {
    'name' => 'React-RCTImage',
    'path' => "#{config[:reactNativePath]}/Libraries/Image"
  }
  
  pod_specs << {
    'name' => 'React-RCTLinking',
    'path' => "#{config[:reactNativePath]}/Libraries/LinkingIOS"
  }
  
  pod_specs << {
    'name' => 'React-RCTNetwork',
    'path' => "#{config[:reactNativePath]}/Libraries/Network"
  }
  
  pod_specs << {
    'name' => 'React-RCTSettings',
    'path' => "#{config[:reactNativePath]}/Libraries/Settings"
  }
  
  pod_specs << {
    'name' => 'React-RCTText',
    'path' => "#{config[:reactNativePath]}/Libraries/Text"
  }
  
  pod_specs << {
    'name' => 'React-RCTVibration',
    'path' => "#{config[:reactNativePath]}/Libraries/Vibration"
  }

  # Return the configuration
  return config
end