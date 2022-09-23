/// <reference types="node" />
import Express from "express";
import type { Request, Response, NextFunction } from "express";
/**
 * Types of Core
 */
import type Hooks from "./types/hooks";
import type Dirs from "./types/dirs";
/**
 * Exports
 */
export type { Request, Response, NextFunction, RequestHandler, Express } from "express";
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
     * Use __dirname as root dir
     */
    constructor(root: string);
    /**
     * Set dir
     */
    setDir(name: keyof Dirs, path: string): void;
    /**
     * Set dirs
     */
    setDirs(dirs: Dirs): void;
    /**
     * Get dirs
     */
    getDirs(): Dirs;
    /**
     * Get dir
     */
    getDir(name: keyof Dirs): string;
    /**
     * Before start hook
     */
    beforeStart(callable: CallableFunction): void;
    /**
     * After start hook
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
    private initRoute;
    private usedPaths;
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
export default Soope;
