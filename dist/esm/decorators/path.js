export const Path = (path) => {
    return (ctr) => {
        ctr.prototype.path = path;
    };
};
export default Path;
