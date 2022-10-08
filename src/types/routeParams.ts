import type { Method, MiddlewareHandler } from ".";
export interface RouteParams {
    method?: Method | Method[];
    middleware?: MiddlewareHandler | MiddlewareHandler[];
}
export default RouteParams;
