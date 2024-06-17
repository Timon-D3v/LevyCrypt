import { generateKeyPairSync } from "node:crypto";



/**
 * Generates a public and private key for the server
 */
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: "spki",
        format: "jwk"
    },
    privateKeyEncoding: {
        type: "pkcs8",
        format: "jwk"
    }
});



export default {
    privateKey,
    publicKey
};