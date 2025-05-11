Pod::Spec.new do |s|
  s.name         = "ReactAppDependencyProvider"
  s.version      = "0.0.1"
  s.summary      = "Empty podspec for ReactAppDependencyProvider"
  s.description  = "Empty dummy implementation to satisfy dependencies"
  s.homepage     = "https://facebook.github.io/react-native/"
  s.license      = "MIT"
  s.author       = "Facebook, Inc. and its affiliates"
  s.platforms    = { :ios => "16.0" }
  s.source       = { :git => "https://github.com/facebook/react-native.git" }
  s.source_files = "Empty.{h,m}"

  # Create an empty header/implementation file to satisfy CocoaPods
  File.open(File.join(File.dirname(__FILE__), 'Empty.h'), 'w') do |f| 
    f.write("// Empty header file\n")
  end

  File.open(File.join(File.dirname(__FILE__), 'Empty.m'), 'w') do |f|
    f.write("// Empty implementation file\n")
  end
end