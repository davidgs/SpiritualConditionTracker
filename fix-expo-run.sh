#!/bin/bash
# Script to fix the "--no-build" issue with expo run:ios
# Run this before prepare-ios-build.sh

# Make scripts executable
chmod +x fix-agent-base.sh
chmod +x fix-buildcache-exact.sh

# Run our preparatory fix scripts
./fix-agent-base.sh
./fix-buildcache-exact.sh

echo "Checking for main.jsbundle in Xcode project..."
if [ ! -f "ios/assets/main.jsbundle" ]; then
  echo "WARNING: main.jsbundle was not generated. This may cause runtime errors."
  
  # Create minimal bundle if needed
  echo "Creating minimal bundle..."
  mkdir -p ios/assets
  cat > ios/assets/main.jsbundle << 'EOF'
/**
 * Minimal bundle for iOS that displays an error message
 * Created by fix-expo-run.sh
 */
__d(function(g,r,i,a,m,e,d){var t=r(d[0]);Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(){return t.createElement("view",{style:{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"#F8F8F8"}},t.createElement("text",{style:{fontSize:18,color:"#E53935",textAlign:"center",margin:10}},"JavaScript Bundle Loading Error"),t.createElement("text",{style:{fontSize:14,color:"#333333",textAlign:"center",margin:10}},"The JavaScript bundle could not be loaded.\\n\\nPlease check the build configuration."))};var n=t},0,[1]);
__d(function(g,r,i,a,m,e,d){"use strict";m.exports=r(d[0])},1,[2]);
__d(function(g,r,i,a,m,e,d){"use strict";m.exports=r(d[0])},2,[3]);
__d(function(g,r,i,a,m,e,d){"use strict";m.exports={createElement:function(e,t){return{type:e,props:t}}}},3,[]);
require(0);
EOF
  echo "Created minimal bundle at: ios/assets/main.jsbundle"
fi

echo "All fixes applied. You should now be able to run prepare-ios-build.sh without errors."