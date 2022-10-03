"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.c = void 0;
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
var ansi_colors_2 = require("ansi-colors");
Object.defineProperty(exports, "c", { enumerable: true, get: function () { return ansi_colors_2.create; } });
const colors = {
    trace: ansi_colors_1.default.bold,
    debug: ansi_colors_1.default.cyan.bold,
    info: ansi_colors_1.default.green.bold,
    warn: ansi_colors_1.default.yellowBright.bold,
    error: ansi_colors_1.default.red.bold,
    fatal: ansi_colors_1.default.magenta.bold.dim,
};
class Logger {
    namespace = "default";
    levels = new Map();
    canWrite = true;
    dir = "logs/";
    constructor({ namespace, dir, levels } = {}) {
        if (namespace) {
            this.setNamespace(namespace);
        }
        if (levels) {
            this.setLevels(levels);
        }
        else if (process.env.LOG_LEVELS) {
            process.env.LOG_LEVELS.split(",").forEach((level) => {
                this.setLevel(level, true);
            });
        }
        if (process.env.LOG_DIR) {
            this.setDir(process.env.LOG_DIR);
        }
        if (dir) {
            this.setDir(dir);
        }
        try {
            (0, fs_1.accessSync)(this.dir, fs_1.constants.R_OK | fs_1.constants.W_OK);
            this.canWrite = true;
        }
        catch {
            this.canWrite = false;
            this.warn(`cant write log to folder ${this.dir}`);
        }
    }
    palete() {
        const colors = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "grey"];
        colors.forEach((color) => {
            const basic = ansi_colors_1.default[color]("■");
            const bright = ansi_colors_1.default[(color + "Bright")]
                ? ansi_colors_1.default[(color + "Bright")]("■")
                : basic;
            const basicBold = ansi_colors_1.default.bold(basic);
            const brightBold = ansi_colors_1.default.bold(bright);
            const basicDim = ansi_colors_1.default.dim(basic);
            const brightDim = ansi_colors_1.default.dim(bright);
            process.stdout.write(`${color.padEnd(7, " ")} - ${basic}${basicBold}${basicDim}|${bright}${brightBold}${brightDim}\n`);
        });
    }
    setDir(dir) {
        dir = dir.startsWith("/") ? dir.slice(1) : dir;
        dir = dir.endsWith("/") ? dir : dir + "/";
        this.dir = dir;
    }
    getDir() {
        return this.dir;
    }
    setLevel(level, enable = true) {
        if (level === "all") {
            this.levels.set("trace", enable);
            this.levels.set("debug", enable);
            this.levels.set("info", enable);
            this.levels.set("warn", enable);
            this.levels.set("error", enable);
            this.levels.set("fatal", enable);
            return 0;
        }
        this.levels.set(level, enable);
    }
    getLevel(level) {
        return this.levels.get(level);
    }
    setLevels(levels) {
        Object.entries(levels).forEach(([level, enable]) => {
            this.setLevel(level, enable);
        });
    }
    getLevels() {
        return this.levels;
    }
    setNamespace(namespace) {
        if (namespace)
            this.namespace = namespace;
    }
    getNamespace() {
        return this.namespace;
    }
    colorMessage(template) {
        const ct = template.slice(0);
        ct[0] = ansi_colors_1.default.grey(ct[0]);
        const level = ct[1];
        ct[1] = colors[level.toLowerCase()](level);
        ct[3] = ansi_colors_1.default.grey(ct[3]);
        return ct.join(" ") + "\n";
    }
    getDate() {
        const now = new Date();
        const date = [
            now.getUTCFullYear(),
            String(now.getUTCMonth() + 1).padStart(2, "0"),
            String(now.getUTCDate()).padStart(2, "0"),
        ].join("-");
        return date;
    }
    serialize(data) {
        const serialized = [];
        data.forEach((item) => {
            if (typeof item === "string") {
                return serialized.push(item);
            }
            if (item === undefined) {
                return serialized.push("undefined");
            }
            if (item === null) {
                return serialized.push("null");
            }
            if (item instanceof Error) {
                return serialized.push(item.message);
            }
            if (typeof item === "object") {
                return serialized.push(JSON.stringify(item));
            }
            if (typeof item === "number") {
                return serialized.push(item.toString());
            }
        });
        return serialized;
    }
    log(level, message) {
        const now = new Date();
        const datetime = now.toISOString().replace("T", " ");
        const serialized = this.serialize(message);
        const template = [datetime, level.toUpperCase(), this.namespace, "-", ...serialized];
        process.stdout.write(this.colorMessage(template));
        const file = this.dir + this.getDate() + ".log";
        if (this.canWrite) {
            (0, promises_1.writeFile)(file, template.join(" ") + "\n", {
                flag: "a+",
            });
        }
        return template.join(" ");
    }
    trace(...message) {
        if (this.levels.get("trace"))
            return this.log("trace", message);
    }
    t(...message) {
        return this.trace(message);
    }
    debug(...message) {
        if (this.levels.get("debug"))
            return this.log("debug", message);
    }
    d(...message) {
        return this.debug(message);
    }
    info(...message) {
        if (this.levels.get("info"))
            return this.log("info", message);
    }
    i(...message) {
        return this.info(message);
    }
    warn(...message) {
        if (this.levels.get("warn"))
            return this.log("warn", message);
    }
    w(...message) {
        return this.warn(message);
    }
    error(...message) {
        if (this.levels.get("error"))
            return this.log("error", message);
    }
    e(...message) {
        return this.error(message);
    }
    fatal(...message) {
        if (this.levels.get("fatal"))
            return this.log("fatal", message);
    }
    f(...message) {
        return this.fatal(message);
    }
}
exports.Logger = Logger;
exports.default = Logger;
