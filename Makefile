# tmsx-node — spec regeneration, tests, sandbox integration harness.
# Driven by .github/workflows/consume-spec.yml; also usable locally.
# (Run `npm ci` first so devDependencies — openapi-typescript, tsup, tsc — exist.)

SPEC         ?= spec/tmsx-hotel-spec.yaml
SPEC_VERSION ?= $(shell cat .spec-version 2>/dev/null || echo 0.0.0)

.PHONY: regenerate test integration-test

# Regenerate types from the LOCAL downloaded spec (the npm `generate-types`
# script pulls from the remote main branch — that's for local dev convenience).
regenerate:
	npx openapi-typescript $(SPEC) -o src/_generated/schema.ts
	@echo "$(SPEC_VERSION)" > .spec-version

# Typecheck + build are the real verification; vitest passes if no tests exist yet.
test:
	npm run typecheck
	npm run build
	npx vitest run --passWithNoTests

# No Node sandbox harness yet — the canonical harness is tmsx-python's
# tmsx-test-runner. Node e2e tests can live under test/ and be wired in here.
integration-test:
	@echo "no Node sandbox integration harness yet (canonical harness lives in tmsx-python) — skipping no-op"
