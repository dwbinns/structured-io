import { wrap } from "../capture.js";
import string from "./string.js";

export default wrap((size) => string.original("ascii", size));