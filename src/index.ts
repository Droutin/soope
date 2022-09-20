import Express from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import dotenv from "dotenv";

dotenv.config();

/**
 * Types of Core
 */
import type Hooks from "./types/hooks";
import type Dirs from "./types/dirs";
import type Methods from "./types/methods";
import type Route from "./types/route";

/**
 * Parts of Core
 */
import entries from "./utils/entries";
import scanDir from "./utils/scanDir";

/**
 * Exports
 */
export type { Request, Response, NextFunction, RequestHandler, Express } from "express";
export const express = Express;
export const app = express();
export const router = express.Router();

export class Core {
    private params = new Map();
    private hooks: Hooks = {
        beforeStart: undefined,
        afterStart: undefined,
    };
    private dirs: Dirs = {
        routes: "routes",
        middlewares: "middlewares",
    };
    private middlewares = new Map();
    private middlewareQueue: string[] = [];
    /**
     * Performance timer
     */
    private startTime = 0;
    private root: string;

    constructor(root: string) {
        this.root = root + "/";
        app.use(express.static("public"));
        app.use((req, res, next) => {
            res.removeHeader("Server");
            res.removeHeader("Via");
            res.removeHeader("X-Powered-By");
            next();
        });
        router.get(
            "/",
            this.requestHandler((req, res) => {
                return res.send({
                    name: process.env.npm_package_name || "Service",
                    version: process.env.npm_package_version || "1.0.0",
                });
            })
        );
    }
    /**
     * Set dir
     */
    setDir(name: keyof Dirs, path: string) {
        this.dirs[name] = path.endsWith("/") ? path.replace("/", "") : path;
    }
    /**
     * Set dirs
     */
    setDirs(dirs: Dirs) {
        entries(dirs).forEach(([name, path]) => {
            this.setDir(name, path);
        });
    }
    /**
     * Before start hook
     */
    beforeStart(callable: CallableFunction) {
        this.setHook("beforeStart", callable);
    }
    /**
     * After start hook
     */
    afterStart(callable: CallableFunction) {
        this.setHook("afterStart", callable);
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
    private setParam(name: string, value: string | number | boolean) {
        this.params.set(name.toUpperCase(), value);
    }
    /**
     * Set object of params
     */
    private setParams(params: NodeJS.ProcessEnv | Record<string, string | number | boolean>) {
        Object.entries(params).forEach(([name, value]) => {
            this.setParam(name, value as string);
        });
    }
    /**
     * Set port from args
     */
    private setArgPort() {
        const args = process.argv.slice(2);
        if (parseInt(args[0], 10)) {
            this.setParam("PORT", args[0]);
        }
    }
    /**
     * Load envs to params
     */
    private loadEnv() {
        this.setParams(process.env);
        this.setArgPort();
    }

    /**
     * Start application
     */
    async start(params?: Record<string, string | number | boolean>) {
        this.loadEnv();
        if (params) this.setParams(params);
        this.params.set("PORT", this.params.get("PORT") || 8000);

        if (this.hooks.beforeStart) {
            await this.hooks.beforeStart();
        }

        app.listen(this.params.get("PORT"), () => {
            console.log(
                "\x1b[32m%s\x1b[0m",
                `[server] 🔌 Project "${process.env.npm_package_name}"[${process.env.npm_package_version}] is starting`
            );
            this.startTime = performance.now();
            this.startProcedure();
        });
    }
    /**
     * Procedure after start
     */
    private async startProcedure() {
        await this.importMiddlewares();
        this.initMiddlewares();
        await this.initRoutes();
        this.initErrorHandler();

        console.log("\x1b[32m%s\x1b[0m", `[server] 🚀 http://localhost:${this.params.get("PORT")}`);
        if (this.hooks.afterStart) {
            await this.hooks.afterStart();
        }
        const took = (performance.now() - this.startTime).toFixed(0);
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
        const message = {
            http,
            message: err.message,
        };
        console.log(err);
        console.error(message);
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
    private buildPath(dir: string, filePath: string, endpoint: string) {
        const regexp = new RegExp(`(?<=${dir})(.*?)(?=\\.)`);
        const pathArray = filePath.match(regexp);
        if (!pathArray) throw new Error("Cant build URI");
        let path = pathArray[0];

        if (endpoint) path = path.replace(/\/[^/]*$/, endpoint);
        return path;
    }
    private initRoute(route: Route, path: string, method = "get") {
        let property: string;
        let endpoint = path;
        let handler: RequestHandler;
        let methods = [method] as Lowercase<Methods>[];
        let middleware: RequestHandler | undefined = undefined;

        if (typeof route === "function") {
            property = route.name;
            handler = route;
        } else {
            property = route.property;
            endpoint += route.path;
            handler = route.fn;
            if (route.methods) {
                methods = route.methods;
            }
            if (route.middleware) {
                if (typeof route.middleware === "string") {
                    const Middleware = new (this.middlewares.get(route.middleware))();
                    middleware = Middleware.handler;
                } else {
                    middleware = route.middleware;
                }
            }
        }

        const handlerStack = [middleware, this.requestHandler(handler)].filter(
            (h) => h !== undefined
        ) as RequestHandler[];

        methods.forEach((method) => {
            console.log(`[${method.toUpperCase()}] ${property} - ${endpoint}`);
            router[method](endpoint, ...handlerStack);
        });
    }
    /**
     * Init of Routes
     */
    private async initRoutes() {
        const usedNames: string[] = [];
        const filePaths = scanDir(this.root, this.dirs.routes);

        for (const filePath of filePaths) {
            const { default: Route } = await require(filePath);
            const route = new Route();
            const className = Route.name;
            if (usedNames.includes(className)) {
                throw new Error(`${className} already in use`);
            }
            usedNames.push(className);

            const props = Object.getOwnPropertyNames(Route.prototype).filter(
                (item) => !["constructor", "path", "crud"].includes(item)
            );
            const cruds = {
                index: "get",
                show: "get",
                store: "post",
                update: "patch",
                destroy: "delete",
            };
            const path = this.buildPath(this.dirs.routes, filePath, route.path);

            console.log(className);
            if (route.crud) {
                entries(cruds)
                    .filter(([crud]) => props.includes(crud))
                    .forEach(([crud, method]) => {
                        this.initRoute(route[crud], path, method);
                    });
            } else {
                props.forEach((item) => {
                    this.initRoute(route[item], path);
                });
            }
            console.log("---");
        }
        app.use(router);
    }
    /**
     * Import of Middlewares
     */
    private async importMiddlewares() {
        const usedNames: string[] = [];
        const filePaths = scanDir(this.root, this.dirs.middlewares);
        for (const filePath of filePaths) {
            const { default: Middleware } = await require(filePath);
            const className = Middleware.name;
            if (usedNames.includes(className)) {
                throw new Error(`${className} already in use`);
            }
            usedNames.push(className);
            this.middlewares.set(className, Middleware);
        }
    }
    /**
     * Init all Middleware in queue
     */
    initMiddlewares() {
        this.middlewareQueue.forEach((name) => {
            const Middleware = this.middlewares.get(name);
            if (Middleware) {
                const middleware = new Middleware();
                app.use(middleware.handler);
                console.log(`[server] Global Middleware "${name}" hooked`);
            }
        });
    }
    /**
     * Add Middleware to queue
     */
    useMiddleware(name: string) {
        this.middlewareQueue.push(name);
    }
}

export default Core;
