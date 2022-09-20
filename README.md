# Simple OOP Express **[SOOPE]**

_Simple OOP Express_ or **SOOPE** will help you with building express app with OOP approach. Router is autoimported with directory path builder.

File in directory like this `src/routes/api/v1/login.route.ts` will be initialized in Router like this `https://domain.tld/api/v1/login`. However you can change last segment of this path simple by setting `@Path` decorator on top of class definition. Every public method of Class will be accesable by default with GET request. Use `@Route` decorator for specifing methods and/or params

## Methods

---

-   `setDir(name: string, path: string)`
-   `setDirs(dirs: { name: path }[])`
-   `beforeStart(fn() => ?void)`
-   `afterStart(fn() => ?void)`
-   `setErrorHandler(fn(err: Error, req: Request, res: Response, next: NextFunction) => Response)`
-   `useMiddleware(name: string)`
-   `start(?params)`
