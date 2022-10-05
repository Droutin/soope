import Express from "express";
import dotenv from "dotenv";
import onFinished from "on-finished";
import onHeaders from "on-headers";
import ErrorStackParser from "error-stack-parser";
dotenv.config();
/**
 * Parts of Soope
 */
import entries from "./utils/entries";
import scanDir from "./utils/scanDir";
import Logger from "./utils/logger";
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
     * Use __dirname as root dir
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
     * Set dir
     */
    setDir(name, path) {
        path = path.endsWith("/") ? path.slice(0, -1) : path;
        path = path.startsWith("/") ? path.slice(1) : path;
        this.dirs[name] = path;
    }
    /**
     * Set dirs
     */
    setDirs(dirs) {
        entries(dirs).forEach(([name, path]) => {
            this.setDir(name, path);
        });
    }
    /**
     * Get dirs
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
     * Before start hook
     */
    beforeStart(callable) {
        this.setHook("beforeStart", callable);
    }
    /**
     * After start hook
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
        await this.importMiddlewares();
        this.initMiddlewares();
        await this.initRoutes();
        this.initErrorHandler();
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
            message: err.message,
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
    /**
     * TODO refactor && add type to route
     */
    initRoute(className, route, routeFn, path, method = "get") {
        let property;
        let endpoint = path.endsWith("/") ? path.slice(0, -1) : path;
        let handler;
        let methods = [method];
        const middleware = [];
        let middlewareName;
        if (typeof route[routeFn] === "function") {
            property = route[routeFn].name;
            handler = route[routeFn];
        }
        else {
            property = route[routeFn].property;
            endpoint += route[routeFn].path;
            handler = route[routeFn].fn;
            if (route[routeFn].methods) {
                methods = route[routeFn].methods;
            }
            if (route[routeFn].middleware) {
                let added = false;
                if (typeof route[routeFn].middleware === "string") {
                    const importedM = this.middlewares.get(route[routeFn].middleware);
                    if (importedM) {
                        const Middleware = new importedM();
                        middlewareName = Middleware.constructor.name;
                        middleware.push(Middleware.handler.bind(Middleware));
                        added = true;
                    }
                    else {
                        logger.warn("cant find middleware:", route[routeFn].middleware);
                    }
                }
                else {
                    middleware.push(route[routeFn].middleware);
                    middlewareName = route[routeFn].middleware.name;
                    added = true;
                }
                if (added) {
                    middleware.unshift((_req, _res, next) => {
                        logger.debug(`scoped middleware '${middlewareName}' triggered`);
                        return next();
                    });
                }
            }
        }
        const handlerStack = [...middleware, this.requestHandler(handler.bind(route))];
        methods.forEach((method) => {
            const path = `${method.toUpperCase()}-${endpoint}`;
            if (this.usedPaths.includes(path)) {
                throw new Error(`${path} is in use`);
            }
            this.usedPaths.push(path);
            logger.trace(`route ${endpoint || "/"} [${method.toUpperCase()}] from ${className}.${property} hooked`);
            if (middleware.length) {
                logger.trace(`scoped Middleware '${middlewareName}' hooked`);
            }
            router[method](endpoint, ...handlerStack);
        });
    }
    usedPaths = [];
    /**
     * Init of Routes
     */
    async initRoutes() {
        const usedNames = [];
        try {
            const filePaths = await scanDir(this.root, this.dirs.routes);
            for (const filePath of filePaths) {
                const { default: Route } = await require(filePath);
                try {
                    const route = new Route();
                    const className = Route.name;
                    if (usedNames.includes(className)) {
                        throw new Error(`${className} already in use`);
                    }
                    usedNames.push(className);
                    const props = Object.getOwnPropertyNames(Route.prototype).filter((item) => !["constructor", "path", "crud"].includes(item));
                    const cruds = {
                        index: "get",
                        show: "get",
                        store: "post",
                        update: "patch",
                        destroy: "delete",
                    };
                    const path = this.buildPath(this.dirs.routes, filePath, route?.path);
                    if (route?.crud) {
                        entries(cruds)
                            .filter(([crud]) => props.includes(crud))
                            .forEach(([crud, method]) => {
                            this.initRoute(className, route, crud, path, method);
                        });
                    }
                    else {
                        props.forEach((item) => {
                            this.initRoute(className, route, item, path);
                        });
                    }
                }
                catch (error) {
                    throw new Error(`no default export in route: ${filePath}`);
                }
            }
        }
        catch (error) {
            if (error instanceof Error) {
                switch (error.message) {
                    case "1":
                        return logger.error("cant access dir:", this.root + this.dirs.routes);
                    case "2":
                        return logger.warn("there is no routes in:", this.root + this.dirs.routes);
                }
            }
            logger.error(error);
        }
        if (!this.usedPaths.includes("GET-/")) {
            router.get("/", this.requestHandler((req, res) => {
                return res.send({
                    name: process.env.npm_package_name || "Service",
                    version: process.env.npm_package_version || "1.0.0",
                });
            }));
        }
        app.use(router);
    }
    /**
     * Import of Middlewares
     */
    async importMiddlewares() {
        const usedNames = [];
        try {
            const filePaths = await scanDir(this.root, this.dirs.middlewares);
            for (const filePath of filePaths) {
                try {
                    const { default: Middleware } = await require(filePath);
                    const className = Middleware.name;
                    if (usedNames.includes(className)) {
                        throw new Error(`${className} already in use`);
                    }
                    usedNames.push(className);
                    this.middlewares.set(className, Middleware);
                }
                catch (error) {
                    throw new Error(`no default export in middleware: ${filePath}`);
                }
            }
        }
        catch (error) {
            if (error instanceof Error) {
                switch (error.message) {
                    case "1":
                        return 0;
                    /* return logger.error("cant access dir:", this.root + this.dirs.routes); */
                    case "2":
                        return logger.warn("there is no middlewares in:", this.root + this.dirs.routes);
                }
            }
            logger.error(error);
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
                app.use((_req, _res, next) => {
                    logger.debug(`global middleware '${name}' triggered`);
                    return next();
                });
                app.use(middleware.handler);
                logger.trace(`global Middleware '${name}' hooked`);
            }
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
