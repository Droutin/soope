import { scanDir } from "../../src/utils/scanDir";

describe("Scan dir for files", () => {
    let result: string[];
    beforeAll(async () => {
        result = await scanDir(__dirname, "/routes");
    });

    it("should return path for index route", () => {
        expect(result[1]).toBe(__dirname + "/routes/index.ts");
    });
    it("should return path for api/v1/login route", () => {
        expect(result[0]).toBe(__dirname + "/routes/api/v1/login.ts");
    });
});
