import { AuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { JWT } from 'next-auth/jwt';
import jwt from 'jsonwebtoken';

const isEmptyOrWhiteSpace = (input: string | undefined) => {
    return !input || input.trim() === '';
};

const keycloakEnabled = (process.env.KEYCLOAK_ENABLED || 'false').toLowerCase() === 'true'.toLowerCase();
const keycloakLocalUrl = process.env.KEYCLOAK_LOCAL_URL;
const keycloakIssuer = process.env.KEYCLOAK_ISSUER;
const serverUrlFromConfig = isEmptyOrWhiteSpace(keycloakLocalUrl) ? keycloakIssuer : keycloakLocalUrl;
const realm = process.env.KEYCLOAK_REALM;
const requestedResource = process.env.APPLICATION_ID_URI?.endsWith('/')
    ? process.env.APPLICATION_ID_URI
    : `${process.env.APPLICATION_ID_URI}/`;

export const authOptions: AuthOptions = {
    providers: [
        ...(keycloakEnabled
            ? [
                  KeycloakProvider({
                      clientId: process.env.KEYCLOAK_CLIENT_ID ?? '',
                      clientSecret: '-', // not required by the AuthFlow but required by NextAuth Provider, here placeholder only
                      issuer: `${keycloakIssuer}/realms/${realm}`,
                      authorization: {
                          params: {
                              scope: 'openid email profile',
                          },
                          url: `${serverUrlFromConfig}/realms/${realm}/protocol/openid-connect/auth`,
                      },
                      token: `${keycloakIssuer}/realms/${realm}/protocol/openid-connect/token`,
                      userinfo: `${keycloakIssuer}/realms/${realm}/protocol/openid-connect/userinfo`,
                  }),
              ]
            : [
                  AzureADProvider({
                      clientId: process.env.AD_CLIENT_ID ?? '',
                      clientSecret: process.env.AD_SECRET_VALUE ?? '',
                      tenantId: process.env.AD_TENANT_ID,
                      authorization: { params: { scope: `openid ${requestedResource}admin.write offline_access` } },
                  }),
              ]),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, account }) {
            let roles = null;
            let userName: string | null = null;

            const nowTimeStamp = Math.floor(Date.now() / 1000);

            if (account) {
                token.access_token = account.access_token;
                token.id_token = account.id_token;
                token.expires_at = account.expires_at;
                token.refresh_token = account.refresh_token;

                // The roles are stored inside the id_token
                if (account.id_token) {
                    const decodedToken = jwt.decode(account.id_token);
                    if (decodedToken) {
                        if (account.provider === 'azure-ad' && account.access_token) {
                            // Entra ID stores the username only in the access_token
                            const decodedAccessToken = jwt.decode(account.access_token);
                            // @ts-expect-error name exits
                            userName = decodedAccessToken.name;
                        }
                        // @ts-expect-error role exits
                        roles = decodedToken.roles;
                    }
                }

                // Store Roles inside token
                return { ...token, roles: roles, ad_name: userName };
            } else if (nowTimeStamp < (token.expires_at as number)) {
                return token;
            }

            try {
                console.warn('Refreshing access token...');
                if (keycloakEnabled) {
                    return await refreshAccessToken(token);
                } else {
                    return await refreshAzureADToken(token);
                }
            } catch (error) {
                console.error('Error refreshing access token', error);
                return { ...token, error: 'RefreshAccessTokenError' };
            }
        },
        async session({ session, token }) {
            session.accessToken = token.access_token as string;
            session.idToken = token.id_token as string;
            session.user.roles = token.roles as string[];
            // Azure Entra ID:
            if (token.ad_name) {
                session.user.name = token.ad_name as string;
            }
            return session;
        },
    },
};

const refreshAccessToken = async (token: JWT) => {
    const resp = await fetch(`${keycloakIssuer}/realms/${realm}/protocol/openid-connect/token`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.KEYCLOAK_CLIENT_ID ?? '',
            client_secret: '-', // placeholder
            grant_type: 'refresh_token',
            refresh_token: token.refresh_token as string,
        }),
        method: 'POST',
    });
    const refreshToken = await resp.json();
    if (!resp.ok) throw refreshToken;

    return {
        ...token,
        access_token: refreshToken.access_token,
        id_token: refreshToken.id_token,
        expires_at: Math.floor(Date.now() / 1000) + refreshToken.expires_in,
        refresh_token: refreshToken.refresh_token,
    };
};

const refreshAzureADToken = async (token: JWT) => {
    const response = await fetch(`https://login.microsoftonline.com/${process.env.AD_TENANT_ID}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: process.env.AD_CLIENT_ID ?? '',
            client_secret: process.env.AD_SECRET_VALUE ?? '',
            grant_type: 'refresh_token',
            refresh_token: token.refresh_token as string,
            scope: `openid ${requestedResource}admin.write offline_access`,
        }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
        console.error('Error refreshing Azure AD token', refreshedTokens);
        throw new Error(`Failed to refresh token: ${refreshedTokens.error_description || 'An error occurred'}`);
    }

    return {
        ...token,
        access_token: refreshedTokens.access_token,
        id_token: refreshedTokens.id_token,
        expires_at: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
        refresh_token: refreshedTokens.refresh_token ?? token.refresh_token, // Fallback to old refresh token if not provided
    };
};
