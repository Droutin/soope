import type { RequestHandler } from "express";
export interface Middleware extends Function {
    handler: RequestHandler;
}
export default Middleware;
