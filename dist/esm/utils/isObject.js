export const isObject = (val) => {
    return typeof val === "object" && val !== null && Object.values(val).length > 0;
};
export default isObject;
