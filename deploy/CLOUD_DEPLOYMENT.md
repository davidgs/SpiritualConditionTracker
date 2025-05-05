# Cloud Deployment Options for Spiritual Condition Tracker

This guide covers deploying your Spiritual Condition Tracker application to various cloud platforms.

## Table of Contents

1. [AWS Deployment](#aws-deployment)
2. [Google Cloud Deployment](#google-cloud-deployment)
3. [Azure Deployment](#azure-deployment)
4. [Heroku Deployment](#heroku-deployment)
5. [DigitalOcean Deployment](#digitalocean-deployment)
6. [Replit Deployment](#replit-deployment)

## AWS Deployment

### Using AWS Elastic Beanstalk

1. **Prerequisites**:
   - AWS account
   - AWS CLI installed and configured
   - EB CLI installed

2. **Setup**:
   ```bash
   # Initialize EB application
   eb init spiritual-condition-tracker
   
   # Create an environment
   eb create production
   
   # Deploy
   eb deploy
   ```

3. **Configuration**:
   Create a `.ebextensions/nodecommand.config` file:
   ```yaml
   option_settings:
     aws:elasticbeanstalk:container:nodejs:
       NodeCommand: "node deployment-server.js"
       NodeVersion: 18
     aws:elasticbeanstalk:application:environment:
       NODE_ENV: production
       PORT: 3000
       EXPO_PORT: 5001
       CI: 1
   ```

## Google Cloud Deployment

### Using Google Cloud Run

1. **Prerequisites**:
   - Google Cloud account
   - gcloud CLI installed and configured
   - Docker installed

2. **Build and Deploy**:
   ```bash
   # Build the Docker image
   docker build -t gcr.io/YOUR_PROJECT_ID/spiritual-condition-tracker -f deploy/Dockerfile .
   
   # Push to Google Container Registry
   docker push gcr.io/YOUR_PROJECT_ID/spiritual-condition-tracker
   
   # Deploy to Cloud Run
   gcloud run deploy spiritual-condition-tracker \
     --image gcr.io/YOUR_PROJECT_ID/spiritual-condition-tracker \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

## Azure Deployment

### Using Azure App Service

1. **Prerequisites**:
   - Azure account
   - Azure CLI installed and configured

2. **Deploy**:
   ```bash
   # Create a resource group
   az group create --name spiritual-condition-tracker --location eastus
   
   # Create an App Service plan
   az appservice plan create --name spiritual-condition-plan --resource-group spiritual-condition-tracker --sku B1
   
   # Create a web app
   az webapp create --name spiritual-condition-tracker --resource-group spiritual-condition-tracker --plan spiritual-condition-plan --runtime "NODE:18"
   
   # Configure environment variables
   az webapp config appsettings set --name spiritual-condition-tracker --resource-group spiritual-condition-tracker --settings NODE_ENV=production PORT=3000 EXPO_PORT=5001 CI=1
   
   # Deploy using local Git
   az webapp deployment source config-local-git --name spiritual-condition-tracker --resource-group spiritual-condition-tracker
   
   # Add Azure as a Git remote
   git remote add azure <git-url-from-previous-command>
   
   # Push to Azure
   git push azure main
   ```

## Heroku Deployment

1. **Prerequisites**:
   - Heroku account
   - Heroku CLI installed and logged in

2. **Setup**:
   Create a `Procfile` in the root directory:
   ```
   web: node deployment-server.js
   ```

3. **Deploy**:
   ```bash
   # Create a Heroku app
   heroku create spiritual-condition-tracker
   
   # Set environment variables
   heroku config:set NODE_ENV=production EXPO_PORT=5001 CI=1
   
   # Deploy to Heroku
   git push heroku main
   
   # Open the app
   heroku open
   ```

## DigitalOcean Deployment

### Using DigitalOcean App Platform

1. **Prerequisites**:
   - DigitalOcean account
   - doctl CLI installed and authenticated

2. **Setup**:
   Create an `app.yaml` file:
   ```yaml
   name: spiritual-condition-tracker
   services:
   - name: web
     github:
       repo: your-username/spiritual-condition-tracker
       branch: main
     build_command: npm ci --production
     run_command: node deployment-server.js
     envs:
     - key: NODE_ENV
       value: production
     - key: PORT
       value: 3000
     - key: EXPO_PORT
       value: 5001
     - key: CI
       value: 1
   ```

3. **Deploy**:
   ```bash
   doctl apps create --spec app.yaml
   ```

## Replit Deployment

1. **Prerequisites**:
   - Replit account

2. **Setup**:
   ```bash
   # Run the Replit deployment script
   ./deploy/replit-deploy.sh
   ```

3. **Deploy**:
   - Push your code to Replit
   - Click the "Deploy" button in the Replit interface
   - Your app will be available at: `https://your-repl-name.your-username.repl.co`