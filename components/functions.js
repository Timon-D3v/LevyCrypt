import crypto from "crypto";
import db from "../database/database.js";



/**
 * Uploads an image to the ImageKit server.
 * @param {string} base64 - The base64 encoded image data.
 * @param {string} name - The name of the image file.
 * @param {string} folder - The folder path where the image should be uploaded.
 * @returns {Promise<Object>} - An object with the path of the uploaded image and the server response.
 */
const imagekitUpload = async (base64, name, folder) => {
  try {
    const res = await new Promise((resolve, reject) => {
        imagekit.upload({
            file: base64,
            fileName: name,
            folder: folder,
            useUniqueFileName: false
        }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });

    const path = `https://ik.imagekit.io/timon/${folder}/${name}`;
    return { path, res };
  } catch (error) {
    return { path: "", res: error };
  }
};

const createPasswordHash = async (password) => {
    const salt = crypto.randomBytes(32).toString("base64");
    const hashedPassword = crypto.scryptSync(password, salt, 256).toString("base64");

    return `${salt}:${hashedPassword}`;
};

/**
 * Validates a user login by comparing the provided username and password with the stored credentials.
 *
 * @param {string} username - The username of the user attempting to login.
 * @param {string} password - The password of the user attempting to login.
 * @returns {boolean} - Returns true if the login credentials are valid, false otherwise.$
 */
const validateLogin = async (username, password) => {
    try {
        const saltedHash = await db.getPasswordWithUsername(username);
        const [salt, hashedPassword] = saltedHash.split(":");

        const userBuffer = crypto.scryptSync(password, salt, 256);
        const savedBuffer = Buffer.from(hashedPassword, "base64");

        const match = crypto.timingSafeEqual(userBuffer, savedBuffer);
        return match;
    } catch (err) {
        console.error("Error occurred during login validation:", err.message);
        return false;
    };
};

/**
 * Decrypts an encrypted message using a private key.
 * 
 * @param {string} encryptedMessage - The encrypted message to be decrypted.
 * @param {string} privateKey - The private key used for decryption.
 * @returns {string} - The decrypted message
 */
const decryptMessage = (encryptedMessage, privateKey) => {
    // Convert the encrypted message from base64 back to a buffer
    const encryptedData = Buffer.from(encryptedMessage, "base64");
    
    // Decrypt the message using the private key
    const decryptedData = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256" // Use the same hash function as used in frontend encryption
        },
        encryptedData
    );
    
    // Convert the decrypted data to a string
    const decryptedMessage = decryptedData.toString("utf8");
    
    return decryptedMessage;
};

export default {
    imagekitUpload,
    createPasswordHash,
    validateLogin,
    decryptMessage
};

export {
    imagekitUpload,
    createPasswordHash,
    validateLogin,
    decryptMessage
};