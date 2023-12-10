# Next Zod API Handler Documentation

![npm](https://img.shields.io/npm/v/next-zod-api)
![license](https://img.shields.io/npm/l/next-zod-api)

> :warning: This utility simplifies the handling of Next.js API routes by integrating Zod for request and response validation.

## Overview

The Next Zod API Handler is a utility designed for **Next.js** applications utilizing the App Router introduced in Next.js 13. It streamlines the creation of API endpoints, providing a unified method (`handleRequest`) for handling validation of request parameters, processing middleware, and managing responses.

If you are using the older Pages Router, it is recommended to use [next-better-api](https://github.com/filp/next-better-api) instead.

## Installation

```bash
npm install next-zod-api
```

or

```bash
yarn add next-zod-api
```

## Key Features

- **Unified Request Handling:** The `handleRequest` function simplifies the process of handling requests by encapsulating common tasks like validation, middleware execution, and response formatting.

- **Schema Validation:** Leverages the Zod library to define and validate schemas for request body, query parameters, and route parameters.

- **Middleware Support:** Allows the integration of middleware functions for pre-processing requests.

- **Error Handling:** Custom error responses for different types of errors, including `NextApiError` and `ZodError`.

- **Type Utilities:** Defines utility types such as `Infer<T>`, `UnwrapPromise<T>`, and `WithoutNextResponse<T>` for enhanced type safety.

## `handleRequest` Function

### Signature

```typescript
function handleRequest<T, BodySchema extends ZodTypeAny | undefined, QuerySchema extends ZodTypeAny | undefined, ParamSchema extends ZodTypeAny | undefined>({
  handler,
  use,
  body,
  query,
  params,
}: {
  use?: Middleware | Middleware[];
  body?: BodySchema;
  query?: QuerySchema;
  params?: ParamSchema;
  handler: (data: ApiOptions<BodySchema, QuerySchema, ParamSchema>) => Promise<T>;
}): (req: NextRequest, { params?: Record<string, unknown> }) => Promise<NextResponse>;
```

### Usage

```typescript
import { handleRequest, z } from 'next-zod-api';

// Example usage in a Next.js API route
export default handleRequest({
  use: [middleware1, middleware2],
  body: z.object({ name: z.string() }),
  query: z.object({ page: z.number().optional() }),
  params: z.object({ id: z.string() }),
  handler: async ({ body, query, params }) => {
    // Handle the request data and return a response
    // ...
    return { status: 200, data: /* ... */ };
  },
});
```

<!--
## Type Utilities

### `Infer<T>` Type

```typescript
type Infer<T> = T extends z.ZodType<infer U> ? U : never;
```

- Used to infer the type `U` from a Zod schema.

### `UnwrapPromise<T>` Type

```typescript
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
```

- Extracts the underlying type from a `Promise`.

### `WithoutNextResponse<T>` Type

```typescript
type WithoutNextResponse<T> = T extends NextResponse<infer U> ? U : T;
```

- Removes the `NextResponse` wrapper from a type. -->

## Additional Utilities

### `getQueryParams` Function

```typescript
function getQueryParams(query: string): Record<string, unknown> | undefined;
```

- Parses a query string and returns an object representing the query parameters.

### `getBody` Function

```typescript
async function getBody(req: NextRequest): Promise<unknown>;
```

- Asynchronously parses the JSON body of a `NextRequest`.

## Type Definitions

- `NextApiError`: Error class representing API errors with a specific HTTP status.

- `ApiOptions`: Type representing the expected structure of request options, including body, query, and params.

- `Middleware`: Type representing a middleware function.

- `ApiReturnType`: Type representing the return type of an API handler function.

## Conclusion

The Next Zod API Handler provides a powerful and flexible solution for handling API routes in Next.js applications. With schema validation, middleware support, and error handling, it simplifies the development process, making it easier to create robust and well-structured API endpoints.
