"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Soope = exports.router = exports.app = exports.express = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const on_finished_1 = __importDefault(require("on-finished"));
const on_headers_1 = __importDefault(require("on-headers"));
dotenv_1.default.config();
/**
 * Parts of Soope
 */
const entries_1 = __importDefault(require("./utils/entries"));
const scanDir_1 = __importDefault(require("./utils/scanDir"));
const logger_1 = __importDefault(require("./utils/logger"));
exports.express = express_1.default;
exports.app = (0, exports.express)();
exports.router = exports.express.Router();
const logger = new logger_1.default("core");
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
        const contentLength = res.getHeader("Content-Length");
        const responseTime = getPerfMS(req._startAt, res._startAt).toFixed(3);
        logger.trace(`${req.method} ${req.url} ${res.statusCode} ${responseTime} ms - ${contentLength}`);
    });
    return next();
};
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
     * Use __dirname as root dir
     */
    constructor(root) {
        this.root = root + "/";
        this.setParam("PORT", 8000);
        exports.app.use(exports.express.static("public"));
        exports.app.use((req, res, next) => {
            res.removeHeader("Server");
            res.removeHeader("Via");
            res.removeHeader("X-Powered-By");
            return next();
        });
        exports.app.use(logAccess);
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
        (0, entries_1.default)(dirs).forEach(([name, path]) => {
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
        if (this.hooks.beforeStart) {
            await this.hooks.beforeStart();
        }
        exports.app.listen(this.params.get("PORT"), () => {
            console.log("\x1b[32m%s\x1b[0m", `[server] 🔌 Project "${process.env.npm_package_name}"[${process.env.npm_package_version}] is starting`);
            this.startTime = process.hrtime();
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
        const message = {
            http,
            message: err.message,
        };
        logger.error(message.message);
        logger.debug(req.method === "GET" ? req.query : req.body);
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
        return path === "/index" ? "/" : path;
    }
    initRoute(className, route, path, method = "get") {
        let property;
        let endpoint = path.endsWith("/") ? path.slice(0, -1) : path;
        let handler;
        let methods = [method];
        const middleware = [];
        let middlewareName;
        if (typeof route === "function") {
            property = route.name;
            handler = route;
        }
        else {
            property = route.property;
            endpoint += route.path;
            handler = route.fn;
            if (route.methods) {
                methods = route.methods;
            }
            if (route.middleware) {
                if (typeof route.middleware === "string") {
                    const Middleware = new (this.middlewares.get(route.middleware))();
                    middlewareName = Middleware.constructor.name;
                    middleware.push(Middleware.handler);
                }
                else {
                    middleware.push(route.middleware);
                    middlewareName = route.middleware.name;
                }
                middleware.unshift((_req, _res, next) => {
                    logger.debug(`scoped middleware "${middlewareName}" triggered`);
                    return next();
                });
            }
        }
        const handlerStack = [...middleware, this.requestHandler(handler)];
        methods.forEach((method) => {
            const path = `${method.toUpperCase()}-${endpoint}`;
            if (this.usedPaths.includes(path)) {
                throw new Error(`${path} is in use`);
            }
            this.usedPaths.push(path);
            logger.trace(`route ${endpoint || "/"} [${method.toUpperCase()}] from ${className}.${property} hooked`);
            if (middleware.length) {
                logger.trace(`scoped Middleware "${middlewareName}" hooked`);
            }
            exports.router[method](endpoint, ...handlerStack);
        });
    }
    usedPaths = [];
    /**
     * Init of Routes
     */
    async initRoutes() {
        const usedNames = [];
        const filePaths = await (0, scanDir_1.default)(this.root, this.dirs.routes);
        for (const filePath of filePaths) {
            const { default: Route } = await require(filePath);
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
            const path = this.buildPath(this.dirs.routes, filePath, route.path);
            if (route.crud) {
                (0, entries_1.default)(cruds)
                    .filter(([crud]) => props.includes(crud))
                    .forEach(([crud, method]) => {
                    this.initRoute(className, route[crud], path, method);
                });
            }
            else {
                props.forEach((item) => {
                    this.initRoute(className, route[item], path);
                });
            }
        }
        if (!this.usedPaths.includes("GET-/")) {
            exports.router.get("/", this.requestHandler((req, res) => {
                return res.send({
                    name: process.env.npm_package_name || "Service",
                    version: process.env.npm_package_version || "1.0.0",
                });
            }));
        }
        exports.app.use(exports.router);
    }
    /**
     * Import of Middlewares
     */
    async importMiddlewares() {
        const usedNames = [];
        const filePaths = await (0, scanDir_1.default)(this.root, this.dirs.middlewares);
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
                exports.app.use((_req, _res, next) => {
                    logger.debug(`global middleware "${name}" triggered`);
                    return next();
                });
                exports.app.use(middleware.handler);
                logger.trace(`global Middleware "${name}" hooked`);
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
exports.Soope = Soope;
exports.default = Soope;
