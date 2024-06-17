import { post } from "timonjs";

const user = await post("/security/get-user-data");

export default user;