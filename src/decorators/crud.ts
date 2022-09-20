// eslint-disable-next-line @typescript-eslint/ban-types
export const CRUD = (ctr: Function) => {
    ctr.prototype.crud = true;
};
export default CRUD;
