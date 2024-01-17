import { type NextRequest, NextResponse } from "next/server";
import { z, ZodError, type ZodTypeAny } from "zod";

export class NextApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Infer<T> = T extends z.ZodType<infer U> ? U : never;

type ApiSchema<Schema extends ZodTypeAny | undefined> =
  Schema extends ZodTypeAny ? Schema : undefined;

type ApiOptions<
  BodySchema extends ZodTypeAny | undefined,
  QuerySchema extends ZodTypeAny | undefined,
  ParamSchema extends ZodTypeAny | undefined
> = (BodySchema extends ZodTypeAny
  ? { body: Infer<ApiSchema<BodySchema>> }
  : {}) &
  (QuerySchema extends ZodTypeAny
    ? { query: Infer<ApiSchema<QuerySchema>> }
    : {}) &
  (ParamSchema extends ZodTypeAny
    ? { param: Infer<ApiSchema<ParamSchema>> }
    : {});

type Middleware = (req: NextRequest) => unknown;

export function handleRequest<
  T,
  BodySchema extends ZodTypeAny | undefined,
  QuerySchema extends ZodTypeAny | undefined,
  ParamSchema extends ZodTypeAny | undefined
>({
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
  handler: (
    data: ApiOptions<BodySchema, QuerySchema, ParamSchema>
  ) => Promise<T>;
}) {
  const res = NextResponse;

  return async (
    req: NextRequest,
    { params: rawParams }: { params?: Record<string, unknown> }
  ) => {
    try {
      const data = {
        body: await getBody(req),
        query: getQueryParams(req.nextUrl.search),
        params: rawParams,
      };

      const mainSchema: Record<string, ZodTypeAny> = {};

      if (body) {
        mainSchema.body = body;
      }
      if (query) {
        mainSchema.query = query;
      }
      if (params) {
        mainSchema.params = params;
      }

      const schema = z.object(mainSchema);
      const validaData = schema.parse(data);
      if (use) {
        if (Array.isArray(use)) {
          for (const middleware of use) {
            await middleware(req);
          }
        } else {
          await use(req);
        }
      }
      const result = await handler(validaData as any);
      return res.json({ data: result }, { status: 200 });
    } catch (error) {
      if (error instanceof NextApiError) {
        return res.json({ error: error.message }, { status: error.status });
      }
      if (error instanceof ZodError) {
        return res.json({ error: error.errors }, { status: 400 });
      }
      if (error instanceof Error) {
        return res.json({ error: error.message }, { status: 500 });
      }
      if (typeof error === "string") {
        return res.json({ error }, { status: 500 });
      }

      return res.json(
        { error: "Internal Server Error" },
        { status: 500 }
      ) as any;
    }
  };
}

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type WithoutNextResponse<T> = T extends NextResponse<infer U> ? U : T;

export type ApiReturnType<T extends (...args: any[]) => any> =
  WithoutNextResponse<UnwrapPromise<ReturnType<T>>>;

export function getQueryParams(query: string) {
  const params = new URLSearchParams(query);
  const obj: Record<string, unknown> = {};
  for (const key of params.keys()) {
    if (params.getAll(key).length > 1) {
      obj[key] = params.getAll(key);
    } else {
      obj[key] = params.get(key);
    }
  }
  if (Object.keys(obj).length === 0) {
    return undefined;
  }
  return obj;
}

export async function getBody(req: NextRequest) {
  const body = await req.json();
  return body;
}
