import io from "socket.io";
import user from "user";
import functions from "./functions.js";

const socket = io();

socket.on("incoming-message", message => {
    console.log(message);
    functions.displayChat(message);
});

export default socket;