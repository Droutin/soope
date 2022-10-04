import { isNumber } from ".";
export const isPositiveNumber = (val: number) => {
    return isNumber(val) && val >= 0;
};
export default isPositiveNumber;
