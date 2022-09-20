export const CRUD = (ctr: CallableFunction) => {
    ctr.prototype.crud = true;
};
export default CRUD;
