import crypto from 'crypto';

/**
 * Two-Factor Authentication Service
 * Provides TOTP-based 2FA without external dependencies
 */

interface TwoFactorSecret {
  secret: string;
  qrCodeUrl: string;
}

interface TwoFactorBackupCodes {
  codes: string[];
  hashedCodes: string[];
}

class TwoFactorService {
  private readonly window = 1; // Time window for TOTP validation (30 seconds)
  private readonly codeLength = 6;
  
  /**
   * Generate a base32-encoded secret for TOTP
   */
  generateSecret(): string {
    const buffer = crypto.randomBytes(20);
    return this.base32Encode(buffer);
  }
  
  /**
   * Generate secret and QR code URL
   */
  generateSecretWithQR(userEmail: string, issuer: string = 'Schoman'): TwoFactorSecret {
    const secret = this.generateSecret();
    const qrCodeUrl = this.generateQRCodeUrl(userEmail, secret, issuer);
    
    return {
      secret,
      qrCodeUrl,
    };
  }
  
  /**
   * Generate QR code URL for authenticator apps
   */
  private generateQRCodeUrl(userEmail: string, secret: string, issuer: string): string {
    const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
  }
  
  /**
   * Verify TOTP token
   */
  verifyToken(token: string, secret: string): boolean {
    if (!token || token.length !== this.codeLength) {
      return false;
    }
    
    const time = Math.floor(Date.now() / 1000 / 30);
    
    // Check current time window and adjacent windows
    for (let i = -this.window; i <= this.window; i++) {
      const computedToken = this.generateTOTP(secret, time + i);
      if (token === computedToken) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Generate TOTP token for a given time
   */
  private generateTOTP(secret: string, time: number): string {
    const key = this.base32Decode(secret);
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigInt64BE(BigInt(time), 0);
    
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(timeBuffer);
    const hash = hmac.digest();
    
    const offset = hash[hash.length - 1] & 0x0f;
    const truncated = (
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)
    );
    
    const code = (truncated % 1000000).toString().padStart(this.codeLength, '0');
    return code;
  }
  
  /**
   * Generate backup codes for 2FA recovery
   */
  generateBackupCodes(count: number = 10): TwoFactorBackupCodes {
    const codes: string[] = [];
    const hashedCodes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = this.generateBackupCode();
      codes.push(code);
      hashedCodes.push(this.hashBackupCode(code));
    }
    
    return { codes, hashedCodes };
  }
  
  /**
   * Generate a single backup code
   */
  private generateBackupCode(): string {
    const buffer = crypto.randomBytes(4);
    return buffer.toString('hex').toUpperCase();
  }
  
  /**
   * Hash backup code for storage
   */
  private hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }
  
  /**
   * Verify backup code
   */
  verifyBackupCode(code: string, hashedCodes: string[]): boolean {
    const hashedCode = this.hashBackupCode(code);
    return hashedCodes.includes(hashedCode);
  }
  
  /**
   * Remove used backup code
   */
  removeBackupCode(code: string, hashedCodes: string[]): string[] {
    const hashedCode = this.hashBackupCode(code);
    return hashedCodes.filter(hash => hash !== hashedCode);
  }
  
  /**
   * Base32 encoding (simplified for TOTP)
   */
  private base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';
    
    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;
      
      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 0x1f];
        bits -= 5;
      }
    }
    
    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 0x1f];
    }
    
    return output;
  }
  
  /**
   * Base32 decoding (simplified for TOTP)
   */
  private base32Decode(str: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let index = 0;
    const output = Buffer.alloc(Math.ceil((str.length * 5) / 8));
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charAt(i).toUpperCase();
      const val = alphabet.indexOf(char);
      
      if (val === -1) continue;
      
      value = (value << 5) | val;
      bits += 5;
      
      if (bits >= 8) {
        output[index++] = (value >>> (bits - 8)) & 0xff;
        bits -= 8;
      }
    }
    
    return output.slice(0, index);
  }
}

export default new TwoFactorService();
