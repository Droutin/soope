import { isArray, isBoolean, isDate, isEmail, isNegativeNumber, isNumber, isObject, isPositiveNumber, isString, } from ".";
const conditions = (item, rule, param) => {
    const dataType = getDatatType(rule);
    if (dataType.endsWith("?") && (item === null || item === undefined)) {
        return 0;
    }
    if (item === null || item === undefined) {
        throw new Error(getErrorMessage("REQUIRED", param));
    }
    const errM = getErrorMessage("WRONG_DATATYPE", param, dataType);
    switch (dataType.replace("?", "")) {
        case "string":
            if (!isString(item)) {
                throw new Error(errM);
            }
            break;
        case "date":
            if (!isString(item) || !isDate(item)) {
                throw new Error(errM);
            }
            break;
        case "email":
            if (!isString(item) || !isEmail(item)) {
                throw new Error(errM);
            }
            break;
        case "number":
            if (!isNumber(item)) {
                throw new Error(errM);
            }
            break;
        case "number+":
            if (!isNumber(item) || !isPositiveNumber(item)) {
                throw new Error(errM);
            }
            break;
        case "number-":
            if (!isNumber(item) || !isNegativeNumber(item)) {
                throw new Error(errM);
            }
            break;
        case "boolean":
            if (!isBoolean(item)) {
                throw new Error(errM);
            }
            break;
        case "array":
            if (!isArray(item)) {
                throw new Error(errM);
            }
            break;
        case "object":
            if (!isObject(item)) {
                throw new Error(errM);
            }
            if (isExtendedRule(rule) && rule.rules) {
                validator(item, rule.rules);
            }
            break;
        case "string[]":
            if (!isArray(item) || !item.every((val) => isString(val))) {
                throw new Error(errM);
            }
            break;
        case "date[]":
            if (!isArray(item) || !item.every((val) => isString(val) && isDate(val))) {
                throw new Error(errM);
            }
            break;
        case "email[]":
            if (!isArray(item) || !item.every((val) => isString(val) && isEmail(val))) {
                throw new Error(errM);
            }
            break;
        case "number[]":
            if (!isArray(item) || !item.every((val) => isNumber(val))) {
                throw new Error(errM);
            }
            break;
        case "number+[]":
            if (!isArray(item) || !item.every((val) => isNumber(val) && isPositiveNumber(val))) {
                throw new Error(errM);
            }
            break;
        case "number-[]":
            if (!isArray(item) || !item.every((val) => isNumber(val) && isNegativeNumber(val))) {
                throw new Error(errM);
            }
            break;
        case "boolean[]":
            if (!isArray(item) || !item.every((val) => isBoolean(val))) {
                throw new Error(errM);
            }
            break;
        case "object[]":
            if (!isArray(item) ||
                !item.every((val) => {
                    if (isExtendedRule(rule) && rule.rules) {
                        validator(val, rule.rules);
                    }
                    return isObject(val);
                })) {
                throw new Error(errM);
            }
            break;
        default:
            throw new Error(getErrorMessage("UNKNOWN_DATATYPE", param, typeof item));
    }
};
export const validator = (data, rules) => {
    const rulesEntries = Object.entries(rules);
    if (rulesEntries.find((item) => item[0] === "$PROP")) {
        for (const item of Object.values(data)) {
            conditions(item, rulesEntries[0][1], rulesEntries[0][0]);
        }
        return data;
    }
    for (const [param, rule] of rulesEntries) {
        conditions(data[param], rule, param);
    }
    return data;
};
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
export default validator;
