export const Path = (path: string) => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (ctr: Function) => {
        ctr.prototype.path = path;
    };
};
export default Path;
