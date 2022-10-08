/* eslint-disable @typescript-eslint/no-namespace */
import dotenv from "dotenv";
import ErrorStackParser from "error-stack-parser";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import Express from "express";
import type { IncomingMessage, ServerResponse } from "http";
import onFinished from "on-finished";
import onHeaders from "on-headers";
import type { DecoratedRoute, DecoratedRouteHandler, Dirs, Hooks, Method, Middleware, Pagination } from "./types";
import { entries, isString, Logger, scanDir } from "./utils";

dotenv.config();

type THandler = DecoratedRouteHandler | RequestHandler;

export type { Express, NextFunction, Request, RequestHandler, Response } from "express";
/* export type { Request, Response } from "./types"; */
export const express = Express;
export const app = express();
export const router = express.Router();

const logger = new Logger({
    namespace: "core",
});

interface AccessRequest extends Request {
    _startAt?: [number, number];
}
interface AccessResponse extends ServerResponse<IncomingMessage> {
    _startAt?: [number, number];
}

function recordStartTime(this: AccessRequest | AccessResponse) {
    this._startAt = process.hrtime();
}

const getPerfMS = (start: [number, number], end: [number, number]) => {
    return (end[0] - start[0]) * 1e3 + (end[1] - start[1]) * 1e-6;
};

const logAccess = (req: AccessRequest, res: AccessResponse, next: NextFunction) => {
    req._startAt = undefined;
    res._startAt = undefined;
    recordStartTime.call(req);

    onHeaders(res, recordStartTime);
    onFinished(res, (_err, res) => {
        if (!req._startAt || !res._startAt) {
            return 0;
        }
        const contentLength = res.getHeader("Content-Length") ?? "N/A";
        const responseTime = getPerfMS(req._startAt, res._startAt).toFixed(3);
        logger.trace(`${req.method} ${req.url} ${res.statusCode} ${responseTime} ms - ${contentLength}`);
    });
    return next();
};

const parsePagination = (req: Request) => {
    const data = {
        page: req.get("X-Page"),
        perPage: req.get("X-PerPage"),
        orderBy: req.get("X-OrderBy"),
    };
    if (Object.values(data).filter(Boolean).length === 3) {
        const pagination = {
            page: parseInt(data.page as string),
            perPage: parseInt(data.perPage as string),
            orderBy:
                data.orderBy?.split(",").map((item) => {
                    const rule = item.split(":");
                    return {
                        [rule[0]]: rule[1],
                    };
                }) || {},
        } as Pagination;
        req.pagination = pagination;
    }
};

function sendPagination(
    this: Response,
    { count, maxPage, currentPage }: { count: number; maxPage: number; currentPage: number }
) {
    this.setHeader("X-Count", count);
    this.setHeader("X-MaxPage", maxPage);
    this.setHeader("X-CurrentPage", currentPage);
}

export class Soope {
    private params = new Map();
    private hooks: Hooks = {
        beforeStart: undefined,
        afterStart: undefined,
    };
    private dirs: Dirs = {
        routes: "routes",
        middlewares: "middlewares",
    };
    private middlewares: Map<string, FunctionConstructor> = new Map();
    private middlewareQueue: string[] = [];
    /**
     * Performance timer
     */
    private startTime: [number, number] = [0, 0];
    private root: string;

    /**
     * Creates an instance of Soope.
     * ``` ts
     * const soope = new Soope(__dirname)
     * ```
     * @param {string} root
     * @memberof Soope
     */
    constructor(root: string) {
        this.root = root + "/";
        this.setParam("PORT", 8000);

        app.use(express.static("public"));
        app.use((req, res, next) => {
            res.removeHeader("Server");
            res.removeHeader("Via");
            res.removeHeader("X-Powered-By");

            res.sendPagination = sendPagination.bind(res);

            parsePagination(req);

            return next();
        });
        if (process.env.LOG_LEVELS?.match(/(trace|all)/)) {
            app.use(logAccess);
        }
    }

