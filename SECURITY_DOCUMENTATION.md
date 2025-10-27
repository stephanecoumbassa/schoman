# 🔐 Schoman Security & 2FA Documentation

## 🎯 Overview

Schoman now includes comprehensive security features including Two-Factor Authentication (2FA), security headers, input sanitization, and enhanced authentication controls.

## ✨ Security Features Implemented

### 1. Two-Factor Authentication (2FA) ✅

Complete TOTP-based 2FA implementation without external dependencies.

#### Features
- ✅ **TOTP Authentication** - Time-based One-Time Passwords compatible with Google Authenticator, Authy, etc.
- ✅ **QR Code Generation** - Easy setup by scanning QR code
- ✅ **Backup Codes** - 10 one-time backup codes for account recovery
- ✅ **Secure Storage** - Secrets stored encrypted, backup codes hashed
- ✅ **User-Controlled** - Users can enable/disable 2FA
- ✅ **Login Integration** - 2FA verification during login

#### API Endpoints

**Get 2FA Status**
```
GET /api/2fa/status
Authorization: Bearer <token>
```

**Enable 2FA**
```
POST /api/2fa/enable
Authorization: Bearer <token>

Response:
{
  "secret": "BASE32SECRET",
  "qrCodeUrl": "https://api.qrserver.com/...",
  "instructions": "..."
}
```

**Verify & Confirm 2FA Setup**
```
POST /api/2fa/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "123456"
}

Response:
{
  "message": "2FA enabled successfully",
  "backupCodes": ["CODE1", "CODE2", ...],
  "warning": "Save these backup codes..."
}
```

**Verify 2FA During Login**
```
POST /api/2fa/verify-login
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "123456",
  "isBackupCode": false
}
```

**Disable 2FA**
```
POST /api/2fa/disable
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "yourpassword",
  "token": "123456"
}
```

**Regenerate Backup Codes**
```
POST /api/2fa/regenerate-backup-codes
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "123456"
}
```

### 2. Security Headers ✅

Essential HTTP security headers applied to all responses.

#### Headers Applied
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Strict-Transport-Security` - Enforces HTTPS
- `Referrer-Policy` - Controls referrer information
- `Content-Security-Policy` - Prevents XSS and injection attacks
- `Permissions-Policy` - Limits browser features

### 3. Input Sanitization ✅

Automatic sanitization of all user inputs to prevent XSS attacks.

#### Protected Against
- Cross-Site Scripting (XSS)
- HTML injection
- Script injection
- SQL injection patterns

### 4. Rate Limiting ✅

Already implemented in Phase 2:
- API rate limiting (100 requests/15 minutes)
- Auth rate limiting (5 requests/15 minutes)
- Upload rate limiting (10 requests/15 minutes)
- Export rate limiting (20 requests/15 minutes)

### 5. Login Attempt Tracking ✅

Tracks and limits failed login attempts by IP address.

#### Features
- Maximum 5 failed attempts per IP
- 15-minute cooldown period
- Automatic reset on successful login
- Protection against brute force attacks

### 6. Password Strength Validation ✅

Enforces strong password requirements.

#### Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## 🚀 Usage Guide

### For Users

#### Setting Up 2FA

1. **Login** to your account
2. **Navigate** to Settings/Security
3. **Click** "Enable 2FA"
4. **Scan** QR code with your authenticator app (Google Authenticator, Authy, etc.)
5. **Enter** the 6-digit code to verify
6. **Save** the backup codes in a safe place

#### Using Backup Codes

If you lose access to your authenticator app:
1. **Enter** your backup code instead of TOTP code
2. Each backup code can only be used once
3. **Regenerate** new backup codes after using them

### For Developers

#### Implementing 2FA in Login Flow

```typescript
// Step 1: Regular login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// If 2FA is enabled, user receives:
{
  "requires2FA": true,
  "message": "2FA verification required"
}

// Step 2: Verify 2FA
POST /api/2fa/verify-login
{
  "email": "user@example.com",
  "token": "123456"
}

// Success: Returns JWT token
```

#### Checking 2FA Status

```typescript
import { get2FAStatus } from '@/services/twoFactorService';

const status = await get2FAStatus();
console.log(status.enabled); // true/false
console.log(status.backupCodesRemaining); // 10
```

#### Password Strength Validation

```typescript
import { validatePasswordStrength } from '@/middleware/security';

const result = validatePasswordStrength('MyPassword123!');
if (!result.valid) {
  console.log(result.errors); // Array of error messages
}
```

## 🔧 Configuration

### Environment Variables

No additional environment variables required. All security features work out of the box.

### Optional Configuration

```env
# Session configuration (for CSRF protection)
SESSION_SECRET=your_session_secret_here

