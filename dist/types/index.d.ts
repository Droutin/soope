import Express from "express";
import type { Request, Response, NextFunction } from "express";
import type Dirs from "./types/dirs";
/**
 * Exports
 */
export type { Request, Response, NextFunction, RequestHandler, Express } from "express";
export declare const express: typeof Express;
export declare const app: import("express-serve-static-core").Express;
export declare const router: import("express-serve-static-core").Router;
export declare class Core {
    private params;
    private hooks;
    private dirs;
    private middlewares;
    private middlewareQueue;
    /**
     * Performance timer
     */
    private startTime;
    constructor();
    /**
     * Set dir
     */
    setDir(name: keyof Dirs, path: string): void;
    /**
     * Set dirs
     */
    setDirs(dirs: Dirs): void;
    /**
     * Before start hook
     */
    beforeStart(callable: CallableFunction): void;
    /**
     * After start hook
     */
    afterStart(callable: CallableFunction): void;
    /**
     * Set hook
     */
    private setHook;
    /**
     * Set param
     */
    private setParam;
    /**
     * Set object of params
     */
    private setParams;
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
     * Scanner for autoimport
     */
    private scanDir;
    /**
     * Path builder for Router
     */
    private buildPath;
    private initRoute;
    /**
     * Init of Routes
     */
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
export default Core;
