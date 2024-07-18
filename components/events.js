import { saveChat } from "../database/database.js";
import { decryptLongText, importJWK, encryptLongText } from "./functions.js";
import { keys } from "../app.js";

const ioConnect = socket => {
    // After connection
    console.log("Connected with id: " + socket.id)

    socket.on("disconnect", socket => {
        console.log("Disconnected");
    });

    socket.on("send-message", async message => {

        // Decrypt the message
        const { data, key, iv } = message.message.content;
        const { from, to, userPublicKey, recipientPublicKey } = message;
        const decryptedMessage = await decryptLongText(data, key, iv, await importJWK(keys.privateKey, true));

        // Save the message to the database
        saveChat(from, to, {
            type: "text",
            content: decryptedMessage
        });

        // Encrypt the message again (with the server's public key)
        const encryptedMessage = await encryptLongText(decryptedMessage, await importJWK(userPublicKey));
        const encryptedMessageForRecipient = await encryptLongText(decryptedMessage, await importJWK(recipientPublicKey));
        message.res = {
            sender: encryptedMessage,
            recipient: encryptedMessageForRecipient
        };

        // Send the message to the receiver (and sender)
        socket.emit("incoming-message", message);
    });
};

export default ioConnect;