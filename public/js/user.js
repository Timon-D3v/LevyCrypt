import { post } from "timonjs";

// Get the user data
const user = await post("/security/get-user-data");

export default user;