import { Soope } from "../src/index";

describe("SetParam functionality", () => {
    let soope: Soope;
    beforeEach(() => {
        soope = new Soope(__dirname);
    });
    it("should set port param", () => {
        soope.setParam("port", 9000);
        expect(soope.getParam("port")).toBe(9000);
        expect(soope.getParam("PORT")).toBe(9000);
    });
    it("should set PORT param", () => {
        soope.setParam("PORT", 7000);
        expect(soope.getParam("port")).toBe(7000);
        expect(soope.getParam("PORT")).toBe(7000);
    });
});
