/**
 * - index - / [GET]
 * - show - /:id [GET]
 * - store - / [POST]
 * - update - /:id [PATCH]
 * - destroy - /:id [DELETE]
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const CRUD = (ctr: Function) => {
    ctr.prototype.crud = true;
};
export default CRUD;
