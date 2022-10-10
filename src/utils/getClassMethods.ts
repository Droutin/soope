// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getClassMethods = (toCheck: { [index: string]: any }) => {
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
export default getClassMethods;
