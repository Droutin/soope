import type { RequestHandler } from "express";
export type MiddlewareHandler = string | RequestHandler;
export default MiddlewareHandler;
