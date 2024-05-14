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
 * Retrieves the password associated with a given username from the database.
 * 
 * @param {string} username - The username for which to retrieve the password.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the password, or an error object if an error occurs.
 * @throws {Error} - If an error occurs during the database query.
 */
const getPasswordWithUsername = async (username) => {
    try {
        const [ result ] = await pool.query(
            `SELECT * from \`${schema}\`.\`users\` WHERE (username = ?)`,
            [username]
        );
        return result[0].password;
    } catch (err) {
        console.error(err.message);
        return {
            error: err.message
        };
    };
};



export default {
    getPasswordWithUsername
};