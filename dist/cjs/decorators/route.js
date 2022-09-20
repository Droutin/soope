"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const Route = (path, params) => {
    const decorator = (target, property, descriptor) => {
        descriptor.value = {
            path,
            property,
            fn: descriptor.value,
            methods: params?.methods?.map((method) => method.toLowerCase()),
            middleware: params?.middleware,
        };
        return descriptor;
    };
    return decorator;
};
exports.Route = Route;
exports.default = exports.Route;
