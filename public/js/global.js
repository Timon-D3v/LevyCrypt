import crypto from "crypto";
import functions from "functions";
import { post, getElm, getQuery } from "timonjs";



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

getQuery("img").on("dragstart", () => false);