import { saveChat } from "../database/database.js";

const ioConnect = socket => {
    // After connection
    console.log("Connected with id: " + socket.id)

    socket.on("disconnect", socket => {
        console.log("Disconnected");
    });

    socket.on("send-message", message => {
        saveChat(message.from, message.to, message.message);
        socket.emit("incoming-message", message);
    });
};

export default ioConnect;