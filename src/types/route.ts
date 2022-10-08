import type { RequestHandler } from "express";
import type Methods from "./method";

export interface DecoratedRoute {
    path: string;
    property: string;
    fn: RequestHandler;
    methods?: Lowercase<Methods>[];
    middleware?: string | RequestHandler;
}
export type Route = DecoratedRoute | RequestHandler;
export default Route;
