import field from "./field.js";
import sequence from "./sequence.js";

export default (definitions) => sequence(
    ...Object.entries(definitions)
        .map(([key, value]) => field(key, value))
);

