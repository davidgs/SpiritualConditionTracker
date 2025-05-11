# This file overrides React Native's codegen utilities
# to prevent the problematic codegen from running

# Empty implementation to skip codegen
def get_react_codegen_spec(options={})
  folly_version = '2020.01.13.00'
  folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'
  boost_compiler_flags = '-Wno-documentation'
  
  spec = {
    'name' => 'React-Codegen',
    'version' => '0.0.1',
    'summary' => 'Temp pod for generated files for React Native',
    'homepage' => 'https://facebook.com/',
    'license' => 'Placeholder',
    'source' => { :git => 'https://github.com/facebook/react-native.git' },
    'platforms' => {
      'ios' => '16.0',
    },
    'source_files' => 'React/Dummy/File/Does/Not/Exist.h',
    'dependencies' => {
      'React-Core' => [],
    },
    'compiler_flags' => "#{folly_compiler_flags} #{boost_compiler_flags}",
  }
  
  return spec
end

# Empty implementation to skip codegen execution
def use_react_native_codegen!(spec, options={})
  return spec
end

# Empty implementation to skip codegen script
def get_codegen_config_from_project_file()
  return {}
end

# Empty implementation to skip codegen execution
def use_react_native_codegen_discovery!(options={})
  return
end