import type { DecoratedRoute } from "../types";
export const CRUD = (ctr: { prototype: DecoratedRoute }) => {
    ctr.prototype.crud = true;
};
export default CRUD;
