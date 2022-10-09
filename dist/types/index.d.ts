/// <reference types="node" />
import type { NextFunction, Request, Response } from "express";
import Express from "express";
import type { Dirs, Hooks, Pagination } from "./types";
export type { Express, NextFunction, Request, RequestHandler, Response } from "express";
export declare const express: typeof Express;
export declare const app: import("express-serve-static-core").Express;
export declare const router: import("express-serve-static-core").Router;
export declare class Soope {
    private params;
    private hooks;
    private dirs;
    private middlewares;
    private middlewareQueue;
    /**
     * Performance timer
     */
    private startTime;
    private root;
    /**
     * Creates an instance of Soope.
     * ``` ts
     * const soope = new Soope(__dirname)
     * ```
     * @param {string} root
     * @memberof Soope
     */
    constructor(root: string);
    /**
     *
     *
     * @param {keyof Dirs} name
     * @param {string} path
     * @memberof Soope
     */
    setDir(name: keyof Dirs, path: string): void;
    /**
     *
     *
     * @param {Dirs} dirs
     * @memberof Soope
     */
    setDirs(dirs: Dirs): void;
    /**
     *
     *
     * @return {*}
     * @memberof Soope
     */
    getDirs(): Dirs;
    /**
     * Get dir
     */
    getDir(name: keyof Dirs): string;
    /**
     *
     *
     * @param {CallableFunction} callable
     * @memberof Soope
     */
    beforeStart(callable: CallableFunction): void;
    /**
     *
     *
     * @param {CallableFunction} callable
     * @memberof Soope
     */
    afterStart(callable: CallableFunction): void;
    /**
     * Get hook
     */
    getHook(name: keyof Hooks): CallableFunction | undefined;
    /**
     * Set hook
     */
    private setHook;
    /**
     * Set param
     */
    setParam(name: string, value: string | number | boolean): void;
    /**
     * Get param
     */
    getParam(name: string): any;
    /**
     * Set object of params
     */
    setParams(params: NodeJS.ProcessEnv | Record<string, string | number | boolean>): void;
    /**
     * Get params
     */
    getParams(): Map<any, any>;
    /**
     * Set port from args
     */
    private setArgPort;
    /**
     * Load envs to params
     */
    private loadEnv;
    /**
     * Start application
     */
    start(params?: Record<string, string | number | boolean>): Promise<void>;
    /**
     * Procedure after start
     */
    private startProcedure;
    /**
     * Request handler
     */
    private requestHandler;
    /**
     * Default ErrorHandler
     */
    private errorHandler;
    /**
     * Method for setting new/custom Error Handler
     */
    setErrorHandler(handler: (err: Error, req: Request, res: Response, next?: NextFunction) => Response): void;
    /**
     * Init of Error Handler
     */
    private initErrorHandler;
    /**
     * Path builder for Router
     */
    private buildPath;
    private isDecoratedHandler;
    private initRoute;
    private usedPaths;
    private defaultHomepage;
    private classess;
    getRoutes(): string[];
    getMiddlewares(): string[];
    private autoImport;
    private cruds;
    private initRoutes;
    /**
     * Import of Middlewares
     */
    private importMiddlewares;
    /**
     * Init all Middleware in queue
     */
    initMiddlewares(): void;
    /**
     * Add Middleware to queue
     */
    useMiddleware(name: string): void;
}
export default Soope;
declare global {
    namespace Express {
        interface Request {
            getPagination: (this: Request, { page, perPage, orderBy }: Pagination) => void;
            accessControl: string;
        }
        interface Response {
            sendPagination: (this: Response, { count, maxPage, currentPage }: {
                count: number;
                maxPage: number;
                currentPage: number;
            }) => void;
        }
    }
}
