import type { RequestHandler } from "express";
import type { Method, MiddlewareHandler } from ".";
export interface DecoratedRouteHandler {
    path: string;
    property: string;
    fn: RequestHandler;
    methods?: Lowercase<Method>[];
    middlewares: MiddlewareHandler[];
}
export default DecoratedRouteHandler;
