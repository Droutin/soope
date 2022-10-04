import { validator } from "../src/utils";

describe("Validator functionality", () => {
    it("complex approach", () => {
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
                type: "object",
                rules: {
                    type: "string",
                    reviews: "number+[]",
                },
            },
            tags: "string[]",
        });
        expect(data).toBe(testCase);
    });
    /* it("simple approach", () => {
        const testCase = {
            name: "Lorem",
            price: 0,
            metadata: {
                type: "bike",
            },
            tags: ["city"],
        };
        const data = validator(testCase, {
            name: "string",
            price: "number",
            metadata: "object",
            tags: "array",
        });

        expect(data).toBe(testCase);
    }); */
    /* it("should throw error due to wrong payload", () => {
        const testCase = {
            name: "Lorem",
        };
        try {
            validator(testCase, {
                user: "string",
            });
        } catch (error) {
            if (error instanceof Error) {
                expect(error.message).toBe("unknown param");
            }
        }
    }); */
    /* it("should return param with null", () => {
        const testCase = {
            name: null,
        };
        const data = validator(testCase, {
            name: "string?",
        });
        expect(data).toBe(testCase);
    }); */
    /*  it("should throw error due to required param", () => {
        const testCase = {
            name: null,
        };
        try {
            validator(testCase, {
                name: { type: "string", required: true },
            });
        } catch (error) {
            if (error instanceof Error) {
                expect(error.message).toBe("name is required");
            }
        }
    }); */
});
