import mysql from "mysql2";
import dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config({path: path.resolve(dirname(fileURLToPath(import.meta.url)), "../.env")});

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_SCHEMA
}).promise();
const schema = process.env.MYSQL_SCHEMA;


/**
 * Retrieves the password associated with a given email from the database.
 * 
 * @param {string} email - The email for which to retrieve the password.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the password, or an error object if an error occurs.
 * @throws {Error} - If an error occurs during the database query.
 */
const getPasswordWithEmail = async (email) => {
    try {
        const [ result ] = await pool.query(
            `SELECT \`password\` from \`${schema}\`.\`users\` WHERE (email = ?);`,
            [email]
        );
        return result[0].password;
    } catch (err) {
        console.error(err.message);
        return {
            error: err.message
        };
    }
};

/**
 * Function to create a new user profile in the database.
 * 
 * @param {Array} array - An array containing user information in the following order: [email, password, name, family_name, picture].
 * @returns {boolean} Returns true if the user profile is successfully created, false otherwise.
 */
const createUserProfile = async (array) => {
    try {
        await pool.query(
            `INSERT INTO \`${schema}\`.\`users\` (\`email\`, \`password\`, \`name\`, \`family_name\`, \`picture\`) VALUES (?, ?, ?, ?, ?);`,
            array
        );
        return true;
    } catch (err) {
        console.error(err.message);
        return false;
    }
};

/**
 * Retrieves all emails from the 'users' table in the database.
 * 
 * @returns {Array|string} - An array of emails if successful, or an object with an error message if an error occurs.
 */
const getAllEmails = async () => {
    try {
        const [ result ] = await pool.query(
            `SELECT \`email\` from \`${schema}\`.\`users\`;`
        );
        result.forEach((obj, i) => {
            result[i] = obj.email;
        });
        return result;
    } catch (err) {
        console.error(err.message);
        return {
            error: err.message
        };
    }
};

/**
 * Retrieves an account from the database based on the provided email.
 * @param {string} email - The email of the account to retrieve.
 * @returns {Promise<Object>} - A promise that resolves to the retrieved account object, or an error object if an error occurs.
 */
const getAccountWithEmail = async (email) => {
    try {
        const [ result ] = await pool.query(
            `SELECT * from \`${schema}\`.\`users\` WHERE (email = ?);`,
            [email]
        );
        return result[0];
    } catch (err) {
        console.error(err.message);
        return {
            error: err.message
        };
    }
};

/**
 * Retrieves the chat history between two users.
 *
 * @param {string} user_email - The email of the user initiating the chat.
 * @param {string} contact_email - The email of the user being contacted.
 * @returns {Promise<Object|Array>} - The chat history between the two users.
 * @throws {Error} - If there is an error retrieving the chat history.
 */
const getChatHistory = async (user_email, contact_email) => {
    try {
        const [ result ] = await pool.query(
            `SELECT * from \`${schema}\`.\`chats\` WHERE (\`from\` = ? AND \`to\` = ?) OR (\`from\` = ? AND \`to\` = ?);`,
            [user_email, contact_email, contact_email, user_email]
        );
        return result;
    } catch (err) {
        console.error(err.message);
        return {
            error: err.message
        };
    }
};

/**
 * Saves a chat message to the database.
 * 
 * @param {string} from - The sender of the message.
 * @param {string} to - The recipient of the message.
 * @param {object} message - The message object to be saved.
 * @returns {boolean} - Returns true if the chat message is successfully saved, false otherwise.
 */
const saveChat = async (from, to, message) => {
    try {
        await pool.query(
            `INSERT INTO \`${schema}\`.\`chats\` (\`from\`, \`to\`, \`message\`) VALUES (?, ?, ?);`,
            [from, to, JSON.stringify(message)]
        );
        return true;
    } catch (err) {
        console.error(err.message);
        return false;
    }
};

