export const isDate = (val) => {
    return new Date(val).toString() !== "Invalid Date" && !isNaN(Date.parse(val));
};
export default isDate;
