import { isNumber } from ".";
export const isNegativeNumber = (val) => {
    return isNumber(val) && val <= 0;
};
export default isNegativeNumber;
