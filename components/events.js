const ioConnect = socket => {
    // After connection
    console.log("Connected with id: " + socket.id)

    socket.on("disconnect", socket => {
        console.log("Disconnected");
    });
};

export default ioConnect;