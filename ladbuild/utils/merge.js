function merge(src, dest) {
    const result = { ...src };
    for (const key in dest) {
        const srcValue = src[key];
        const destValue = dest[key];
        if (typeof srcValue !== "undefined") {
            if (typeof srcValue !== typeof destValue) {
                throw new Error("merge failed: src and dest types don't match");
            }
            if (srcValue instanceof Array) {
                const excludedDests = destValue.filter(x => srcValue.includes(x) === false);
                result[key] = [].concat(srcValue, excludedDests);
                continue;
            }
            if (typeof srcValue === "object" && srcValue !== null) {
                result[key] = merge(srcValue, destValue);
                continue;
            }
        }
        result[key] = destValue;
    }
    return result;
}

module.exports = merge;