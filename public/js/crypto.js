/**
 * This class creates my own crypto module.
 */
class Crypto {

    /**
     * Generates an RSA key pair using the Web Crypto API.
     * @returns {Promise<{publicKey: JsonWebKey, privateKey: JsonWebKey}>} The generated RSA key pair.
     */
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
     * Converts a base64 string to an ArrayBuffer.
     *
     * @param {string} base64 - The base64 string to convert.
     * @returns {ArrayBuffer} - The converted ArrayBuffer.
     */
    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Encrypts an input using RSA-OAEP encryption algorithm with the server public key from the session storage.
     * @param {string} input - The data that needs to be encrypted.
     * @returns {Promise<number[]>} - The encrypted data as an array of numbers.
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

    /**
     * Encrypts the given input using RSA-OAEP encryption algorithm with the provided public key.
     * @param {string} input - The input to be encrypted.
     * @param {JsonWebKey} rawPublicKey - The raw public key used for encryption.
     * @returns {Promise<number[]>} - The encrypted data as an array of numbers.
     */
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

    /**
     * Decrypts the given encrypted data using the client's private key.
     * @param {ArrayBuffer} encryptedData - The encrypted data to be decrypted.
     * @returns {Promise<string>} - A promise that resolves to the decrypted input as a string.
     */
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

    /**
     * Decrypts the given encrypted data using the provided private key.
     * @param {ArrayBuffer} encryptedData - The encrypted data to be decrypted.
     * @param {JsonWebKey} rawPrivateKey - The raw private key used for decryption.
     * @returns {Promise<string>} - A promise that resolves to the decrypted input as a string.
     */
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

    /**
     * Decrypts the given encrypted message using the provided key and initialization vector (IV).
     *
     * @param {string} encrypted - The encrypted message to decrypt.
     * @param {string} rawKey - The raw key used for decryption.
     * @param {string} iv - The initialization vector (IV) used for decryption.
     * @returns {Promise<string>} - A promise that resolves to the decrypted message.
     */
    async cipherDecrypt(encrypted, rawKey, iv) {
        const decoder = new TextDecoder();
        const keyBuffer = this.base64ToArrayBuffer(rawKey);
        const ivBuffer = this.base64ToArrayBuffer(iv);
        const messageBuffer = this.base64ToArrayBuffer(encrypted);

        const key = await crypto.subtle.importKey(
            "raw", // Format of the key
            keyBuffer, // Key buffer
            "AES-CBC", // Algorithm
            false, // Extractable
            ["decrypt"] // Usages
        );

        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv: ivBuffer
            },
            key,
            messageBuffer
        );

        const decryptedInput = decoder.decode(decryptedData);

        return decryptedInput;
    }
}



export default new Crypto;