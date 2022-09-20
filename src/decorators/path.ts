export const Path = (path: string) => {
    return (ctr: CallableFunction) => {
        ctr.prototype.path = path;
    };
};
export default Path;
