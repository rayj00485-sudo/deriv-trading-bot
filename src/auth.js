import fetch from 'node-fetch';
import crypto from 'crypto';

const DERIV_AUTH_URL = 'https://auth.deriv.com/oauth2';

/**
 * Generate PKCE code verifier and challenge
 */
export function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  return { codeVerifier, codeChallenge };
}

/**
 * Generate OAuth2 authorization URL
 */
export function getAuthorizationURL(clientId, redirectUri, codeChallenge, state) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'trade',
    state: state || crypto.randomBytes(16).toString('hex'),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `${DERIV_AUTH_URL}/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  clientId,
  code,
  codeVerifier,
  redirectUri
) {
  const payload = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code: code,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
  });

  try {
    const response = await fetch(`${DERIV_AUTH_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('OAuth2 error:', error.message);
    throw error;
  }
}

/**
 * Get WebSocket OTP URL for authenticated connection
 */
export async function getOTPURL(accountId, appId, accessToken) {
  try {
    const response = await fetch(
      `https://api.derivws.com/trading/v1/options/accounts/${accountId}/otp`,
      {
        method: 'POST',
        headers: {
          'Deriv-App-ID': appId,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get OTP: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data || !data.data.url) {
      throw new Error('Invalid OTP response');
    }

    return data.data.url;
  } catch (error) {
    console.error('OTP error:', error.message);
    throw error;
  }
}
