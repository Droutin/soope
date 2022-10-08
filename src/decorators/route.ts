import type { DecoratedRouteHandler, Method, MiddlewareHandler, RouteParams } from "../types";
import { isArray, isString } from "../utils";

export const Route = (path: string, params?: RouteParams) => {
    const decorator = (_target: unknown, property: string, descriptor: PropertyDescriptor) => {
        let methods: Method[] | undefined = undefined;
        if (params?.method) {
            if (isString(params.method)) {
                methods = [params.method];
            } else {
                methods = params.method;
            }
        }

        let middlewares: MiddlewareHandler[] = [];
        if (params?.middleware) {
            if (!isArray(params.middleware)) {
                middlewares = [params.middleware];
            } else {
                middlewares = params.middleware;
            }
        }

        descriptor.value = {
            path,
            property,
            fn: descriptor.value,
            methods: methods?.map((method) => method.toLowerCase()),
            middlewares: middlewares,
        } as DecoratedRouteHandler;
        return descriptor;
    };
    return decorator;
};
export default Route;
