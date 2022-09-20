import type RouteParams from "../types/routeParams";
export declare const Route: (path: string, params?: RouteParams) => (_target: unknown, property: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export default Route;
