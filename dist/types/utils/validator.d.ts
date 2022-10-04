declare type DataType = "string" | "number" | "number+" | "number-" | "boolean" | "array" | "string[]" | "number[]" | "number+[]" | "number-[]" | "boolean[]" | "array" | "object" | "string?" | "number?" | "number+?" | "number-?" | "boolean?" | "array?" | "string[]?" | "number[]?" | "number+[]?" | "number-[]?" | "boolean[]?" | "object?";
interface Rule {
    dataType: DataType;
    rules?: Rules;
}
declare type Rules = Record<string, Rule | DataType>;
export declare const validator: (data: Record<string, unknown>, rules: Rules) => Record<string, unknown>;
export default validator;
