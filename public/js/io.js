import io from "socket.io";
import user from "user";
import crypto from "crypto";
import functions from "./functions.js";

const socket = io();

socket.on("incoming-message", async message => {
    // Check if the message is from the user
    let sender = false;
    if (message.from === user.email) sender = true;

    // Select the correct response
    const res = sender ? message.res.sender : message.res.recipient;

    // Decrypt the message
    const { data, key, iv } = res;
    const decryptedMessage = await crypto.decryptLongText(data, key, iv);

    functions.displayChat({
        from: message.from,
        to: message.to,
        message: {
            type: "text",
            content: decryptedMessage
        }
    });
});

export default socket;