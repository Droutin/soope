import type Methods from "./methods";
export interface RouteParams {
    methods?: Methods[];
    middleware?: string | CallableFunction;
}
export default RouteParams;
