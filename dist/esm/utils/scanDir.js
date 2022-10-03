import { readdir, access, constants } from "fs/promises";
const allowedExts = ["js", "ts", "mjs", "cjs"];
export const scanDir = async (root, dir) => {
    const relativePaths = [];
    try {
        await access(root + dir, constants.W_OK | constants.R_OK);
    }
    catch {
        throw new Error("1");
    }
    const dirs = await readdir(root + dir, {
        withFileTypes: true,
    });
    if (!dirs.length) {
        throw new Error("2");
    }
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
