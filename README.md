# @tourmind-com/tmsx · TypeScript SDK for the Tourmind TMSX hotel API

```bash
npm install @tourmind-com/tmsx        # once published — source repo: github.com/tourmind-com/tmsx-node
```

Source repo (post-extract from `tms-doc`): [`tourmind-com/tmsx-node`](https://github.com/tourmind-com/tmsx-node).
Spec + test cases live in [`tourmind-com/tmsx-platform`](https://github.com/tourmind-com/tmsx-platform) per ADR-002.

## Quick start

```ts
import { Client } from '@tourmind-com/tmsx/hotel';

const client = new Client({
  agentCode: 'tms_test',
  username: 'tms_test',
  password: 'tms_test',
  baseUrl: 'http://developers.tourmind.cn',
});

const regions = await client.listRegions({ CountryCode: 'CN' });
for (const region of regions.RegionListResult?.Regions ?? []) {
  console.log(region.RegionID, region.Name);
}
```

The SDK injects the TMSX auth scheme (`X-Agent-Code` / `X-Username` headers + the
`RequestHeader` body envelope with `Password`, `RequestTime`, `TransactionID`) on
every request — see `https://github.com/tourmind-com/tmsx-platform/blob/main/AUTH.md`. Callers never touch `RequestHeader`.

## Targets

- Node ≥ 18
- Modern browsers (ESM via bundler)
- Bun, Deno (via the `import { Client }` ESM entrypoint)

ESM + CJS dual-published. `.d.ts` types ship in the package.

## Errors

| ErrorCode | Exception |
|---|---|
| 105 | `TMSXAuthError` |
| 101 / 102 / 103 | `TMSXValidationError` |
| Other | `TMSXError` |
| Transport / parse | `TMSXClientError` |

```ts
import { TMSXAuthError, TMSXError } from '@tourmind-com/tmsx';

try {
  await client.listRegions();
} catch (err) {
  if (err instanceof TMSXAuthError) {
    // ...rotate credentials
  } else if (err instanceof TMSXError) {
    console.error('TMSX failed:', err.code, err.message, err.transactionId);
  }
}
```

## Layout

```
tmsx-node/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── src/
│   ├── index.ts            # top-level: exceptions + VERSION
│   ├── exceptions.ts       # TMSXError hierarchy
│   ├── hotel/
│   │   ├── index.ts        # Client + type exports
│   │   ├── client.ts       # Client class
│   │   └── auth.ts         # openapi-fetch middleware
│   └── _generated/         # AUTO-GENERATED — do not edit
│       └── schema.ts
├── examples/canonical-flow.ts
└── dist/                   # build output (gitignored)
```

## Regenerating from the spec

```bash
npm run generate-types     # https://raw.githubusercontent.com/tourmind-com/tmsx-platform/main/spec/tmsx-hotel-spec.yaml → src/_generated/schema.ts
npm run build              # ESM + CJS + .d.ts → dist/
```

## Build / typecheck / example

```bash
npm install
npm run typecheck
npm run build
npm run example            # runs examples/canonical-flow.ts against sandbox
```

## Status

🟡 Alpha. 