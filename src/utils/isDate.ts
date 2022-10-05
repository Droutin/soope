export const isDate = (val: string) => {
    return new Date(val).toString() !== "Invalid Date" && !isNaN(Date.parse(val));
};
export default isDate;
