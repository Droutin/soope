export declare type DataType = "string" | "email" | "date" | "number" | "number+" | "number-" | "boolean" | "array" | "string[]" | "email[]" | "date[]" | "number[]" | "number+[]" | "number-[]" | "boolean[]" | "array" | "object" | "object[]" | "string?" | "email?" | "date?" | "number?" | "number+?" | "number-?" | "boolean?" | "array?" | "string[]?" | "email[]?" | "date[]?" | "number[]?" | "number+[]?" | "number-[]?" | "boolean[]?" | "object?" | "object[]?";
export interface Rule {
    dataType: DataType;
    rules?: Rules;
}
export declare type Rules = Record<string, Rule | DataType>;
