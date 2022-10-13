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
            images: [
                {
                    type: "image/jpg",
                    image: "https://",
                },
                {
                    type: "image/jpg",
                    image: "https://",
                },
            ],
            createdAt: "2022-10-05 12:00:00",
            createdBy: "roman.vasek@enimo.sk",
            tables: {
                "0001": true,
            },
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
            images: {
                dataType: "object[]",
                rules: {
                    type: "string",
                    image: "string",
                },
            },
            createdAt: "date",
            createdBy: "email",
            tables: {
                dataType: "object",
                rules: {
                    $PROP: "boolean",
                },
            },
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
                    expect(error.message).toBe(`Param 'user' is required`);
                } else {
                    expect(error.message).toBe("Validation Error");
                }
            }
        }
    });
    it("should throw error - string", () => {
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
                    expect(error.message).toBe(`Param 'user' has wrong DataType. Expected 'string'`);
                } else {
                    expect(error.message).toBe("Validation Error");
                }
            }
        }
    });
    it("should throw error - date", () => {
        const testCase = {
            user: 1,
        };
        try {
            validator(testCase, {
                user: "date",
            });
        } catch (error) {
            if (error instanceof Error) {
                if (process.env.DEBUG === "true") {
                    expect(error.message).toBe(`Param 'user' has wrong DataType. Expected 'date'`);
                } else {
                    expect(error.message).toBe("Validation Error");
                }
            }
        }
    });
    it("should throw error - email", () => {
        const testCase = {
            user: 1,
        };
        try {
            validator(testCase, {
                user: "email",
            });
        } catch (error) {
            if (error instanceof Error) {
                if (process.env.DEBUG === "true") {
                    expect(error.message).toBe(`Param 'user' has wrong DataType. Expected 'email'`);
                } else {
                    expect(error.message).toBe("Validation Error");
                }
            }
        }
    });
    it("should throw error - number", () => {
        const testCase = {
            user: "1",
        };
        try {
            validator(testCase, {
                user: "number",
            });
        } catch (error) {
            if (error instanceof Error) {
                if (process.env.DEBUG === "true") {
                    expect(error.message).toBe(`Param 'user' has wrong DataType. Expected 'number'`);
                } else {
                    expect(error.message).toBe("Validation Error");
                }
            }
        }
    });
    it("should throw error - number+", () => {
        const testCase = {
            user: -1,
        };
        try {
            validator(testCase, {
                user: "number+",
            });
        } catch (error) {
            if (error instanceof Error) {
                if (process.env.DEBUG === "true") {
                    expect(error.message).toBe(`Param 'user' has wrong DataType. Expected 'number+'`);
                } else {
                    expect(error.message).toBe("Validation Error");
                }
            }
        }
    });
    it("should throw error - number-", () => {
        const testCase = {
            user: 1,
        };
        try {
            validator(testCase, {
                user: "number-",
            });
        } catch (error) {
            if (error instanceof Error) {
                if (process.env.DEBUG === "true") {
                    expect(error.message).toBe(`Param 'user' has wrong DataType. Expected 'number-'`);
                } else {
                    expect(error.message).toBe("Validation Error");
                }
            }
        }
    });
    it("should throw error - boolean", () => {
        const testCase = {
            user: 2,
        };
        try {
            validator(testCase, {
                user: "boolean",
            });
        } catch (error) {
            if (error instanceof Error) {
                if (process.env.DEBUG === "true") {
                    expect(error.message).toBe(`Param 'user' has wrong DataType. Expected 'boolean'`);
                } else {
                    expect(error.message).toBe("Validation Error");
                }
            }
        }
    });
    it("should throw error - array", () => {
        const testCase = {
            user: [],
        };
        try {
            validator(testCase, {
                user: "array",
            });
        } catch (error) {
            if (error instanceof Error) {
                if (process.env.DEBUG === "true") {
                    expect(error.message).toBe(`Param 'user' has wrong DataType. Expected 'array'`);
                } else {
                    expect(error.message).toBe("Validation Error");
                }
            }
        }
    });
    it("should throw error - object", () => {
        const testCase = {
            user: {},
        };
        try {
            validator(testCase, {
                user: "object",
            });
        } catch (error) {
            if (error instanceof Error) {
                if (process.env.DEBUG === "true") {
                    expect(error.message).toBe(`Param 'user' has wrong DataType. Expected 'object'`);
                } else {
                    expect(error.message).toBe("Validation Error");
                }
            }
        }
    });
});
