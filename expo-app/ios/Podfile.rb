# Patch to disable React Native new architecture and ensure JSC is used
ENV['RCT_NEW_ARCH_ENABLED'] = '0'
ENV['USE_HERMES'] = '0'

# This patch will be loaded by the Podfile and will modify how React Native is configured
module ReactNativePodsFix
  def use_react_native!(options={})
    # Force disable Fabric and Hermes regardless of what was passed
    options[:fabric_enabled] = false
    options[:hermes_enabled] = false
    
    # Call the original method with our modified options
    super(options)
  end
end

# Monkey patch the Podfile class to include our modifications
class Pod::Podfile
  prepend ReactNativePodsFix
end

# Print a message to confirm this patch was loaded
puts "Loaded Podfile.rb patch to disable Fabric and Hermes"