# JWT configuration (already exists)
JWT_SECRET=your_jwt_secret_here
```

## 📊 Database Schema Updates

### User Model

New fields added:
```typescript
{
  twoFactorEnabled: Boolean,
  twoFactorSecret: String (encrypted, not returned by default),
  twoFactorBackupCodes: [String] (hashed, not returned by default)
}
```

## 🎨 Frontend Integration

### 2FA Setup Component Example

```vue
<template>
  <div class="2fa-setup">
    <h2>Enable Two-Factor Authentication</h2>
    
    <div v-if="!secret">
      <button @click="enable2FA">Enable 2FA</button>
    </div>
    
    <div v-else-if="!verified">
      <img :src="qrCodeUrl" alt="QR Code" />
      <p>Scan with your authenticator app</p>
      
      <input v-model="token" placeholder="Enter 6-digit code" />
      <button @click="verify2FA">Verify</button>
    </div>
    
    <div v-else>
      <h3>Backup Codes</h3>
      <p>Save these codes in a safe place:</p>
      <ul>
        <li v-for="code in backupCodes" :key="code">{{ code }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '@/services/api';

const secret = ref('');
const qrCodeUrl = ref('');
const token = ref('');
const verified = ref(false);
const backupCodes = ref<string[]>([]);

const enable2FA = async () => {
  const response = await api.post('/api/2fa/enable');
  secret.value = response.data.secret;
  qrCodeUrl.value = response.data.qrCodeUrl;
};

const verify2FA = async () => {
  const response = await api.post('/api/2fa/verify', { token: token.value });
  backupCodes.value = response.data.backupCodes;
  verified.value = true;
};
</script>
```

## 🔒 Security Best Practices

### For Developers

1. **Never log secrets** - 2FA secrets should never appear in logs
2. **Use HTTPS** - Always use HTTPS in production
3. **Secure storage** - Backup codes are hashed before storage
4. **Rate limiting** - Already implemented for all endpoints
5. **Input validation** - Always validate on both client and server

### For System Administrators

1. **Enforce 2FA** - Consider requiring 2FA for admin accounts
2. **Monitor logs** - Watch for suspicious login patterns
3. **Regular backups** - Backup user 2FA settings
4. **Security updates** - Keep dependencies updated
5. **Access control** - Use role-based access control

## 📈 Security Metrics

### Implementation Statistics
- **Files Created:** 5 (security, 2FA service, controller, routes, docs)
- **Security Headers:** 7 headers applied
- **Authentication Factors:** 2 (password + TOTP/backup code)
- **Backup Codes:** 10 per user
- **TOTP Window:** 30 seconds ± 1 window (90 seconds total)
- **Password Requirements:** 5 rules enforced

### Coverage
- ✅ Authentication security
- ✅ Authorization controls
- ✅ Input sanitization
- ✅ Output encoding
- ✅ Session management
- ✅ Rate limiting
- ✅ Security headers
- ✅ CSRF protection framework
- ✅ 2FA implementation

## 🚨 Incident Response

### If 2FA Device is Lost

Users can:
1. Use backup codes to login
2. Disable 2FA and re-enable with new device
3. Contact admin if all backup codes used

Admins can:
1. Manually disable 2FA for user in database
2. User must setup 2FA again after login

### If Backup Codes are Lost

Users should:
1. Login with authenticator app
2. Regenerate new backup codes
3. Store new codes securely

## 📚 References

- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)

---

## 🔄 JWT Token Management & Rotation

### JWT Architecture

Schoman utilizes JSON Web Tokens (JWT) for secure, stateless authentication.

#### Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "admin",
    "school": "507f191e810c19729de860ea",
    "iat": 1699876543,
    "exp": 1700481343
  },
  "signature": "HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret)"
}
```

### Token Security Best Practices

#### 1. Token Expiration

**Current Implementation:**
- Access Token: 7 days (configurable via `JWT_EXPIRES_IN`)
- Refresh Token: Not yet implemented (recommended)

**Recommended Configuration:**
```env
# Short-lived access tokens
JWT_ACCESS_TOKEN_EXPIRES_IN=15m

# Long-lived refresh tokens
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
```

#### 2. Token Refresh Strategy

**Implementation Plan:**

```typescript
// backend/src/controllers/authController.ts

/**
 * Refresh JWT access token
 * POST /api/auth/refresh
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token is required' });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

    // Check if refresh token exists in database (whitelist approach)
    const storedToken = await RefreshToken.findOne({
      userId: decoded.userId,
      token: refreshToken,
      revoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        school: user.school,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );

    // Update refresh token last used
    storedToken.lastUsedAt = new Date();
    await storedToken.save();

    res.json({
      success: true,
      accessToken: newAccessToken,
      expiresIn: '15m',
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid refresh token' });
    } else if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Refresh token expired' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

/**
 * Revoke refresh token (logout)
 * POST /api/auth/revoke
 */
export async function revokeRefreshToken(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    const userId = req.user.userId;

    if (refreshToken) {
      // Revoke specific token
      await RefreshToken.updateOne(
        { userId, token: refreshToken },
        { $set: { revoked: true, revokedAt: new Date() } }
      );
    } else {
      // Revoke all tokens for user (logout from all devices)
      await RefreshToken.updateMany(
        { userId, revoked: false },
        { $set: { revoked: true, revokedAt: new Date() } }
      );
    }

    res.json({
      success: true,
      message: 'Token(s) revoked successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
```

**Refresh Token Model:**

```typescript
// backend/src/models/RefreshToken.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt: Date;
  revoked: boolean;
  revokedAt?: Date;
  deviceInfo?: {
    userAgent: string;
    ip: string;
  };
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsedAt: {
    type: Date,
    default: Date.now,
  },
  revoked: {
    type: Boolean,
    default: false,
    index: true,
  },
  revokedAt: {
    type: Date,
  },
  deviceInfo: {
    userAgent: String,
    ip: String,
  },
});

// Auto-delete expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
```

#### 3. Token Rotation on Refresh

**Automatic Token Rotation:**

```typescript
/**
 * Refresh token with rotation
 * Issues new access token AND new refresh token
 */
export async function refreshTokenWithRotation(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken: oldRefreshToken } = req.body;

    // Verify and validate old refresh token
    const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    const storedToken = await RefreshToken.findOne({
      userId: decoded.userId,
      token: oldRefreshToken,
      revoked: false,
    });

    if (!storedToken) {
      // Potential token reuse - revoke all tokens for this user
      await RefreshToken.updateMany(
        { userId: decoded.userId },
        { $set: { revoked: true, revokedAt: new Date() } }
      );
      res.status(401).json({ message: 'Token reuse detected. All sessions revoked.' });
      return;
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Revoke old refresh token
    storedToken.revoked = true;
    storedToken.revokedAt = new Date();
    await storedToken.save();

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, school: user.school },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user._id, tokenType: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    // Store new refresh token
    await RefreshToken.create({
      userId: user._id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      },
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: '15m',
    });
  } catch (error: any) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}
```

### Secret Key Management

#### 1. Environment-Based Secrets

**Development:**
```env
# .env.development
JWT_SECRET=dev_secret_not_for_production_use_only_12345
JWT_REFRESH_SECRET=dev_refresh_secret_67890
```

**Staging:**
```env
# .env.staging (never commit!)
JWT_SECRET=<generated-secret-32-chars-min>
JWT_REFRESH_SECRET=<different-generated-secret>
```

**Production:**
```env
# .env.production (use secrets manager)
JWT_SECRET=${SECRET_MANAGER_JWT_SECRET}
JWT_REFRESH_SECRET=${SECRET_MANAGER_JWT_REFRESH_SECRET}
```

#### 2. Generating Secure Secrets

```bash
# Generate a 64-character random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using openssl
openssl rand -hex 32

# Or using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

#### 3. Secrets Rotation Strategy

**Manual Rotation Process:**

1. **Generate New Secret:**
```bash
NEW_JWT_SECRET=$(openssl rand -hex 32)
echo "New JWT Secret: $NEW_JWT_SECRET"
```

2. **Add to Environment:**
```env
# Keep both old and new secrets during transition
JWT_SECRET=<new_secret>
JWT_SECRET_OLD=<old_secret>
```

3. **Update Verification Logic:**
```typescript
// middleware/auth.ts
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    let decoded;
    try {
      // Try with new secret
      decoded = jwt.verify(token!, process.env.JWT_SECRET!);
    } catch (error) {
      // Fallback to old secret during transition
      if (process.env.JWT_SECRET_OLD) {
        decoded = jwt.verify(token!, process.env.JWT_SECRET_OLD);
      } else {
        throw error;
      }
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

4. **Notify Users:**
   - Send email notifications
   - Force re-login after grace period
   - Display banner in application

5. **Remove Old Secret:**
   - After 7-14 days grace period
   - Remove `JWT_SECRET_OLD` from environment
   - Update verification logic

#### 4. Automated Rotation (Advanced)

**Using AWS Secrets Manager:**

```typescript
// backend/src/utils/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand, UpdateSecretCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

export async function getJWTSecret(): Promise<string> {
  const command = new GetSecretValueCommand({
    SecretId: 'schoman/jwt-secret',
  });
  
  const response = await client.send(command);
  const secrets = JSON.parse(response.SecretString!);
  return secrets.JWT_SECRET;
}

export async function rotateJWTSecret(): Promise<void> {
  const newSecret = require('crypto').randomBytes(32).toString('hex');
  
  const command = new UpdateSecretCommand({
    SecretId: 'schoman/jwt-secret',
    SecretString: JSON.stringify({
      JWT_SECRET: newSecret,
      rotatedAt: new Date().toISOString(),
    }),
  });
  
  await client.send(command);
  console.log('JWT Secret rotated successfully');
}
```

**Scheduled Rotation (Cron Job):**

```typescript
// backend/src/services/secretsRotation.ts
import cron from 'node-cron';
import { rotateJWTSecret } from '../utils/secrets';
import logger from '../utils/logger';

// Rotate secrets every 90 days (on the 1st of every 3rd month at 2 AM)
export function scheduleSecretsRotation() {
  cron.schedule('0 2 1 */3 *', async () => {
    try {
      logger.info('Starting scheduled JWT secret rotation');
      await rotateJWTSecret();
      logger.info('JWT secret rotated successfully');
      
      // Send notification to admins
      // await notifyAdmins('JWT secret has been rotated');
    } catch (error) {
      logger.error('Failed to rotate JWT secret:', error);
      // Alert admins
    }
  });
}
```

### Security Checklist

#### JWT Configuration
- [ ] Use strong, randomly generated secrets (min 32 characters)
- [ ] Set short expiration times for access tokens (15-30 minutes)
- [ ] Implement refresh token mechanism
- [ ] Store refresh tokens in database with expiration
- [ ] Rotate refresh tokens on use
- [ ] Implement token revocation (blacklist/whitelist)
- [ ] Use different secrets for access and refresh tokens
- [ ] Never log or expose JWT secrets
- [ ] Rotate secrets periodically (every 90 days recommended)

#### Token Storage (Frontend)
- [ ] Never store tokens in localStorage (XSS vulnerable)
- [ ] Use httpOnly cookies when possible
- [ ] Use memory/sessionStorage as fallback
- [ ] Clear tokens on logout
- [ ] Implement automatic token refresh

#### Token Transmission
- [ ] Always use HTTPS in production
- [ ] Use `Authorization: Bearer <token>` header
- [ ] Never pass tokens in URL parameters
- [ ] Set proper CORS headers
- [ ] Implement CSRF protection for cookies

#### Monitoring
- [ ] Log all authentication attempts
- [ ] Monitor for token reuse attempts
- [ ] Alert on multiple failed authentications
- [ ] Track token generation and revocation
- [ ] Audit secret rotation events

### Migration Guide

#### Migrating to Refresh Tokens

**Step 1: Update Environment Variables**
```env
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<generate-new-secret>
```

**Step 2: Create Refresh Token Model**
- Add `backend/src/models/RefreshToken.ts` (see above)

**Step 3: Update Auth Controller**
- Modify `login` to issue both tokens
- Add `refresh` endpoint
- Add `revoke` endpoint

**Step 4: Update Frontend**
- Store refresh token securely
- Implement automatic token refresh logic
- Handle token expiration gracefully

**Step 5: Testing**
- Test token refresh flow
- Test token revocation
- Test token rotation
- Test expired token handling

**Step 6: Deployment**
- Deploy with feature flag
- Enable for beta users first
- Monitor for issues
- Roll out to all users

---

## 🎯 Next Steps

### Recommended Enhancements
1. **SMS 2FA** - Add SMS as alternative 2FA method
2. **Biometric** - Support WebAuthn/FIDO2
3. **Security Questions** - Additional recovery method
4. **IP Whitelisting** - Restrict access by IP
5. **Session Management** - View/revoke active sessions
6. **Audit Logging** - Log all security events (✅ Already implemented)
7. **JWT Refresh Tokens** - Implement refresh token mechanism
8. **Automated Secret Rotation** - Set up periodic secret rotation

### Optional Features
1. Device recognition
2. Login notifications
3. Suspicious activity alerts
4. Account activity history
5. Security score dashboard

---

**Status:** ✅ Complete - Enhanced security with 2FA, Helmet, CORS  
**Completion Date:** October 2025  
**Phase:** Phase 3 - Security Implementation Complete
