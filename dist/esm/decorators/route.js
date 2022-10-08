import { isArray, isString } from "../utils";
export const Route = (path, params) => {
    const decorator = (_target, property, descriptor) => {
        let methods = undefined;
        if (params?.method) {
            if (isString(params.method)) {
                methods = [params.method];
            }
            else {
                methods = params.method;
            }
        }
        let middlewares = [];
        if (params?.middleware) {
            if (!isArray(params.middleware)) {
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
export default Route;
