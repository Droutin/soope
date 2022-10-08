"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanDir = void 0;
const promises_1 = require("fs/promises");
const allowedExts = ["js", "ts", "mjs", "cjs"];
const scanDir = async (root, dir) => {
    const relativePaths = [];
    try {
        await (0, promises_1.access)(root + dir, promises_1.constants.W_OK | promises_1.constants.R_OK);
    }
    catch {
        throw new Error(`cant access dir: ${root + dir}`);
    }
    const dirs = await (0, promises_1.readdir)(root + dir, {
        withFileTypes: true,
    });
    if (!dirs.length) {
        throw new Error(`there is no files in: ${root + dir}`);
    }
    for (const file of dirs) {
        const name = file.name;
        const ext = name.split(".").pop() || "";
        const segments = [dir, name].join("/");
        if (file.isDirectory()) {
            relativePaths.push(...(await (0, exports.scanDir)(root, segments)));
        }
        else if (allowedExts.includes(ext)) {
            relativePaths.push(root + segments);
        }
    }
    return relativePaths;
};
exports.scanDir = scanDir;
exports.default = exports.scanDir;
