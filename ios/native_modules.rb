# Custom native_modules.rb implementation for when @react-native-community/cli-platform-ios is missing
# or not properly installed.

def use_native_modules!(config = nil)
  puts "Using custom native_modules implementation"
  
  # Create a basic config if none is provided
  config = {}
  
  # Use a relative path from the Podfile's location
  config[:reactNativePath] = '../node_modules/react-native'
  
  # Verify the path exists (for debugging)
  react_native_path = File.join(File.dirname(__FILE__), config[:reactNativePath])
  package_json_path = File.join(react_native_path, 'package.json')
  
  if File.exist?(package_json_path)
    puts "Found React Native package.json at: #{package_json_path}"
  else
    puts "WARNING: React Native package.json not found at: #{package_json_path}"
    # Try alternate paths if needed
    alternate_path = File.expand_path('../../node_modules/react-native/package.json', __FILE__)
    if File.exist?(alternate_path)
      puts "Found React Native at alternate path: #{alternate_path}"
      config[:reactNativePath] = File.expand_path('../../node_modules/react-native', __FILE__)
    end
  end

  # Return the configuration with the correct path
  return config
end