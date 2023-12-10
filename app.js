"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBody = exports.getQueryParams = exports.handleRequest = exports.NextApiError = void 0;
const server_1 = require("next/server");
const zod_1 = require("zod");
class NextApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
exports.NextApiError = NextApiError;
function handleRequest({ handler, use, body, query, params, }) {
    const res = server_1.NextResponse;
    return (req, { params: rawParams }) => __awaiter(this, void 0, void 0, function* () {
        try {
            const data = {
                body: yield getBody(req),
                query: getQueryParams(req.nextUrl.search),
                params: rawParams,
            };
            const mainSchema = {};
            if (body) {
                mainSchema.body = body;
            }
            if (query) {
                mainSchema.query = query;
            }
            if (params) {
                mainSchema.params = params;
            }
            const schema = zod_1.z.object(mainSchema);
            const validaData = schema.parse(data);
            if (use) {
                if (Array.isArray(use)) {
                    for (const middleware of use) {
                        yield middleware(req);
                    }
                }
                else {
                    yield use(req);
                }
            }
            const result = yield handler(validaData);
            return res.json({ data: result }, { status: 200 });
        }
        catch (error) {
            if (error instanceof NextApiError) {
                return res.json({ error: error.message }, { status: error.status });
            }
            if (error instanceof zod_1.ZodError) {
                return res.json({ error: error.errors }, { status: 400 });
            }
            if (error instanceof Error) {
                return res.json({ error: error.message }, { status: 500 });
            }
            if (typeof error === "string") {
                return res.json({ error }, { status: 500 });
            }
            return res.json({ error: "Internal Server Error" }, { status: 500 });
        }
    });
}
exports.handleRequest = handleRequest;
function getQueryParams(query) {
    const params = new URLSearchParams(query);
    const obj = {};
    for (const key of params.keys()) {
        if (params.getAll(key).length > 1) {
            obj[key] = params.getAll(key);
        }
        else {
            obj[key] = params.get(key);
        }
    }
    if (Object.keys(obj).length === 0) {
        return undefined;
    }
    return obj;
}
exports.getQueryParams = getQueryParams;
function getBody(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = yield req.json();
        return body;
    });
}
exports.getBody = getBody;
console.log("Hello World");
