import Encoding from "./Encoding.js";
import instance from "./encodings/instance.js";

export default specification => {
    if (specification instanceof Encoding) return specification;
    if (specification && specification.encoding instanceof Encoding) return instance.original(specification);
    return Encoding.check(specification);
};