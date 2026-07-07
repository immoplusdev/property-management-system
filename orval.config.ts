import { defineConfig } from "orval";

/**
 * Orval — single source of truth for the API client.
 *
 * Input  : the live NestJS OpenAPI spec (Immoplus v1).
 * Output : a per-domain (tags-split) TypeScript SDK under lib/api/generated/
 *          - React Query hooks + fetch functions  (api/)
 *          - Zod runtime schemas                   (*.zod.ts)
 *          - shared models                         (model/)
 *
 * All HTTP goes through the same-origin BFF proxy via the `bffFetch` mutator,
 * so generated client hooks never see the access token (it stays httpOnly
 * server-side). Regenerate with `npm run gen:api` whenever the backend changes.
 *
 * TAGS is scoped to what the app currently consumes from the generated output
 * (only DTO/enum types from lib/api/generated/model — no generated hooks are
 * used, all HTTP goes through hand-written actions). Add a tag here once the
 * app actually starts importing types/hooks tied to it.
 */
const SPEC = "https://api-dev.immoplus.ci/swagger/json";
const TAGS = ["Auth", "User", "Commune", "Ville"];

export default defineConfig({
  immoplus: {
    input: { target: SPEC, filters: { tags: TAGS } },
    output: {
      mode: "tags-split",
      target: "lib/api/generated",
      schemas: "lib/api/generated/model",
      client: "react-query",
      httpClient: "fetch",
      clean: ["lib/api/generated/**/*.ts", "!lib/api/generated/index.ts"],
      indexFiles: true,
      override: {
        mutator: {
          path: "lib/api/mutator.ts",
          name: "bffFetch",
        },
        query: {
          useQuery: true,
          useInfinite: false,
          useMutation: true,
        },
      },
    },
  },

  // Runtime validation schemas (Zod). Generated alongside the SDK as `*.zod.ts`.
  // NOTE: a few backend operations model `date-time` fields as objects with a
  // string default (e.g. reservation cost estimate), which Orval emits as an
  // invalid `looseObject().default("<string>")`. Those files are excluded from
  // `tsc` (see tsconfig.json) until the backend spec is fixed; auth validation
  // uses hand-written schemas in lib/api/auth/auth.schemas.ts meanwhile.
  immoplusZod: {
    input: { target: SPEC, filters: { tags: TAGS } },
    output: {
      mode: "tags-split",
      target: "lib/api/generated",
      fileExtension: ".zod.ts",
      client: "zod",
    },
  },
});
