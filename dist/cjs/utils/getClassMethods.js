"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassMethods = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getClassMethods = (toCheck) => {
    const methods = [
        ...Object.getOwnPropertyNames(Object.getPrototypeOf(toCheck)),
        ...Object.getOwnPropertySymbols(toCheck).map((symbol) => symbol.toString()),
    ];
    return methods.filter((method) => {
        if (["constructor", "path", "crud"].includes(method)) {
            return false;
        }
        const handler = toCheck[method].fn || toCheck[method];
        if (typeof handler !== "function") {
            return false;
        }
        return true;
    });
};
exports.getClassMethods = getClassMethods;
exports.default = exports.getClassMethods;
