"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Core = exports.router = exports.app = exports.express = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Parts of Core
 */
const entries_1 = __importDefault(require("./utils/entries"));
const scanDir_1 = __importDefault(require("./utils/scanDir"));
exports.express = express_1.default;
exports.app = (0, exports.express)();
exports.router = exports.express.Router();
class Core {
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
    startTime = 0;
    root;
    constructor(root) {
        this.root = root + "/";
        exports.app.use(exports.express.static("public"));
        exports.app.use((req, res, next) => {
            res.removeHeader("Server");
            res.removeHeader("Via");
            res.removeHeader("X-Powered-By");
            next();
        });
        exports.router.get("/", this.requestHandler((req, res) => {
            return res.send({
                name: process.env.npm_package_name || "Service",
                version: process.env.npm_package_version || "1.0.0",
            });
        }));
    }
    /**
     * Set dir
     */
    setDir(name, path) {
        this.dirs[name] = path.endsWith("/") ? path.replace("/", "") : path;
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
     * Set object of params
     */
    setParams(params) {
        Object.entries(params).forEach(([name, value]) => {
            this.setParam(name, value);
        });
    }
    /**
     * Set port from args
     */
    setArgPort() {
        const args = process.argv.slice(2);
        if (parseInt(args[0], 10)) {
            this.setParam("PORT", args[0]);
        }
    }
    /**
     * Load envs to params
     */
    loadEnv() {
        this.setParams(process.env);
        this.setArgPort();
    }
    /**
     * Start application
     */
    async start(params) {
        this.loadEnv();
        if (params)
            this.setParams(params);
        this.params.set("PORT", this.params.get("PORT") || 8000);
        if (this.hooks.beforeStart) {
            await this.hooks.beforeStart();
        }
        exports.app.listen(this.params.get("PORT"), () => {
            console.log("\x1b[32m%s\x1b[0m", `[server] 🔌 Project "${process.env.npm_package_name}"[${process.env.npm_package_version}] is starting`);
            this.startTime = performance.now();
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
        const took = (performance.now() - this.startTime).toFixed(0);
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
        console.log(err);
        console.error(message);
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
        return path;
    }
    initRoute(route, path, method = "get") {
        let property;
        let endpoint = path;
        let handler;
        let methods = [method];
        let middleware = undefined;
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
                    middleware = Middleware.handler;
                }
                else {
                    middleware = route.middleware;
                }
            }
        }
        const handlerStack = [middleware, this.requestHandler(handler)].filter((h) => h !== undefined);
        methods.forEach((method) => {
            console.log(`[${method.toUpperCase()}] ${property} - ${endpoint}`);
            exports.router[method](endpoint, ...handlerStack);
        });
    }
    /**
     * Init of Routes
     */
    async initRoutes() {
        const usedNames = [];
        const filePaths = (0, scanDir_1.default)(this.root, this.dirs.routes);
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
            console.log(className);
            if (route.crud) {
                (0, entries_1.default)(cruds)
                    .filter(([crud]) => props.includes(crud))
                    .forEach(([crud, method]) => {
                    this.initRoute(route[crud], path, method);
                });
            }
            else {
                props.forEach((item) => {
                    this.initRoute(route[item], path);
                });
            }
            console.log("---");
        }
        exports.app.use(exports.router);
    }
    /**
     * Import of Middlewares
     */
    async importMiddlewares() {
        const usedNames = [];
        const filePaths = (0, scanDir_1.default)(this.root, this.dirs.middlewares);
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
                exports.app.use(middleware.handler);
                console.log(`[server] Global Middleware "${name}" hooked`);
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
exports.Core = Core;
exports.default = Core;
