import type { RouteParams } from "../types";
export declare const Route: (path: string, params?: RouteParams) => (_target: unknown, property: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export default Route;
