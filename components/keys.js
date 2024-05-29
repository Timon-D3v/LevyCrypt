import { generateKeyPairSync } from "node:crypto";



/**
 * Generates a public and private key for the server
 */
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: "spki",
        format: "pem"
    },
    privateKeyEncoding: {
        type: "pkcs8",
        format: "pem"
    }
});



export default {
    privateKey,
    publicKey
};