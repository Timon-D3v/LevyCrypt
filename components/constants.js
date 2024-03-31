import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    __filename: __filename,
    __dirname: __dirname
};

export {
    __filename,
    __dirname
};