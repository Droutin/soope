import { Soope } from "../src/index";

describe("SetDir functionality", () => {
    let soope: Soope;
    beforeEach(() => {
        soope = new Soope(__dirname);
    });
    it("should change dir from routes to controllers", () => {
        soope.setDir("routes", "controllers");
        expect(soope.getDir("routes")).toBe("controllers");
    });
    it("should remove first slash", () => {
        soope.setDir("routes", "/routes");
        expect(soope.getDir("routes")).toBe("routes");
    });
    it("should remove last slash", () => {
        soope.setDir("routes", "routes/");
        expect(soope.getDir("routes")).toBe("routes");
    });
    it("should remove first and last slash", () => {
        soope.setDir("routes", "/routes/something/");
        expect(soope.getDir("routes")).toBe("routes/something");
    });
});
