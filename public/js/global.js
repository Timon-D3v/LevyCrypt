import crypto from "./crypto.js";
import functions from "./functions.js";
import user from "user";
import timon, { post, getElm, getQuery, ORIGIN } from "timonjs";



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
getElm("send-image").click(async e => {
    e.preventDefault();

    const file = getElm("image-file");
    const res = await post("/upload", {
        from: user.email,
        to: new URLSearchParams(window.location.search).get("email"),
        type: "image",
        name: file.file().name,
        base64: await file.getImgBase64()
    });
    console.log(res);
})