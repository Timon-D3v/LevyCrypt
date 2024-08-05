import { createHash } from "crypto";
import { saveChat } from "../database/database.js";
import { decryptLongText, importJWK, encryptLongText } from "./functions.js";
import { keys } from "../app.js";

/**
 * Connects the socket to the server and handles various events such as verification, joining/leaving rooms, sending/receiving messages.
 * 
 * @param {Socket} socket - The socket object for the connection.
 */
const ioConnect = socket => {
    const user = { verified: false };

    socket.once("verification", data => {
        user.verified = true;
        user.email = data.email;
        user.publicKey = data.publicKey;

        const hash = createHash("sha256");
        hash.update(data.email);
        const room = hash.digest("hex");

        socket.join(room);
        user.rooms = {
            self: room,
            public: undefined
        };
    });

    socket.on("join-room", email => {

        if (!user.verified) return;

        const hash = createHash("sha256");
        hash.update(email);
        const room = hash.digest("hex");
        socket.join(room);
        user.rooms.public = room;
    });

    socket.on("leave-room", email => {

        if (!user.verified) return;

        const hash = createHash("sha256");
        hash.update(email);
        const room = hash.digest("hex");
        socket.leave(room);
        user.rooms.public = undefined;
    });

    socket.on("disconnect", () => {
        user.verified = false;
    });

    socket.on("send-message", async message => {

        if (!user.verified) return;

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
        
        if (user.rooms.public !== undefined) socket.to(user.rooms.public).emit("incoming-message", message);
    });
};

export default ioConnect;