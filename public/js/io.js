import io from "socket.io";
import user from "user";
import crypto from "crypto";
import { currentChatPartner, displayChat, getKey, updateNav } from "./functions.js";

const socket = io();

if (user.valid) {
    socket.emit("verification", {
        email: user.email,
        publicKey: getKey("client_publicKey")
    });
}

socket.on("incoming-message", async message => {
    // Update the Navigation
    updateNav()
    
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

socket.on("incoming-image", data => {
    // Check if the message is from the user
    if (data.from === user.email) return;

    displayChat({
        from: data.from,
        to: data.to,
        message: {
            type: "image",
            url: data.url,
            name: data.name
        }
    });
});

socket.on("incoming-model", data => {
    // Check if the message is from the user
    if (data.from === user.email) return;

    displayChat({
        from: data.from,
        to: data.to,
        message: {
            type: "3d",
            url: data.url
        }
    });
});

socket.on("update-nav", () => updateNav());

export default socket;