export const isObject = (val: unknown): val is Record<string, unknown> => {
    return typeof val === "object" && val !== null && Object.values(val).length > 0;
};
export default isObject;
