# How to Generate an EAS Token

This guide walks you through the process of generating a new Expo Application Services (EAS) access token for building the Spiritual Condition Tracker app.

## What is an EAS Token?

An EAS token is a secure credential that allows automated systems (like CI/CD pipelines or development environments) to authenticate with Expo's build services without requiring interactive login.

## Steps to Generate a Token

1. **Log in to your Expo account**
   - Visit https://expo.dev/
   - Click "Sign In" in the top-right corner
   - Enter your credentials or create a new account if needed

2. **Navigate to Access Tokens**
   - After logging in, click on your profile picture in the top-right corner
   - Select "Settings" from the dropdown menu
   - In the left sidebar, click on "Access Tokens"

3. **Create a New Token**
   - Click the "Create" or "Create new token" button
   - Enter a descriptive name for the token (e.g., "Spiritual Condition Tracker Build")
   - Optionally, set an expiration date (or leave it as "Never expires" for permanent tokens)
   - Click "Create" to generate the token

4. **Copy and Save the Token**
   - **IMPORTANT**: The token will only be displayed once. Make sure to copy it immediately.
   - Store it securely as it provides full access to your Expo account

5. **Update the Project Environment**
   - Add the token to your project environment as `EXPO_TOKEN`
   - For this project, use the Replit secrets manager

## Using the Token in Replit

1. On the left sidebar of Replit, click on the "Secrets" tab (lock icon)
2. Click "New Secret"
3. Set the key as `EXPO_TOKEN`
4. Paste the token value you copied
5. Click "Save Secret"

## Verifying the Token

Once saved, you can verify the token works with:

```bash
EXPO_TOKEN=<your-token> npx eas whoami
```

If successful, it should display your Expo username.

## Security Best Practices

- Never share your token or commit it to version control
- Create tokens with the minimum permissions needed
- Rotate tokens regularly (create new ones and delete old ones)
- Use tokens with expiration dates for added security