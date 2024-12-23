import crypto from 'crypto';
import fs from 'fs';

class RsaModel {
  public async publicEncrypt(publicKey: string, data: string): Promise<any> {
    const encryptedData = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      // We convert the data string to a buffer using `Buffer.from`
      Buffer.from(data),
    );
    return encryptedData.toString('base64');
  }

  public async privateDecrypt(publicKey: string, encryptedData: string, key: string): Promise<any> {
    const decryptedData = crypto.privateDecrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
        passphrase: key,
      },
      Buffer.from(encryptedData, 'base64'),
    );

    console.log(decryptedData);

    return decryptedData.toString('utf8');
  }
}
export default RsaModel;
