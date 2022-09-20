import { readdirSync } from "fs";

const allowedExts = ["js", "ts", "mjs", "cjs"];
export const scanDir = (root: string, dir: string) => {
    const relativePaths: string[] = [];
    const dirs = readdirSync(root + dir, {
        withFileTypes: true,
    });
    dirs.forEach((file) => {
        const name = file.name;
        const ext = name.split(".").pop() || "";
        const segments = [dir, name].join("/");
        if (file.isDirectory()) {
            relativePaths.push(...scanDir(root, segments));
        } else if (allowedExts.includes(ext)) {
            relativePaths.push(root + segments);
        }
    });
    return relativePaths;
};
export default scanDir;
