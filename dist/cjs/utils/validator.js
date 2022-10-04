"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validator = void 0;
const validator = (data, rules) => {
    for (const [param, rule] of Object.entries(rules)) {
        const item = data[param];
        const dataType = getDatatType(rule);
        if (dataType.endsWith("?") && (item === null || item === undefined)) {
            continue;
        }
        if (item === null || item === undefined) {
            throw new Error(`${param} is required`);
        }
        const errM = `${param} has wrong param`;
        switch (dataType.replace("?", "")) {
            case "string":
                if (typeof item !== "string" || item === "") {
                    throw new Error(errM + ` ${dataType}`);
                }
                break;
            case "number":
                if (typeof item !== "number" || isNaN(item)) {
                    throw new Error(errM + ` ${dataType}`);
                }
                break;
            case "number+":
                if (typeof item !== "number" || isNaN(item) || item < 0) {
                    throw new Error(errM + ` ${dataType}`);
                }
                break;
            case "number-":
                if (typeof item !== "number" || isNaN(item) || item > 0) {
                    throw new Error(errM + ` ${dataType}`);
                }
                break;
            case "boolean":
                if (typeof item !== "boolean") {
                    throw new Error(errM + ` ${dataType}`);
                }
                break;
            case "array":
                if (!Array.isArray(item) || !item.length) {
                    throw new Error(errM + ` ${dataType}`);
                }
                break;
            case "string[]":
                if (!Array.isArray(item) ||
                    !item.length ||
                    !item.every((val) => typeof val === "string" && val !== "")) {
                    throw new Error(errM + ` ${dataType}`);
                }
                break;
            case "number[]":
                if (!Array.isArray(item) ||
                    !item.length ||
                    !item.every((val) => typeof val === "number" && !isNaN(val))) {
                    throw new Error(errM + ` ${dataType}`);
                }
                break;
            case "number+[]":
                if (!Array.isArray(item) ||
                    !item.length ||
                    !item.every((val) => typeof val === "number" && !isNaN(val) && val > -1)) {
                    throw new Error(errM + ` ${dataType}`);
                }
                break;
            case "number-[]":
                if (!Array.isArray(item) ||
                    !item.length ||
                    !item.every((val) => typeof val === "number" && !isNaN(val) && val < 1)) {
                    throw new Error(errM + ` ${dataType}`);
                }
                break;
            case "boolean[]":
                if (!Array.isArray(item) || !item.length || !item.every((val) => typeof val === "boolean")) {
                    throw new Error(errM + ` ${dataType}`);
                }
                break;
            case "object":
                if (typeof item !== "object" || !Object.values(item).length) {
                    throw new Error(errM + ` ${dataType}`);
                }
                if (isExtendedRule(rule) && rule.rules) {
                    (0, exports.validator)(item, rule.rules);
                }
                break;
            default:
                throw new Error(`${param} has unknown param`);
        }
    }
    return data;
};
exports.validator = validator;
const isExtendedRule = (rule) => {
    return rule.type !== undefined;
};
const getDatatType = (rule) => {
    if (isExtendedRule(rule)) {
        return rule.type;
    }
    return rule;
};
exports.default = exports.validator;
