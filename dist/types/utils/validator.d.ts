import type { Rules } from "../types";
export declare const validator: <T extends Record<string, unknown>>(data: T, rules: Rules) => T;
export default validator;
