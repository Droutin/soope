import { Soope } from "../src/index";

describe("SetHook functionality", () => {
    let soope: Soope;
    beforeEach(() => {
        soope = new Soope(__dirname);
    });
    it("should set beforeStart hook function", () => {
        soope.beforeStart(() => {
            return "hook";
        });
        const hook = soope.getHook("beforeStart");
        expect(hook).toBeDefined();
        if (hook) {
            expect(hook()).toBe("hook");
        }
    });
});
