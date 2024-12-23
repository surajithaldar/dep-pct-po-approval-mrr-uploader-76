import crypto from 'crypto';

class CryptoModel {
  public async encryptAES256cbc(text: string): Promise<string> {
    const key = 'VVaXOq5qZujtQh+eoX9gMkGA78rAGUvfgnpa+lDnWcQ=';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'base64'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return JSON.stringify({ iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') });
  }

  public async decryptAES256cbc(data: any): Promise<string> {
    const iv = Buffer.from(data.iv, 'hex');
    const encryptedText = Buffer.from(data.encryptedData, 'hex');
    const key = 'VVaXOq5qZujtQh+eoX9gMkGA78rAGUvfgnpa+lDnWcQ=';
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'base64'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
export default CryptoModel;
