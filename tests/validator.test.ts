import { validator } from "../src/utils";

describe("Validator functionality", () => {
    beforeEach(() => {
        process.env.DEBUG = Math.random() >= 0.5 ? "true" : "false";
    });
    it("should pass validation", () => {
        const testCase = {
            name: "Lorem",
            price: 0,
            metadata: {
                type: "bike",
                reviews: [0, 1, 2, 5],
            },
            tags: ["city"],
        };
        const data = validator(testCase, {
            name: "string",
            price: "number+",
            metadata: {
                dataType: "object",
                rules: {
                    type: "string",
                    reviews: "number+[]",
                },
            },
            tags: "string[]",
        });
        expect(data).toBe(testCase);
    });
    it("should throw error due to missing required param", () => {
        const testCase = {};
        try {
            validator(testCase, {
                user: "string",
            });
        } catch (error) {
            if (error instanceof Error) {
                if (process.env.DEBUG === "true") {
                    expect(error.message).toBe(`Param "user" is required`);
                } else {
                    expect(error.message).toBe("Validation Error");
                }
            }
        }
    });
    it("should throw error due to wrong DataType", () => {
        const testCase = {
            user: 1,
        };
        try {
            validator(testCase, {
                user: "string",
            });
        } catch (error) {
            if (error instanceof Error) {
                if (process.env.DEBUG === "true") {
                    expect(error.message).toBe(`Param "user" has wrong DataType. Expected "string"`);
                } else {
                    expect(error.message).toBe("Validation Error");
                }
            }
        }
    });
});
