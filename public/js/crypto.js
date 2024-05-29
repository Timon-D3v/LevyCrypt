import global from "./global.js";



/**
 * This class creates my own crypto module.
 */
class Crypto {
    async generateRSAKeyPair() {
        try {
            const keys = await window.crypto.subtle.generateKey(
                {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: {name: "SHA-256"}
                },
                true,
                ["encrypt", "decrypt"]
            );
        
            const publicKey = await window.crypto.subtle.exportKey("spki", keys.publicKey);
            const privateKey = await window.crypto.subtle.exportKey("pkcs8", keys.privateKey);

            const publicKeyPEM = await this.formatPEM(publicKey, "PUBLIC");
            const privateKeyPEM = await this.formatPEM(privateKey, "PRIVATE");
        
            return {
                publicKey: publicKeyPEM,
                privateKey: privateKeyPEM
            };
        } catch (error) {
            console.error("Error generating RSA key pair:", error);
            return null;
        }
    }

    /**
     * Converts an ArrayBuffer to a Base64 string.
     * @param {ArrayBuffer} buffer - The ArrayBuffer to be converted to Base64.
     * @returns {string} - Base64 string representing the input ArrayBuffer.
     */
    async arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Formats a given key array buffer into a PEM (Privacy-Enhanced Mail) string.
     * @param {ArrayBuffer} keyArrayBuffer - The key array buffer to be formatted.
     * @param {string} type - The type of the key (e.g., "PUBLIC", "PRIVATE").
     * @returns {Promise<string>} The formatted PEM string representing the key.
     */
    async formatPEM(keyArrayBuffer, type) {
        const keyBase64 = await this.arrayBufferToBase64(keyArrayBuffer);
        const chunks = [];
        const base64Chars = keyBase64.match(/.{1,64}/g);
      
        base64Chars.forEach((chunk) => {
            chunks.push(chunk);
        });
      
        const pemString = `-----BEGIN ${type} KEY-----\n${chunks.join('\n')}\n-----END ${type} KEY-----\n`;
      
        return pemString;
    }

    /**
     * Converts a PEM (Privacy-Enhanced Mail) formatted public key to a JWK (JSON Web Key) format.
     * @param {string} pemKey - The PEM formatted public key.
     * @returns {Promise<CryptoKey>} - The imported public key in JWK format.
     */
    async pemToJwk(pemKey) {
        // Remove header and footer lines
        const pemContents = pemKey.replace(/-----BEGIN PUBLIC KEY-----/, '').replace(/-----END PUBLIC KEY-----/, '');

        // Remove newline characters
        const strippedKey = pemContents.replace(/\r?\n|\r/g, '');

        // Decode base64
        const decodedKey = atob(strippedKey);
        const buffer = new Uint8Array(decodedKey.length);

        for (let i = 0; i < decodedKey.length; ++i) {
            buffer[i] = decodedKey.charCodeAt(i);
        }

        const publicKey = await window.crypto.subtle.importKey(
            "spki",
            buffer,
            { name: "RSA-OAEP", hash: { name: "SHA-256" } },
            true,
            ["encrypt"]
        );

        return publicKey;
    }

    /**
     * Encrypts an input using RSA-OAEP encryption algorithm with a given public key.
     * @param {string} input - The data that needs to be encrypted.
     * @returns {Promise<string>} - The encrypted input data in base64 format.
     */
    async clientEncrypt(input) {
        const { publicKey } = global;
        const key = await this.pemToJwk(publicKey);
        const encoder = new TextEncoder();
        const data = encoder.encode(input);

        const encryptedData = await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            key,
            data
        );

        // Convert the encrypted data to a base64 string for easier transmission
        const encryptedInput = btoa(String.fromCharCode(...new Uint8Array(encryptedData)));

        return encryptedInput;
    }
}



export default new Crypto;