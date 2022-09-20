"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanDir = void 0;
const fs_1 = require("fs");
const allowedExts = ["js", "ts", "mjs", "cjs"];
const scanDir = (root, dir) => {
    const relativePaths = [];
    const dirs = (0, fs_1.readdirSync)(root + dir, {
        withFileTypes: true,
    });
    dirs.forEach((file) => {
        const name = file.name;
        const ext = name.split(".").pop() || "";
        const segments = [dir, name].join("/");
        if (file.isDirectory()) {
            relativePaths.push(...(0, exports.scanDir)(root, segments));
        }
        else if (allowedExts.includes(ext)) {
            relativePaths.push(root + segments);
        }
    });
    return relativePaths;
};
exports.scanDir = scanDir;
exports.default = exports.scanDir;
