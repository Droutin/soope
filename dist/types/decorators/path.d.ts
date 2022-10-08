import type { DecoratedRoute } from "../types";
export declare const Path: (path: string) => (ctr: {
    prototype: DecoratedRoute;
}) => void;
export default Path;
