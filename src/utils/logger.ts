import c from "ansi-colors";
import { accessSync, constants } from "fs";
import { writeFile } from "fs/promises";

export { create as c } from "ansi-colors";

type Level = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
type Levels = Partial<Record<Level, boolean>>;

const colors: Record<Level, c.StyleFunction> = {
    trace: c.bold,
    debug: c.cyan.bold,
    info: c.green.bold,
    warn: c.yellowBright.bold,
    error: c.red.bold,
    fatal: c.magenta.bold.dim,
};

export class Logger {
    private namespace = "default";
    private levels: Map<Level, boolean> = new Map();
    private canWrite = true;
    private dir = "logs/";

    constructor({ namespace, dir, levels }: { namespace?: string; dir?: string; levels?: Levels } = {}) {
        if (namespace) {
            this.setNamespace(namespace);
        }

        if (levels) {
            this.setLevels(levels);
        } else if (process.env.LOG_LEVELS) {
            process.env.LOG_LEVELS.split(",").forEach((level) => {
                this.setLevel(level as Level, true);
            });
        }

        if (process.env.LOG_DIR) {
            this.setDir(process.env.LOG_DIR);
        }

        if (dir) {
            this.setDir(dir);
        }

        try {
            accessSync(this.dir, constants.R_OK | constants.W_OK);
            this.canWrite = true;
        } catch {
            this.canWrite = false;
            this.warn(`cant write log to folder ${this.dir}`);
        }
    }
    palete() {
        const colors = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "grey"];
        colors.forEach((color) => {
            const basic = c[color as keyof c.StyleFunction]("■");
            const bright = c[(color + "Bright") as keyof c.StyleFunction]
                ? c[(color + "Bright") as keyof c.StyleFunction]("■")
                : basic;

            const basicBold = c.bold(basic);
            const brightBold = c.bold(bright);
            const basicDim = c.dim(basic);
            const brightDim = c.dim(bright);

            process.stdout.write(
                `${color.padEnd(7, " ")} - ${basic}${basicBold}${basicDim}|${bright}${brightBold}${brightDim}\n`
            );
        });
    }
    private setDir(dir: string) {
        dir = dir.startsWith("/") ? dir.slice(1) : dir;
        dir = dir.endsWith("/") ? dir : dir + "/";
        this.dir = dir;
    }
    getDir() {
        return this.dir;
    }
    setLevel(level: Level | "all", enable = true) {
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
    getLevel(level: Level) {
        return this.levels.get(level);
    }
    setLevels(levels: Levels) {
        Object.entries(levels).forEach(([level, enable]) => {
            this.setLevel(level as Level, enable);
        });
    }
    getLevels() {
        return this.levels;
    }
    setNamespace(namespace?: string) {
        if (namespace) this.namespace = namespace;
    }
    getNamespace() {
        return this.namespace;
    }
    private colorMessage(template: string[]) {
        const ct = template.slice(0);
        ct[0] = c.grey(ct[0]);
        const level = ct[1];
        ct[1] = colors[level.toLowerCase() as Level](level);
        ct[3] = c.grey(ct[3]);
        return ct.join(" ") + "\n";
    }
    private getDate() {
        const now = new Date();
        const date = [
            now.getUTCFullYear(),
            String(now.getUTCMonth() + 1).padStart(2, "0"),
            String(now.getUTCDate()).padStart(2, "0"),
        ].join("-");
        return date;
    }
    private serialize(data: unknown[]) {
        const serialized: string[] = [];

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
    private log(level: Level, message: unknown[]) {
        const now = new Date();
        const datetime = now.toISOString().replace("T", " ");

        const serialized = this.serialize(message);
        const template = [datetime, level.toUpperCase(), this.namespace, "-", ...serialized];

        process.stdout.write(this.colorMessage(template));
        const file = this.dir + this.getDate() + ".log";

        if (this.canWrite) {
            writeFile(file, template.join(" ") + "\n", {
                flag: "a+",
            });
        }

        return template.join(" ");
    }
    trace(...message: unknown[]) {
        if (this.levels.get("trace")) return this.log("trace", message);
    }
    t(...message: unknown[]) {
        return this.trace(message);
    }
    debug(...message: unknown[]) {
        if (this.levels.get("debug")) return this.log("debug", message);
    }
    d(...message: unknown[]) {
        return this.debug(message);
    }
    info(...message: unknown[]) {
        if (this.levels.get("info")) return this.log("info", message);
    }
    i(...message: unknown[]) {
        return this.info(message);
    }
    warn(...message: unknown[]) {
        if (this.levels.get("warn")) return this.log("warn", message);
    }
    w(...message: unknown[]) {
        return this.warn(message);
    }
    error(...message: unknown[]) {
        if (this.levels.get("error")) return this.log("error", message);
    }
    e(...message: unknown[]) {
        return this.error(message);
    }
    fatal(...message: unknown[]) {
        if (this.levels.get("fatal")) return this.log("fatal", message);
    }
    f(...message: unknown[]) {
        return this.fatal(message);
    }
}
export default Logger;
