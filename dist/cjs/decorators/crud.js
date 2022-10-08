"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRUD = void 0;
/**
 * - index - / [GET]
 * - show - /:id [GET]
 * - store - / [POST]
 * - update - /:id [PATCH]
 * - destroy - /:id [DELETE]
 */
// eslint-disable-next-line @typescript-eslint/ban-types
const CRUD = (ctr) => {
    ctr.prototype.crud = true;
};
exports.CRUD = CRUD;
exports.default = exports.CRUD;
