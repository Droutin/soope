import dotenv from "dotenv";
import ErrorStackParser from "error-stack-parser";
import Express from "express";
import onFinished from "on-finished";
import onHeaders from "on-headers";
import { entries, isString, Logger, scanDir } from "./utils";
dotenv.config();
export const express = Express;
export const app = express();
export const router = express.Router();
const logger = new Logger({
    namespace: "core",
});
function recordStartTime() {
    this._startAt = process.hrtime();
}
const getPerfMS = (start, end) => {
    return (end[0] - start[0]) * 1e3 + (end[1] - start[1]) * 1e-6;
};
const logAccess = (req, res, next) => {
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
export class Soope {
    params = new Map();
    hooks = {
        beforeStart: undefined,
        afterStart: undefined,
    };
    dirs = {
        routes: "routes",
        middlewares: "middlewares",
    };
    middlewares = new Map();
    middlewareQueue = [];
    /**
     * Performance timer
     */
    startTime = [0, 0];
    root;
    /**
     * Creates an instance of Soope.
     * ``` ts
     * const soope = new Soope(__dirname)
     * ```
     * @param {string} root
     * @memberof Soope
     */
    constructor(root) {
        this.root = root + "/";
        this.setParam("PORT", 8000);
        app.use(express.static("public"));
        app.use((req, res, next) => {
            res.removeHeader("Server");
            res.removeHeader("Via");
            res.removeHeader("X-Powered-By");
            return next();
        });
        app.use(logAccess);
    }
    /**
     *
     *
     * @param {keyof Dirs} name
     * @param {string} path
     * @memberof Soope
     */
    setDir(name, path) {
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
    setDirs(dirs) {
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
    getDir(name) {
        return this.dirs[name];
    }
    /**
     *
     *
     * @param {CallableFunction} callable
     * @memberof Soope
     */
    beforeStart(callable) {
        this.setHook("beforeStart", callable);
    }
    /**
     *
     *
     * @param {CallableFunction} callable
     * @memberof Soope
     */
    afterStart(callable) {
        this.setHook("afterStart", callable);
    }
    /**
     * Get hook
     */
    getHook(name) {
        return this.hooks[name];
    }
    /**
     * Set hook
     */
    setHook(name, callable) {
        this.hooks[name] = callable;
    }
    /**
     * Set param
     */
    setParam(name, value) {
        this.params.set(name.toUpperCase(), value);
    }
    /**
     * Get param
     */
    getParam(name) {
        return this.params.get(name.toUpperCase());
    }
    /**
     * Set object of params
     */
    setParams(params) {
        Object.entries(params).forEach(([name, value]) => {
            this.setParam(name, value);
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
    setArgPort() {
        const args = process.argv.slice(2);
        const port = args[0];
        if (port) {
            this.setParam("PORT", parseInt(port, 10));
        }
    }
    /**
     * Load envs to params
     */
    loadEnv() {
        this.setParams(process.env);
    }
    /**
     * Start application
     */
    async start(params) {
        if (params)
            this.setParams(params);
        this.loadEnv();
        this.setArgPort();
        app.listen(this.params.get("PORT"), async () => {
            this.startTime = process.hrtime();
            console.log("\x1b[32m%s\x1b[0m", `[server] 🔌 Project '${process.env.npm_package_name}'[${process.env.npm_package_version}] is starting`);
            if (this.hooks.beforeStart) {
                await this.hooks.beforeStart();
            }
            this.startProcedure();
        });
    }
    /**
     * Procedure after start
     */
    async startProcedure() {
        try {
            await this.importMiddlewares();
            this.initMiddlewares();
            await this.initRoutes();
            this.initErrorHandler();
        }
        catch (error) {
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
    requestHandler = (fn) => (req, res, next) => {
        return Promise.resolve(fn(req, res, next)).catch(next);
    };
    /**
     * Default ErrorHandler
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    errorHandler = (err, req, res, next) => {
        const http = 500;
        const stack = ErrorStackParser.parse(err);
        const message = {
            http,
            message: process.env.DEBUG === "true" ? err.message : "Internal Server Error",
        };
        if (process.env.DEBUG === "true")
            message.stack = stack;
        logger.error(message.message);
        logger.error(stack);
        logger.debug("data:", req.method === "GET" ? req.query : req.body);
        return res.status(http).send(message);
    };
    /**
     * Method for setting new/custom Error Handler
     */
    setErrorHandler(handler) {
        this.errorHandler = handler;
    }
    /**
     * Init of Error Handler
     */
    initErrorHandler() {
        app.use(this.errorHandler);
    }
    /**
     * Path builder for Router
     */
    buildPath(dir, filePath, endpoint) {
        const regexp = new RegExp(`(?<=${dir})(.*?)(?=\\.)`);
        const pathArray = filePath.match(regexp);
        if (!pathArray)
            throw new Error("Cant build URI");
        let path = pathArray[0];
        if (endpoint)
            path = path.replace(/\/[^/]*$/, endpoint);
        return path === "/index" ? "/" : path;
    }
    isDecoratedHandler(handler) {
        return typeof handler !== "function";
    }
    initRoute(className, route, handler, path, method = "get") {
        let endpoint = path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
        let property;
        let reqHandler;
        let methods;
        const middlewares = [];
        if (this.isDecoratedHandler(handler)) {
            endpoint += handler.path;
            property = handler.property;
            reqHandler = handler.fn;
            methods = handler.methods;
            const usedMiddlewares = [];
            handler.middlewares.forEach((middleware) => {
                let middlewareName;
                let hooked = false;
                if (isString(middleware)) {
                    if (usedMiddlewares.includes(middleware)) {
                        throw new Error(`Middleware ${middleware} was already hooked`);
                    }
                    const importedMiddleware = this.middlewares.get(middleware);
                    if (!importedMiddleware) {
                        throw new Error(`Middleware ${middleware} do not exist`);
                    }
                    const Middleware = new importedMiddleware();
                    if (!Middleware.handler) {
                        throw new Error(`Middleware ${middleware} needs public method 'handler'`);
                    }
                    middlewares.push(Middleware.handler.bind(Middleware));
                    middlewareName = middleware;
                    usedMiddlewares.push(middlewareName);
                    hooked = true;
                }
                else {
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
        }
        else {
            property = handler.name;
            reqHandler = handler;
            methods = [method];
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
    usedPaths = [];
    defaultHomepage() {
        router.get("/", this.requestHandler((req, res) => {
            return res.send({
                name: process.env.npm_package_name || "Service",
                version: process.env.npm_package_version || "1.0.0",
            });
        }));
        logger.trace(`default homepage hooked`);
    }
    classess = [];
    getRoutes() {
        return this.classess.filter((name) => name.endsWith("Route"));
    }
    getMiddlewares() {
        return this.classess.filter((name) => name.endsWith("Middleware"));
    }
    async autoImport(dir, fn) {
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
            }
            catch (error) {
                if (error instanceof Error &&
                    error.message === "Cannot read properties of undefined (reading 'name')") {
                    throw new Error(`missing default export in ${filePath}`);
                }
                throw error;
            }
        }
    }
    cruds = {
        index: "get",
        show: "get",
        store: "post",
        update: "patch",
        destroy: "delete",
    };
    async initRoutes() {
        await this.autoImport(this.dirs.routes, (Route, className, filePath, dir) => {
            const route = new Route();
            const handlers = Object.getOwnPropertyNames(Route.prototype).filter((item) => !["constructor", "path", "crud"].includes(item));
            const path = this.buildPath(dir, filePath, route?.path);
            if (route?.crud) {
                entries(this.cruds)
                    .filter(([crudHandler]) => handlers.includes(crudHandler))
                    .forEach(([crudHandler, method]) => {
                    this.initRoute(className, route, route[crudHandler], path, method);
                });
            }
            else {
                handlers.forEach((handler) => {
                    this.initRoute(className, route, route[handler], path);
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
    async importMiddlewares() {
        try {
            await this.autoImport(this.dirs.middlewares, (Middleware, className) => {
                this.middlewares.set(className, Middleware);
            });
        }
        catch (error) {
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
            const middleware = new Middleware();
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
    useMiddleware(name) {
        this.middlewareQueue.push(name);
    }
}
export default Soope;
