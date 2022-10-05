declare type DataType = "string" | "email" | "date" | "number" | "number+" | "number-" | "boolean" | "array" | "string[]" | "email[]" | "date[]" | "number[]" | "number+[]" | "number-[]" | "boolean[]" | "array" | "object" | "object[]" | "string?" | "email?" | "date?" | "number?" | "number+?" | "number-?" | "boolean?" | "array?" | "string[]?" | "email[]?" | "date[]?" | "number[]?" | "number+[]?" | "number-[]?" | "boolean[]?" | "object?" | "object[]?";
interface Rule {
    dataType: DataType;
    rules?: Rules;
}
declare type Rules = Record<string, Rule | DataType>;
export declare const validator: (data: Record<string, unknown>, rules: Rules) => Record<string, unknown>;
export default validator;
