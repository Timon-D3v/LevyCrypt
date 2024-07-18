import crypto from "./crypto.js";
import functions from "./functions.js";
import timon, { post, getElm, getQuery } from "timonjs";



// Constants
const { publicKey } = await post("/security/get-public-key"),

    keys = functions.getKey("client_publicKey") === null ?
    await crypto.generateRSAKeyPair() :
    {
        publicKey: functions.getKey("client_publicKey"),
        privateKey: functions.getKey("client_privateKey")
    };



// Initialize
window.sessionStorage.setItem("server_publicKey", JSON.stringify(publicKey));
window.sessionStorage.setItem("client_publicKey", JSON.stringify(keys.publicKey));
window.sessionStorage.setItem("client_privateKey", JSON.stringify(keys.privateKey));



// Event Listeners
getElm("send-image").click(e => {
    e.preventDefault();
    functions.sendImage(getElm("image-file"));
});

getElm("send-3d").click(e => {
    e.preventDefault();
    functions.send3D(getElm("3d-file"));
});