    /**
     *
     *
     * @param {keyof Dirs} name
     * @param {string} path
     * @memberof Soope
     */
    setDir(name: keyof Dirs, path: string) {
        path = path.endsWith("/") ? path.slice(0, -1) : path;
        path = path.startsWith("/") ? path.slice(1) : path;
        this.dirs[name] = path;
    }

    /**
     *
     *
     * @param {Dirs} dirs
     * @memberof Soope
     */
    setDirs(dirs: Dirs) {
        entries(dirs).forEach(([name, path]) => {
            this.setDir(name, path);
        });
    }

    /**
     *
     *
     * @return {*}
     * @memberof Soope
     */
    getDirs() {
        return this.dirs;
    }
    /**
     * Get dir
     */
    getDir(name: keyof Dirs) {
        return this.dirs[name];
    }

    /**
     *
     *
     * @param {CallableFunction} callable
     * @memberof Soope
     */
    beforeStart(callable: CallableFunction) {
        this.setHook("beforeStart", callable);
    }

    /**
     *
     *
     * @param {CallableFunction} callable
     * @memberof Soope
     */
    afterStart(callable: CallableFunction) {
        this.setHook("afterStart", callable);
    }
    /**
     * Get hook
     */
    getHook(name: keyof Hooks) {
        return this.hooks[name];
    }
    /**
     * Set hook
     */
    private setHook(name: keyof Hooks, callable: CallableFunction) {
        this.hooks[name] = callable;
    }
    /**
     * Set param
     */
    setParam(name: string, value: string | number | boolean) {
        this.params.set(name.toUpperCase(), value);
    }
    /**
     * Get param
     */
    getParam(name: string) {
        return this.params.get(name.toUpperCase());
    }

