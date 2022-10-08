import type { DecoratedRoute } from "../types";
export const Path = (path: string) => {
    return (ctr: { prototype: DecoratedRoute }) => {
        ctr.prototype.path = path;
    };
};
export default Path;
