export const Route = (path, params) => {
    const decorator = (_target, property, descriptor) => {
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
