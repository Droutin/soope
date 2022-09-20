import type Methods from "./methods";
import type { RequestHandler } from "express";

export interface DecoratedRoute {
    path: string;
    property: string;
    fn: RequestHandler;
    methods?: Lowercase<Methods>[];
    middleware?: string | RequestHandler;
}
export type Route = DecoratedRoute | RequestHandler;
export default Route;
