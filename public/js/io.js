import io from "socket.io";
import user from "user";
import crypto from "crypto";
import { currentChatPartner, displayChat, getKey } from "./functions.js";

const socket = io();

if (user.valid) {
    socket.emit("verification", {
        email: user.email,
        publicKey: getKey("client_publicKey")
    });

    socket.emit("join-room", user.email);
}

socket.on("incoming-message", async message => {
    // Check if the message is from the user
    let sender = false;
    if (message.from === user.email) sender = true;

    // Check if the message is from the current Chatpartner
    if (message.from !== currentChatPartner() && !sender) return;

    // Select the correct response
    const res = sender ? message.res.sender : message.res.recipient;

    // Decrypt the message
    const { data, key, iv } = res;
    const decryptedMessage = await crypto.decryptLongText(data, key, iv);

    displayChat({
        from: message.from,
        to: message.to,
        message: {
            type: "text",
            content: decryptedMessage
        }
    });
});

export default socket;