import type RouteParams from "../types/routeParams";

export const Route = (path: string, params?: RouteParams) => {
    const decorator = (
        target: Record<string, string | number | boolean>,
        property: string,
        descriptor: PropertyDescriptor
    ) => {
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
export default Route;
