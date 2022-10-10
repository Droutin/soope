// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getClassMethods = (toCheck) => {
    const methods = [
        ...Object.getOwnPropertyNames(Object.getPrototypeOf(toCheck)),
        ...Object.getOwnPropertySymbols(toCheck).map((symbol) => symbol.toString()),
    ];
    return methods.filter((method) => {
        if (["constructor", "path", "crud"].includes(method)) {
            return false;
        }
        if (typeof toCheck[method] !== "function") {
            return false;
        }
        return true;
    });
};
export default getClassMethods;
