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



export default {
    getPasswordWithEmail,
    createUserProfile,
    getAllEmails,
    getAccountWithEmail,
    getChatHistory,
    saveChat
};

export {
    getPasswordWithEmail,
    createUserProfile,
    getAllEmails,
    getAccountWithEmail,
    getChatHistory,
    saveChat
};