/**
 * Saves a file to the database.
 *
 * @param {string} from - The sender of the file.
 * @param {string} to - The recipient of the file.
 * @param {string} filename - The name of the file.
 * @param {string} base64 - The base64 encoded content of the file.
 * @returns {boolean} - Returns true if the file was successfully saved, false otherwise.
 */
const saveFile = async (from, to, filename, base64) => {
    try {
        await pool.query(
            `INSERT INTO \`${schema}\`.\`files\` (\`from\`, \`to\`, \`filename\`, \`base64\`) VALUES (?, ?, ?, ?);`,
            [from, to, filename, base64]
        );
        return true;
    } catch (err) {
        console.error(err.message);
        return false;
    }
};

/**
 * Retrieves a file from the database based on the provided filename.
 * @param {string} filename - The name of the file to retrieve.
 * @returns {Promise<Object>} - A promise that resolves to the retrieved file object.
 *                             The file object contains the following properties:
 *                             - valid: A boolean indicating if the file is valid or not.
 *                             - error: If the file is not valid, this property contains the error message.
 */
const getFile = async (filename) => {
    try {
        const [ result ] = await pool.query(
            `SELECT * from \`${schema}\`.\`files\` WHERE (\`filename\` = ?);`,
            [filename]
        );
        result[0].valid = true;
        return result[0];
    } catch (err) {
        console.error(err.message);
        return {
            error: err.message,
            valid: false
        };
    }
};

/**
 * Retrieves all chat partners for a given email.
 *
 * @param {string} email - The email of the user.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of chat partners.
 * @throws {Error} - If an error occurs while retrieving the chat partners.
 */
const getAllChatPartners = async (email) => {
    try {
        const [ result] = await pool.query(
            `SELECT \`from\`, \`to\` FROM \`${schema}\`.\`chats\` WHERE (\`to\` = ?) OR (\`from\` = ?)`,
            [email, email]
        );
        return result;
    } catch (err) {
        console.error(err.message);
        return undefined;
    }
};

/**
 * Retrieves the last message between two email addresses from the database.
 * 
 * @param {string} email - The email address of the first user.
 * @param {string} email2 - The email address of the second user.
 * @returns {Object|undefined} The last message object, or undefined if an error occurred.
 */
const getLastMessages = async (email, email2) => {
    try {
        const [ result] = await pool.query(
            `SELECT * FROM \`${schema}\`.\`chats\` WHERE (\`to\` = ? AND \`from\` = ?) OR (\`to\` = ? AND \`from\` = ?) ORDER BY \`id\` DESC LIMIT 1;`,
            [email, email2, email2, email]
        );
        return result[0];
    } catch (err) {
        console.error(err.message);
        return undefined;
    }
};

/**
 * Searches for users in the database based on a given string.
 * @param {string} string - The string to search for.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of user objects matching the search criteria.
 */
const searchForUsers = async (string) => {
    try {
        const [ result ] = await pool.query(
            `SELECT * from \`${schema}\`.\`users\` WHERE (LOWER(\`email\`) LIKE LOWER(?) OR LOWER(\`name\`) LIKE LOWER(?) OR LOWER(\`family_name\`) LIKE LOWER(?));`,
            [`%${string}%`, `%${string}%`, `%${string}%`]
        );
        result.forEach(entry => {
            delete entry.id;
            delete entry.password;
        })
        return result;
    } catch (err) {
        console.error(err.message);
        return undefined;
    }
};



export default {
    getPasswordWithEmail,
    createUserProfile,
    getAllEmails,
    getAccountWithEmail,
    getChatHistory,
    saveChat,
    saveFile,
    getFile,
    getAllChatPartners,
    getLastMessages,
    searchForUsers
};

export {
    getPasswordWithEmail,
    createUserProfile,
    getAllEmails,
    getAccountWithEmail,
    getChatHistory,
    saveChat,
    saveFile,
    getFile,
    getAllChatPartners,
    getLastMessages,
    searchForUsers
};