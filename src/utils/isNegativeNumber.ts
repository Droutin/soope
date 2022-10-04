import { isNumber } from ".";
export const isNegativeNumber = (val: number) => {
    return isNumber(val) && val <= 0;
};
export default isNegativeNumber;
