export const Path = (path: string) => {
    return (ctr: Function) => {
        ctr.prototype.path = path;
    };
};
export default Path;
