export const isArray = (val: unknown): val is unknown[] => {
    return Array.isArray(val) && val.length > 0;
};
export default isArray;
