export const isNumber = (val: unknown): val is number => {
    return typeof val === "number" && !isNaN(val);
};
export default isNumber;
