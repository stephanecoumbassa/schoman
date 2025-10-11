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

## 🎯 Next Steps

### Recommended Enhancements
1. **SMS 2FA** - Add SMS as alternative 2FA method
2. **Biometric** - Support WebAuthn/FIDO2
3. **Security Questions** - Additional recovery method
4. **IP Whitelisting** - Restrict access by IP
5. **Session Management** - View/revoke active sessions
6. **Audit Logging** - Log all security events

### Optional Features
1. Device recognition
2. Login notifications
3. Suspicious activity alerts
4. Account activity history
5. Security score dashboard

---

**Status:** ✅ Complete - Enhanced security with 2FA  
**Completion Date:** October 2025  
**Phase:** Phase 3 - Task 3/7 Complete
