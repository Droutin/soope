import { isNumber } from ".";
export const isPositiveNumber = (val) => {
    return isNumber(val) && val >= 0;
};
export default isPositiveNumber;
