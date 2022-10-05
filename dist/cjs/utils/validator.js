"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validator = void 0;
const _1 = require(".");
const validator = (data, rules) => {
    for (const [param, rule] of Object.entries(rules)) {
        const item = data[param];
        const dataType = getDatatType(rule);
        if (dataType.endsWith("?") && (item === null || item === undefined)) {
            continue;
        }
        if (item === null || item === undefined) {
            throw new Error(getErrorMessage("REQUIRED", param));
        }
        const errM = getErrorMessage("WRONG_DATATYPE", param, dataType);
        switch (dataType.replace("?", "")) {
            case "string":
                if (!(0, _1.isString)(item)) {
                    throw new Error(errM);
                }
                break;
            case "date":
                if (!(0, _1.isString)(item) || !(0, _1.isDate)(item)) {
                    throw new Error(errM);
                }
                break;
            case "email":
                if (!(0, _1.isString)(item) || !(0, _1.isEmail)(item)) {
                    throw new Error(errM);
                }
                break;
            case "number":
                if (!(0, _1.isNumber)(item)) {
                    throw new Error(errM);
                }
                break;
            case "number+":
                if (!(0, _1.isNumber)(item) || !(0, _1.isPositiveNumber)(item)) {
                    throw new Error(errM);
                }
                break;
            case "number-":
                if (!(0, _1.isNumber)(item) || !(0, _1.isNegativeNumber)(item)) {
                    throw new Error(errM);
                }
                break;
            case "boolean":
                if (!(0, _1.isBoolean)(item)) {
                    throw new Error(errM);
                }
                break;
            case "array":
                if (!(0, _1.isArray)(item)) {
                    throw new Error(errM);
                }
                break;
            case "object":
                if (!(0, _1.isObject)(item)) {
                    throw new Error(errM);
                }
                if (isExtendedRule(rule) && rule.rules) {
                    (0, exports.validator)(item, rule.rules);
                }
                break;
            case "string[]":
                if (!(0, _1.isArray)(item) || !item.every((val) => (0, _1.isString)(val))) {
                    throw new Error(errM);
                }
                break;
            case "date[]":
                if (!(0, _1.isArray)(item) || !item.every((val) => (0, _1.isString)(val) && (0, _1.isDate)(val))) {
                    throw new Error(errM);
                }
                break;
            case "email[]":
                if (!(0, _1.isArray)(item) || !item.every((val) => (0, _1.isString)(val) && (0, _1.isEmail)(val))) {
                    throw new Error(errM);
                }
                break;
            case "number[]":
                if (!(0, _1.isArray)(item) || !item.every((val) => (0, _1.isNumber)(val))) {
                    throw new Error(errM);
                }
                break;
            case "number+[]":
                if (!(0, _1.isArray)(item) || !item.every((val) => (0, _1.isNumber)(val) && (0, _1.isPositiveNumber)(val))) {
                    throw new Error(errM);
                }
                break;
            case "number-[]":
                if (!(0, _1.isArray)(item) || !item.every((val) => (0, _1.isNumber)(val) && (0, _1.isNegativeNumber)(val))) {
                    throw new Error(errM);
                }
                break;
            case "boolean[]":
                if (!(0, _1.isArray)(item) || !item.every((val) => (0, _1.isBoolean)(val))) {
                    throw new Error(errM);
                }
                break;
            case "object[]":
                if (!(0, _1.isArray)(item) ||
                    !item.every((val) => {
                        if (isExtendedRule(rule) && rule.rules) {
                            (0, exports.validator)(val, rule.rules);
                        }
                        return (0, _1.isObject)(val);
                    })) {
                    throw new Error(errM);
                }
                break;
            default:
                throw new Error(getErrorMessage("UNKNOWN_DATATYPE", param, typeof item));
        }
    }
    return data;
};
exports.validator = validator;
const getErrorMessage = (code, ...v) => {
    if (process.env.DEBUG === "true") {
        switch (code) {
            case "REQUIRED":
                return `Param '${v[0]}' is required`;
            case "WRONG_DATATYPE":
                return `Param '${v[0]}' has wrong DataType. Expected '${v[1]}'`;
            case "UNKNOWN_DATATYPE":
                return `Param '${v[0]}' has unknown DataType. Received '${v[1]}'`;
            default:
                return "Unknown Validation Error";
        }
    }
    return "Validation Error";
};
const isExtendedRule = (rule) => {
    return rule.dataType !== undefined;
};
const getDatatType = (rule) => {
    if (isExtendedRule(rule)) {
        return rule.dataType;
    }
    return rule;
};
exports.default = exports.validator;
