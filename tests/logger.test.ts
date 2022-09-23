import { Logger } from "../src/utils/logger";

describe("Logger", () => {
    let logger: Logger;
    beforeEach(async () => {
        logger = new Logger();
    });
    it("set log level", () => {
        logger.setLevel("trace");
        expect(logger.getLevel("trace")).toBe(true);
    });
    it("set log namespace", () => {
        logger.setNamespace("login");
        expect(logger.getNamespace()).toBe("login");
    });
    it("set log dir", () => {
        logger.setDir("logs/test");
        expect(logger.getDir()).toBe("logs/test/");
        logger.setDir("/logs/test/");
        expect(logger.getDir()).toBe("logs/test/");
    });
    it("log trace", () => {
        logger.setLevel("trace");
        expect(logger.trace("Lorem ipsum")).toContain("TRACE default - Lorem ipsum");
    });
    it("log debug", () => {
        logger.setLevel("debug");
        expect(logger.debug("Lorem ipsum")).toContain("DEBUG default - Lorem ipsum");
    });
    it("log info", () => {
        logger.setLevel("info");
        expect(logger.info("Lorem ipsum")).toContain("INFO default - Lorem ipsum");
    });
    it("log warn", () => {
        logger.setLevel("warn");
        expect(logger.warn("Lorem ipsum")).toContain("WARN default - Lorem ipsum");
    });
    it("log error", () => {
        logger.setLevel("error");
        expect(logger.error("Lorem ipsum")).toContain("ERROR default - Lorem ipsum");
    });
    it("log fatal", () => {
        logger.setLevel("fatal");
        expect(logger.fatal("Lorem ipsum")).toContain("FATAL default - Lorem ipsum");
    });
    it("log all", () => {
        logger.setLevel("all");
        expect(logger.trace("Lorem ipsum")).toContain("TRACE default - Lorem ipsum");
        expect(logger.debug("Lorem ipsum")).toContain("DEBUG default - Lorem ipsum");
        expect(logger.info("Lorem ipsum")).toContain("INFO default - Lorem ipsum");
        expect(logger.warn("Lorem ipsum")).toContain("WARN default - Lorem ipsum");
        expect(logger.error("Lorem ipsum")).toContain("ERROR default - Lorem ipsum");
        expect(logger.fatal("Lorem ipsum")).toContain("FATAL default - Lorem ipsum");
    });
    it("log info with array", () => {
        logger.setLevel("info");
        expect(logger.info(["Lorem", "ipsum"])).toContain(`INFO default - ["Lorem","ipsum"]`);
    });
    it("log info with object", () => {
        logger.setLevel("info");
        expect(logger.info({ lorem: "ipsum" })).toContain(`INFO default - {"lorem":"ipsum"}`);
    });
    it("log info with null", () => {
        logger.setLevel("info");
        expect(logger.info(null)).toContain(`INFO default - null`);
    });
});
