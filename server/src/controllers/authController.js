import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) =>
  jwt.sign({
    id
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role
});
const cookieOptions = () => `HttpOnly; SameSite=Lax; Path=/; Max-Age=600${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
const readCookie = (req, name) => Object.fromEntries((req.headers.cookie || '').split(';').map((item) => item.trim().split('=')))[name];

const oauthConfig = {
  google: {
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'openid email profile'
  },
  github: {
    clientId: () => process.env.GITHUB_CLIENT_ID,
    clientSecret: () => process.env.GITHUB_CLIENT_SECRET,
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scope: 'read:user user:email'
  }
};

const clientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
const callbackUrl = (provider) => `${(process.env.SERVER_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/auth/${provider}/callback`;
const redirectWithError = (res, message) => res.redirect(`${clientUrl()}/auth/callback#error=${encodeURIComponent(message)}`);
const redirectWithSession = (res, user) => {
  const params = new URLSearchParams({
    token: signToken(user._id),
    user: JSON.stringify(publicUser(user))
  });
  res.redirect(`${clientUrl()}/auth/callback#${params.toString()}`);
};

const generateUsername = async (base) => {
  const normalized = (base || 'developer').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 18) || 'developer';
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `${normalized.slice(0, 14)}${crypto.randomBytes(3).toString('hex')}`;
    if (!(await User.exists({
        username: candidate
      }))) return candidate;
  }
  throw new Error('Unable to create a unique username');
};

const getProviderProfile = async (provider, accessToken) => {
  if (provider === 'google') {
    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const profile = await response.json();
    if (!response.ok || !profile.sub || !profile.email || !profile.email_verified) throw new Error('Google did not provide a verified email address');
    return {
      id: profile.sub,
      email: profile.email.toLowerCase(),
      name: profile.name || profile.email.split('@')[0],
      username: profile.email.split('@')[0]
    };
  }

  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'developer-learning-platform'
    }
  });
  const profile = await response.json();
  if (!response.ok || !profile.id) throw new Error('Unable to read your GitHub profile');
  const emailResponse = await fetch('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'developer-learning-platform'
    }
  });
  const emails = await emailResponse.json();
  const email = Array.isArray(emails) && emails.find((item) => item.primary && item.verified) || (Array.isArray(emails) && emails.find((item) => item.verified));
  if (!email?.email) throw new Error('GitHub must provide a verified email address to create an account');
  return {
    id: String(profile.id),
    email: email.email.toLowerCase(),
    name: profile.name || profile.login || email.email.split('@')[0],
    username: profile.login || email.email.split('@')[0]
  };
};

export const login = async (req, res) => {
  const {
    email,
    password,
    loginAs = 'user'
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    });
  }

  const user = await User.findOne({
    email
  });
  if (!user || !user.password || !(await user.matchPassword(password))) {
    return res.status(401).json({
      message: 'Invalid email or password'
    });
  }
  if (loginAs === 'admin' && user.role !== 'admin') return res.status(403).json({
    message: 'This account does not have administrator access'
  });

  res.json({
    token: signToken(user._id),
    user: publicUser(user)
  });
};

export const signup = async (req, res) => {
  const {
    name,
    username,
    email,
    password
  } = req.body;
  if (!name || !username || !email || !password) return res.status(400).json({
    message: 'Name, username, email and password are required'
  });
  if (password.length < 8) return res.status(400).json({
    message: 'Password must be at least 8 characters'
  });
  const exists = await User.findOne({
    $or: [{
      email: email.toLowerCase()
    }, {
      username: username.toLowerCase()
    }]
  });
  if (exists) return res.status(409).json({
    message: 'An account with that email or username already exists'
  });
  const user = await User.create({
    name,
    username,
    email,
    password
  });
  res.status(201).json({
    token: signToken(user._id),
    user: publicUser(user)
  });
};

export const startOAuth = (req, res) => {
  const {
    provider
  } = req.params;
  const config = oauthConfig[provider];
  if (!config) return res.status(404).json({
    message: 'Unknown sign-in provider'
  });
  if (!config.clientId() || !config.clientSecret()) return res.status(503).json({
    message: `${provider === 'google' ? 'Google' : 'GitHub'} sign-in is not configured yet`
  });
  const state = crypto.randomBytes(32).toString('hex');
  res.setHeader('Set-Cookie', `oauth_state=${state}; ${cookieOptions()}`);
  const params = new URLSearchParams({
    client_id: config.clientId(),
    redirect_uri: callbackUrl(provider),
    response_type: 'code',
    scope: config.scope,
    state
  });
  res.redirect(`${config.authorizationUrl}?${params.toString()}`);
};

export const oauthCallback = async (req, res, next) => {
  const {
    provider
  } = req.params;
  const config = oauthConfig[provider];
  if (!config) return redirectWithError(res, 'Unknown sign-in provider');
  try {
    const expectedState = readCookie(req, 'oauth_state');
    res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
    if (!req.query.code || !expectedState || !req.query.state || !crypto.timingSafeEqual(Buffer.from(expectedState), Buffer.from(req.query.state))) return redirectWithError(res, 'Your sign-in session expired. Please try again.');
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: config.clientId(),
        client_secret: config.clientSecret(),
        redirect_uri: callbackUrl(provider),
        grant_type: 'authorization_code'
      })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) throw new Error('The provider could not complete sign-in');
    const profile = await getProviderProfile(provider, tokenData.access_token);
    let user = await User.findOne({
      providers: {
        $elemMatch: {
          provider,
          providerId: profile.id
        }
      }
    });
    if (!user) {
      user = await User.findOne({
        email: profile.email
      });
      if (user) {
        user.providers.push({
          provider,
          providerId: profile.id
        });
        await user.save();
      } else {
        user = await User.create({
          name: profile.name,
          username: await generateUsername(profile.username),
          email: profile.email,
          providers: [{
            provider,
            providerId: profile.id
          }]
        });
      }
    }
    redirectWithSession(res, user);
  } catch (error) {
    if (error.message) return redirectWithError(res, error.message);
    next(error);
  }
};

export const me = async (req, res) => {
  res.json({
    user: req.user
  });
};