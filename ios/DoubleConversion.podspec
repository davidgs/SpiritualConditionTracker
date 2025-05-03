Pod::Spec.new do |spec|
  spec.name = 'DoubleConversion'
  spec.version = '1.1.6'
  spec.license = { :type => 'MIT' }
  spec.homepage = 'https://github.com/google/double-conversion'
  spec.summary = 'Efficient binary-decimal and decimal-binary conversion routines for IEEE doubles'
  spec.authors = 'Google'
  spec.source = { :git => 'https://github.com/google/double-conversion.git',
                  :tag => "v#{spec.version}" }
  spec.module_name = 'DoubleConversion'
  spec.header_dir = 'double-conversion'
  
  # Use the local files we just copied
  spec.source_files = 'DoubleConversion/double-conversion/*.{h,cc}'
  
  spec.compiler_flags = '-Wno-unreachable-code'
  spec.platforms = { :ios => "15.1" }
  
  # Add these to avoid build errors
  spec.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++14',
    'HEADER_SEARCH_PATHS' => '$(PODS_TARGET_SRCROOT)'
  }
end
