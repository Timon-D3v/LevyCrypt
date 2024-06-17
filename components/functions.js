import ImageKit from "imagekit";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import db from "../database/database.js";
import { randomString } from "timonjs";
import { fileURLToPath } from "url";
import { dirname } from "path";



dotenv.config({path: path.resolve(dirname(fileURLToPath(import.meta.url)), "../.env")});
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_SECRET_KEY,
    urlEndpoint: "https://ik.imagekit.io/timon/"
});



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

const importJWK = async (key, isPrivateKey = false) => {
    return await crypto.subtle.importKey(
        "jwk",
        key,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        isPrivateKey ? ["decrypt"] : ["encrypt"]
    );
}

/**
 * Validates an email address using a regular expression.
 * 
 * @param {string} email - The email address to validate.
 * @returns {boolean} - Returns true if the email address is valid, false otherwise.
 */
const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
};

/**
 * Generates a salted and hashed password based on the provided password.
 * 
 * @param {string} password - The password to be hashed.
 * @returns {string} - A string containing the salt and hashed password separated by a colon.
 */
const createPasswordHash = async (password) => {
    const salt = crypto.randomBytes(32).toString("base64");
    const hashedPassword = crypto.scryptSync(password, salt, 256).toString("base64");

    return `${salt}:${hashedPassword}`;
};

/**
 * Validates a user login by comparing the provided email and password with the stored credentials.
 *
 * @param {string} email - The email of the user attempting to login.
 * @param {string} password - The password of the user attempting to login.
 * @returns {boolean} - Returns true if the login credentials are valid, false otherwise.
 */
const validateLogin = async (email, password) => {
    try {
        const saltedHash = await db.getPasswordWithEmail(email);
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
    const encryptedData = Buffer.from(new Uint8Array(encryptedMessage));
    
    // Decrypt the message using the private key
    const decryptedData = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // Ensure OAEP padding is specified
            oaepHash: "SHA256" // Match the hash algorithm used in encryption
        },
        encryptedData
    );
    
    // Convert the decrypted data to a string
    const decryptedMessage = decryptedData.toString("utf8");
    
    return decryptedMessage;
};

/**
 * Encrypts a message using the provided public key.
 *
 * @param {string} message - The message to be encrypted.
 * @param {string} publicKey - The public key used for encryption.
 * @returns {string} - The encrypted message as a base64-encoded string.
 */
const encryptMessage = (message, publicKey) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(message)

    const encryptedData = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // Ensure OAEP padding is specified
            oaepHash: "SHA256" // Match the hash algorithm used in encryption
        },
        data
    );

    return Array.from(new Uint8Array(encryptedData));
}

const cipherEncrypt = async (string) => {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes256", key, iv);
    let encrypted = cipher.update(string, "utf-8", "base64");
    encrypted += cipher.final("base64");
    return {
        encrypted,
        symmetricKey: key.toString("base64"),
        iv: iv.toString("base64")
    };
}

/**
 * This function is used to sign up a new user by creating a user profile with the provided information.
 * 
 * @param {string} email - The email of the new user.
 * @param {string} password - The password of the new user.
 * @param {string} name - The first name of the new user.
 * @param {string} family_name - The last name of the new user.
 * @param {string} picture - The profile picture of the new user in base64 format.
 * 
 * @returns {boolean} - Returns true if the sign up is successful, false otherwise.
 */
const signUp = async (email, password, name, family_name, picture) => {
    const array = [
        email,
        password,
        name,
        family_name
    ];

    try {
        array.forEach(element => {
            if (typeof element !== "string" || element === "") {
                console.log(element);
                throw new Error("Element does not match expected value!");
            }
        });
    } catch (err) {
        console.error(err.message);
        return false;
    }

    if (typeof picture === "string" && picture !== "") {
        const { path } = await imagekitUpload(
            picture,
            email + "__" + randomString(32),
            "chat-app-2024/profile-picture"
        );
        array.push(path.replace("@", "_"));
    } else {
        array.push("/img/svg/user.svg");
    }

    const hash = await createPasswordHash(password);
    array[1] = hash;

    const valid = await db.createUserProfile(array);
    return valid;
};

/**
 * Retrieves public information for a given email.
 * @param {string} email - The email address to retrieve public information for.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the public information.
 */
const getPublicInfo = async (email) => {
    try {
        const info = await db.getAccountWithEmail(email);
        delete info.id;
        delete info.password;
        return info;
    } catch (err) {
        console.error(err.message);
        return {};
    }
};

export default {
    imagekitUpload,
    importJWK,
    validateEmail,
    createPasswordHash,
    validateLogin,
    decryptMessage,
    encryptMessage,
    cipherEncrypt,
    signUp,
    getPublicInfo
};

export {
    imagekitUpload,
    importJWK,
    validateEmail,
    createPasswordHash,
    validateLogin,
    decryptMessage,
    encryptMessage,
    cipherEncrypt,
    signUp,
    getPublicInfo
};