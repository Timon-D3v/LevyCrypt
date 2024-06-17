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
        
            const publicKey = await window.crypto.subtle.exportKey("jwk", keys.publicKey);
            const privateKey = await window.crypto.subtle.exportKey("jwk", keys.privateKey);
        
            return {
                publicKey,
                privateKey
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
    arrayBufferToBase64(buffer) {
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
     * @note This function is not used in the current implementation, but it may be useful in the future.
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
     * @note This function is not used in the current implementation, but it may be useful in the future.
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
        const publicKeyObject = JSON.parse(window.sessionStorage.getItem("server_publicKey"));
        const encoder = new TextEncoder();
        const data = encoder.encode(input);

        const publicKey = await window.crypto.subtle.importKey(
            "jwk",
            publicKeyObject,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            ["encrypt"]
        );

        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
                hash: { name: "SHA-256" }
            },
            publicKey,
            data
        );

        return Array.from(new Uint8Array(encryptedData))
    }

    async encrypt(input, rawPublicKey) {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);

        const publicKey = await window.crypto.subtle.importKey(
            "jwk",
            rawPublicKey,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            ["encrypt"]
        );

        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
                hash: { name: "SHA-256" }
            },
            publicKey,
            data
        );
        
        return Array.from(new Uint8Array(encryptedData))
    }

    async clientDecrypt(encryptedData) {
        const privateKeyObject = JSON.parse(window.sessionStorage.getItem("client_privateKey"));
        const decoder = new TextDecoder();
        const data = new Uint8Array(encryptedData);

        const privateKey = await window.crypto.subtle.importKey(
            "jwk",
            privateKeyObject,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            ["decrypt"]
        );

        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
                hash: { name: "SHA-256" }
            },
            privateKey,
            data
        );

        const decryptedInput = decoder.decode(decryptedData);

        return decryptedInput;
    }

    async decrypt(encryptedData, rawPrivateKey) {
        const decoder = new TextDecoder();
        const data = new Uint8Array(encryptedData);

        const privateKey = await window.crypto.subtle.importKey(
            "jwk",
            rawPrivateKey,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            ["decrypt"]
        );

        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
                hash: { name: "SHA-256" }
            },
            privateKey,
            data
        );

        const decryptedInput = decoder.decode(decryptedData);

        return decryptedInput;
    }
}



export default new Crypto;