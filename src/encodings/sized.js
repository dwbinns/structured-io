const scope = require("./scope");
const collect = require("./collect");
const size = require("./size");
const sequence = require("./sequence");

module.exports = function sized(sizeSpecification, options, contentSpecification = [options, options = {}][0]) {
    return collect(results =>
        scope("sized", contentScope =>
            sequence(
                size(sizeSpecification, options, contentScope),
                contentScope(results(contentSpecification))
            )
        )
    );
}