    /**
     * Set object of params
     */
    setParams(params: NodeJS.ProcessEnv | Record<string, string | number | boolean>) {
        Object.entries(params).forEach(([name, value]) => {
            this.setParam(name, value as string);
        });
    }
    /**
     * Get params
     */
    getParams() {
        return this.params;
    }
    /**
     * Set port from args
     */
    private setArgPort() {
        const args = process.argv.slice(2);
        const port = args[0];
        if (port) {
            this.setParam("PORT", parseInt(port, 10));
        }
    }
    /**
     * Load envs to params
     */
    private loadEnv() {
        this.setParams(process.env);
    }
    /**
     * Start application
     */
    async start(params?: Record<string, string | number | boolean>) {
        if (params) this.setParams(params);
        this.loadEnv();
        this.setArgPort();

        app.listen(this.params.get("PORT"), async () => {
            this.startTime = process.hrtime();
            console.log(
                "\x1b[32m%s\x1b[0m",
                `[server] 🔌 Project '${process.env.npm_package_name}'[${process.env.npm_package_version}] is starting`
            );
            if (this.hooks.beforeStart) {
                await this.hooks.beforeStart();
            }
            this.startProcedure();
        });
    }
    /**
     * Procedure after start
     */
    private async startProcedure() {
        try {
            await this.importMiddlewares();
            this.initMiddlewares();
            await this.initRoutes();
            this.initErrorHandler();
        } catch (error) {
            logger.error(error);
        }

        console.log("\x1b[32m%s\x1b[0m", `[server] 🚀 http://localhost:${this.params.get("PORT")}`);
        if (this.hooks.afterStart) {
            await this.hooks.afterStart();
        }
        const took = getPerfMS(this.startTime, process.hrtime()).toFixed(3);
        console.log("\x1b[32m%s\x1b[0m", `[server] 🔥 Start took ${took}ms`);
    }
    /**
     * Request handler
     */
    private requestHandler = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
        return Promise.resolve(fn(req, res, next)).catch(next);
    };
    /**
     * Default ErrorHandler
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
        const http = 500;
        const stack = ErrorStackParser.parse(err);
        const message: {
            http: number;
            message: string;
            stack?: unknown[];
        } = {
            http,
            message: process.env.DEBUG === "true" ? err.message : "Internal Server Error",
        };
        if (process.env.DEBUG === "true") message.stack = stack;
        logger.error(message.message);
        logger.error(stack);
        logger.debug("data:", req.method === "GET" ? req.query : req.body);
        return res.status(http).send(message);
    };
    /**
     * Method for setting new/custom Error Handler
     */
    setErrorHandler(handler: (err: Error, req: Request, res: Response, next?: NextFunction) => Response) {
        this.errorHandler = handler;
    }
    /**
     * Init of Error Handler
     */
    private initErrorHandler() {
        app.use(this.errorHandler);
    }
    /**
     * Path builder for Router
     */
    private buildPath(dir: string, filePath: string, endpoint: string | undefined) {
        const regexp = new RegExp(`(?<=${dir})(.*?)(?=\\.)`);
        const pathArray = filePath.match(regexp);
        if (!pathArray) throw new Error("Cant build URI");
        let path = pathArray[0];

        if (endpoint) path = path.replace(/\/[^/]*$/, endpoint);
        return path.endsWith("/index") ? path.replace("/index", "/") : path;
    }
    private isDecoratedHandler(handler: THandler): handler is DecoratedRouteHandler {
        return typeof handler !== "function";
    }
    private initRoute(
        className: string,
        route: DecoratedRoute,
        handler: THandler,
        path: string,
        method = "get",
        crudPath?: string
    ) {
        let endpoint = path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
        let property: string;
        let reqHandler: RequestHandler;
        let methods = [method] as Lowercase<Method>[];
        const middlewares: RequestHandler[] = [];

        if (this.isDecoratedHandler(handler)) {
            endpoint += handler.path;
            property = handler.property;
            reqHandler = handler.fn;
            if (handler.methods) {
                methods = handler.methods;
            }

            const usedMiddlewares: string[] = [];

            handler.middlewares.forEach((middleware) => {
                let middlewareName: string;
                let hooked = false;
                if (isString(middleware)) {
                    if (usedMiddlewares.includes(middleware)) {
                        throw new Error(`Middleware ${middleware} was already hooked`);
                    }
                    const importedMiddleware = this.middlewares.get(middleware);
                    if (!importedMiddleware) {
                        throw new Error(`Middleware ${middleware} do not exist`);
                    }
                    const Middleware = new importedMiddleware() as Middleware;

                    if (!Middleware.handler) {
                        throw new Error(`Middleware ${middleware} needs public method 'handler'`);
                    }

                    middlewares.push(Middleware.handler.bind(Middleware));
                    middlewareName = middleware;
                    usedMiddlewares.push(middlewareName);
                    hooked = true;
                } else {
                    middlewares.push(middleware);
                    middlewareName = middleware.name || "Anonymous function";
                    hooked = true;
                }
                if (hooked) {
                    logger.trace(`scoped Middleware '${middlewareName}' hooked`);
                    if (process.env.LOG_LEVELS?.match(/(debug|all)/)) {
                        middlewares.unshift((_req, _res, next) => {
                            logger.debug(`scoped middleware '${middlewareName}' triggered`);
                            return next();
                        });
                    }
                }
            });
        } else {
            if (crudPath) {
                endpoint += crudPath;
            }
            property = handler.name;
            reqHandler = handler;
        }

        const handlerStack = [...middlewares, this.requestHandler(reqHandler.bind(route))];

        methods.forEach((method) => {
            const path = `${method.toUpperCase()}-${endpoint}`;
            if (this.usedPaths.includes(path)) {
                throw new Error(`${path} is in use`);
            }
            this.usedPaths.push(path);
            logger.trace(`route ${endpoint} [${method.toUpperCase()}] from ${className}.${property} hooked`);
            router[method](endpoint, ...handlerStack);
        });
    }
    private usedPaths: string[] = [];
    private defaultHomepage() {
        router.get(
            "/",
            this.requestHandler((req, res) => {
                return res.send({
                    name: process.env.npm_package_name || "Service",
                    version: process.env.npm_package_version || "1.0.0",
                });
            })
        );
        logger.trace(`default homepage hooked`);
    }
    private classess: string[] = [];
    getRoutes() {
        return this.classess.filter((name) => name.endsWith("Route"));
    }
    getMiddlewares() {
        return this.classess.filter((name) => name.endsWith("Middleware"));
    }
    private async autoImport(
        dir: string,
        fn: <T extends FunctionConstructor>(file: T, className: string, filePath: string, dir: string) => void
    ) {
        const filePaths = await scanDir(this.root, dir);
        for (const filePath of filePaths) {
            try {
                const { default: File } = await require(filePath);
                const className = File.name;
                if (this.classess.includes(className)) {
                    throw new Error(`${className} already in use`);
                }
                this.classess.push(className);
                fn(File, className, filePath, dir);
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.message === "Cannot read properties of undefined (reading 'name')"
                ) {
                    throw new Error(`missing default export in ${filePath}`);
                }
                throw error;
            }
        }
    }
    private cruds = {
        index: {
            method: "get",
            path: "/",
        },
        show: {
            method: "get",
            path: "/:id",
        },
        store: {
            method: "post",
            path: "/",
        },
        update: {
            method: "patch",
            path: "/:id",
        },
        destroy: {
            method: "delete",
            path: "/:id",
        },
    };
    private async initRoutes() {
        await this.autoImport(this.dirs.routes, (Route, className, filePath, dir) => {
            const route = new Route() as DecoratedRoute;
            const handlers = Object.getOwnPropertyNames(Route.prototype).filter(
                (item) => !["constructor", "path", "crud"].includes(item)
            );
            const path = this.buildPath(dir, filePath, route?.path);

            if (route?.crud) {
                entries(this.cruds)
                    .filter(([crudHandler]) => handlers.includes(crudHandler))
                    .forEach(([crudHandler, obj]) => {
                        this.initRoute(className, route, route[crudHandler] as THandler, path, obj.method, obj.path);
                    });
            } else {
                handlers.forEach((handler) => {
                    this.initRoute(className, route, route[handler] as THandler, path);
                });
            }
        });
        if (!this.usedPaths.includes("GET-/")) {
            this.defaultHomepage();
        }
        app.use(router);
    }

    /**
     * Import of Middlewares
     */
    private async importMiddlewares() {
        try {
            await this.autoImport(this.dirs.middlewares, (Middleware, className) => {
                this.middlewares.set(className, Middleware);
            });
        } catch (error) {
            if (error instanceof Error && error.message.includes("cant access dir")) {
                return;
            }
            throw error;
        }
    }
    /**
     * Init all Middleware in queue
     */
    initMiddlewares() {
        this.middlewareQueue.forEach((name) => {
            const Middleware = this.middlewares.get(name);
            if (!Middleware) {
                throw new Error(`Middleware ${name} do not exist`);
            }

            const middleware = new Middleware() as Middleware;
            if (!middleware.handler) {
                throw new Error(`Middleware ${name} needs public method 'handler'`);
            }
            if (process.env.LOG_LEVELS?.match(/(debug|all)/)) {
                app.use((_req, _res, next) => {
                    logger.debug(`global middleware '${name}' triggered`);
                    return next();
                });
            }
            app.use(middleware.handler);
            logger.trace(`global Middleware '${name}' hooked`);
        });
    }
    /**
     * Add Middleware to queue
     */
    useMiddleware(name: string) {
        this.middlewareQueue.push(name);
    }
}

export default Soope;
declare global {
    namespace Express {
        export interface Response {
            sendPagination: (
                this: Response,
                { count, maxPage, currentPage }: { count: number; maxPage: number; currentPage: number }
            ) => void;
        }
        export interface Request {
            pagination?: Pagination;
        }
    }
}
