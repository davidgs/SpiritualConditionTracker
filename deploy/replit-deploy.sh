#!/bin/bash

# Replit deployment script for Spiritual Condition Tracker

echo "Starting Replit deployment setup for Spiritual Condition Tracker..."

# Create the necessary files for Replit deployment
cat > .replit <<EOL
run = "node deployment-server.js"
modules = ["nodejs-20:v8-20230920-bd784b9"]
hidden = [".config", "package-lock.json"]

[nix]
channel = "stable-22_11"

[env]
PATH = "/home/runner/$REPL_SLUG/.config/npm/node_global/bin:/home/runner/$REPL_SLUG/node_modules/.bin"
npm_config_prefix = "/home/runner/$REPL_SLUG/.config/npm/node_global"

[packager]
language = "nodejs"

[packager.features]
packageSearch = true
guessImports = true
enabledForHosting = false

[debugger]
support = true

[debugger.interactive]
transport = "localhost:0"
startCommand = ["dap-node"]

[debugger.interactive.initializeMessage]
command = "initialize"
type = "request"

[debugger.interactive.initializeMessage.arguments]
clientID = "replit"
clientName = "replit.com"
columnsStartAt1 = true
linesStartAt1 = true
locale = "en-us"
pathFormat = "path"
supportsInvalidatedEvent = true
supportsProgressReporting = true
supportsRunInTerminalRequest = true
supportsVariablePaging = true
supportsVariableType = true

[debugger.interactive.launchMessage]
command = "launch"
type = "request"

[debugger.interactive.launchMessage.arguments]
console = "externalTerminal"
cwd = "."
pauseForSourceMap = false
program = "./deployment-server.js"
request = "launch"
sourceMaps = true
stopOnEntry = false
type = "pwa-node"

[unitTest]
language = "nodejs"

[languages]

[languages.javascript]
pattern = "**/{*.js,*.jsx,*.ts,*.tsx}"

[languages.javascript.languageServer]
start = "typescript-language-server --stdio"

[deployment]
run = ["sh", "-c", "node deployment-server.js"]
deploymentTarget = "cloudrun"
ignorePorts = false
EOL

# Create a .gitignore for Replit deployment
cat > .gitignore <<EOL
node_modules
.env
.replit.nix
yarn-error.log
*.log
.upm
.config
.cache
dist
build
EOL

# Make the deployment server script executable
chmod +x deployment-server.js

echo "Replit deployment setup complete!"
echo "You can now deploy the application to Replit using the 'Deploy' button."
echo "The app will be served at: https://your-repl-name.your-username.repl.co"