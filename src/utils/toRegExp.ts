export const toRegExp = (re: string) => {
    if (re.startsWith("/") && re.endsWith("/")) {
        re = re.slice(1, -1);
    }
    return new RegExp(re);
};
export default toRegExp;
