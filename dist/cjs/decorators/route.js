"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const utils_1 = require("../utils");
const Route = (path, params) => {
    const decorator = (_target, property, descriptor) => {
        let methods = undefined;
        if (params?.method) {
            if ((0, utils_1.isString)(params.method)) {
                methods = [params.method];
            }
            else {
                methods = params.method;
            }
        }
        let middlewares = [];
        if (params?.middleware) {
            if (!(0, utils_1.isArray)(params.middleware)) {
                middlewares = [params.middleware];
            }
            else {
                middlewares = params.middleware;
            }
        }
        descriptor.value = {
            path,
            property,
            fn: descriptor.value,
            methods: methods?.map((method) => method.toLowerCase()),
            middlewares: middlewares,
        };
        return descriptor;
    };
    return decorator;
};
exports.Route = Route;
exports.default = exports.Route;
