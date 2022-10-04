export const isNumber = (val) => {
    return typeof val === "number" && !isNaN(val);
};
export default isNumber;
