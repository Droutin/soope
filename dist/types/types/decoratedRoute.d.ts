export interface DecoratedRoute extends Function {
    path?: string;
    crud?: boolean;
    [index: string]: unknown;
}
export default DecoratedRoute;
