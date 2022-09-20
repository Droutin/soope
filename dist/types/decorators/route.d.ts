import type RouteParams from "../types/routeParams";
export declare const Route: (path: string, params?: RouteParams) => (target: Record<string, any>, property: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export default Route;
