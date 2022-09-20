export const Path = (path) => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (ctr) => {
        ctr.prototype.path = path;
    };
};
export default Path;
