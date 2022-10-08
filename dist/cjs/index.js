"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Soope = exports.router = exports.app = exports.express = void 0;
/* eslint-disable @typescript-eslint/no-namespace */
const dotenv_1 = __importDefault(require("dotenv"));
const error_stack_parser_1 = __importDefault(require("error-stack-parser"));
const express_1 = __importDefault(require("express"));
const on_finished_1 = __importDefault(require("on-finished"));
const on_headers_1 = __importDefault(require("on-headers"));
const utils_1 = require("./utils");
dotenv_1.default.config();
/* export type { Request, Response } from "./types"; */
exports.express = express_1.default;
exports.app = (0, exports.express)();
exports.router = exports.express.Router();
const logger = new utils_1.Logger({
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
    (0, on_headers_1.default)(res, recordStartTime);
    (0, on_finished_1.default)(res, (_err, res) => {
        if (!req._startAt || !res._startAt) {
            return 0;
        }
        const contentLength = res.getHeader("Content-Length") ?? "N/A";
        const responseTime = getPerfMS(req._startAt, res._startAt).toFixed(3);
        logger.trace(`${req.method} ${req.url} ${res.statusCode} ${responseTime} ms - ${contentLength}`);
    });
    return next();
};
const parsePagination = (req) => {
    const data = {
        page: req.get("X-Page"),
        perPage: req.get("X-PerPage"),
        orderBy: req.get("X-OrderBy"),
    };
    if (Object.values(data).filter(Boolean).length === 3) {
        const pagination = {
            page: parseInt(data.page),
            perPage: parseInt(data.perPage),
            orderBy: data.orderBy?.split(",").map((item) => {
                const rule = item.split(":");
                return {
                    [rule[0]]: rule[1],
                };
            }) || {},
        };
        req.pagination = pagination;
    }
};
function sendPagination({ count, maxPage, currentPage }) {
    this.setHeader("X-Count", count);
    this.setHeader("X-MaxPage", maxPage);
    this.setHeader("X-CurrentPage", currentPage);
}
class Soope {
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
        exports.app.use(exports.express.static("public"));
        exports.app.use((req, res, next) => {
            res.removeHeader("Server");
            res.removeHeader("Via");
            res.removeHeader("X-Powered-By");
            res.sendPagination = sendPagination.bind(res);
            parsePagination(req);
            return next();
        });
        if (process.env.LOG_LEVELS?.match(/(trace|all)/)) {
            exports.app.use(logAccess);
        }
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
        (0, utils_1.entries)(dirs).forEach(([name, path]) => {
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
        exports.app.listen(this.params.get("PORT"), async () => {
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
        const stack = error_stack_parser_1.default.parse(err);
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
        exports.app.use(this.errorHandler);
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
        return path.endsWith("/index") ? path.replace("/index", "/") : path;
    }
    isDecoratedHandler(handler) {
        return typeof handler !== "function";
    }
    initRoute(className, route, handler, path, method = "get", crudPath) {
        let endpoint = path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
        let property;
        let reqHandler;
        let methods = [method];
        const middlewares = [];
        if (this.isDecoratedHandler(handler)) {
            endpoint += handler.path;
            property = handler.property;
            reqHandler = handler.fn;
            if (handler.methods) {
                methods = handler.methods;
            }
            const usedMiddlewares = [];
            handler.middlewares.forEach((middleware) => {
                let middlewareName;
                let hooked = false;
                if ((0, utils_1.isString)(middleware)) {
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
            exports.router[method](endpoint, ...handlerStack);
        });
    }
    usedPaths = [];
    defaultHomepage() {
        exports.router.get("/", this.requestHandler((req, res) => {
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
        const filePaths = await (0, utils_1.scanDir)(this.root, dir);
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
    async initRoutes() {
        await this.autoImport(this.dirs.routes, (Route, className, filePath, dir) => {
            const route = new Route();
            const handlers = Object.getOwnPropertyNames(Route.prototype).filter((item) => !["constructor", "path", "crud"].includes(item));
            const path = this.buildPath(dir, filePath, route?.path);
            if (route?.crud) {
                (0, utils_1.entries)(this.cruds)
                    .filter(([crudHandler]) => handlers.includes(crudHandler))
                    .forEach(([crudHandler, obj]) => {
                    this.initRoute(className, route, route[crudHandler], path, obj.method, obj.path);
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
        exports.app.use(exports.router);
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
                exports.app.use((_req, _res, next) => {
                    logger.debug(`global middleware '${name}' triggered`);
                    return next();
                });
            }
            exports.app.use(middleware.handler);
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
exports.Soope = Soope;
exports.default = Soope;
