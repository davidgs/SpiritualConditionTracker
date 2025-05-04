# EAS Token Troubleshooting

If you're experiencing issues with your EAS token, this guide will help identify and solve common problems.

## Token Format Issues

### Correct Format

A valid EAS API token typically follows this format:
- Should be a long string
- Usually contains a mix of letters, numbers, and possibly symbols
- Typically much longer than 20 characters

The token `tybkam-0huztu-xeXquj` appears to be shorter than typical EAS tokens, which might indicate it's not a complete token or might be in a different format than what EAS expects.

## Common Token Issues

1. **Token Expiration**: Tokens can expire, especially if they were created with an expiration date.

2. **Token Revocation**: Tokens might have been revoked from the Expo dashboard.

3. **Incorrect Token Format**: Make sure the token was copied completely (some token displays cut off part of the token if it's very long).

4. **Token Permissions**: The token might not have the necessary permissions for building apps.

## How to Generate a New Token

To generate a fresh token:

1. Go to [https://expo.dev/accounts/[your-username]/settings/access-tokens](https://expo.dev/accounts/[your-username]/settings/access-tokens)

2. Click "Create a token"

3. Give it a descriptive name like "Spiritual Condition Tracker Build"

4. Set the appropriate expiration (or "No expiration" for a permanent token)

5. Copy the ENTIRE token immediately after creation (it will not be shown again)

## Testing Your Token

Once you have a new token, test it with:

```bash
EXPO_TOKEN=your-new-token npx eas whoami
```

If successful, it will show your Expo username.

## Interactive Login Alternative

If you continue to have token issues, you can try the interactive login method:

```bash
npx eas login
```

This will open a browser window for authentication. After logging in, you should be able to run EAS commands without needing a separate token.