import { Route } from "../src/decorators";
import { getClassMethods } from "../src/utils";

describe("getClassMethods functionality", () => {
    class TestClass {
        stringProp = "test";
        constructor() {
            console.log("Constructor");
        }
        handler() {
            console.log("Handler");
        }
        @Route("/decorated")
        decoratedHandler() {
            console.log("decoratedHandler");
        }
        async asyncHandler() {
            console.log("AsyncHandler");
        }
        #privateHelper() {
            console.log("PrivateHandler");
        }
    }
    const test = new TestClass();
    it("should return public methods", () => {
        expect(getClassMethods(test)).toStrictEqual(["handler", "decoratedHandler", "asyncHandler"]);
    });
});
