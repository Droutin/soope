import { access, constants, readdir } from "fs/promises";
const allowedExts = ["js", "ts", "mjs", "cjs"];
export const scanDir = async (root, dir) => {
    const relativePaths = [];
    try {
        await access(root + dir, constants.W_OK | constants.R_OK);
    }
    catch {
        throw new Error(`cant access dir: ${root + dir}`);
    }
    const dirs = await readdir(root + dir, {
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
            relativePaths.push(...(await scanDir(root, segments)));
        }
        else if (allowedExts.includes(ext)) {
            relativePaths.push(root + segments);
        }
    }
    return relativePaths;
};
export default scanDir;
