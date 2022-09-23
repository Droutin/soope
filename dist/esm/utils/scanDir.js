import { readdir } from "fs/promises";
const allowedExts = ["js", "ts", "mjs", "cjs"];
export const scanDir = async (root, dir) => {
    const relativePaths = [];
    const dirs = await readdir(root + dir, {
        withFileTypes: true,
    });
    for (const file of dirs) {
        const name = file.name;
        const ext = name.split(".").pop() || "";
        const segments = [dir, name].join("/");
        if (file.isDirectory()) {
            relativePaths.push(...(await scanDir(root, segments)));
        }
        else if (allowedExts.includes(ext)) {
            relativePaths.push(root + segments);
        }
    }
    return relativePaths;
};
export default scanDir;