# Adding Validators

How to extend the validation system.

## Architecture

```
validation/
├── schemas/                    # JSON Schema definitions
│   ├── skill-frontmatter.schema.json
│   ├── command-frontmatter.schema.json
│   ├── agent-frontmatter.schema.json
│   └── power-frontmatter.schema.json
└── src/
    ├── index.ts                # Main entry point
    ├── frontmatter-validator.ts
    ├── bash-validator.ts
    ├── claude-validator.ts
    └── consistency-checker.ts
```

## Adding a New Frontmatter Schema

1. **Create schema file** in `validation/schemas/`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "my-component.schema.json",
  "title": "My Component Frontmatter",
  "type": "object",
  "required": ["description"],
  "properties": {
    "description": {
      "type": "string",
      "minLength": 10
    }
  },
  "additionalProperties": true
}
```

2. **Import and compile** in `frontmatter-validator.ts`:

```typescript
import mySchema from "../schemas/my-component.schema.json";

const validators = {
  // ... existing validators
  myComponent: ajv.compile(mySchema),
};
```

3. **Add glob pattern** to find files:

```typescript
const myFiles = await fg("**/my-component/*.md", {
  cwd: root,
  ignore: ["**/node_modules/**"],
});
for (const file of myFiles) {
  results.push(
    await validateFile(path.join(root, file), validators.myComponent, "my-component")
  );
}
```

## Adding a New Validator Module

1. **Create validator file** in `validation/src/`:

```typescript
// validation/src/my-validator.ts
export interface MyValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
}

export interface MyValidationResults {
  hasErrors: boolean;
  results: MyValidationResult[];
}

export async function validateMyThing(root: string): Promise<MyValidationResults> {
  const results: MyValidationResult[] = [];

  // Your validation logic here

  return {
    hasErrors: results.some((r) => !r.valid),
    results,
  };
}
```

2. **Add to main entry** in `index.ts`:

```typescript
import { validateMyThing } from "./my-validator";

// In main():
if (runAll || myThingOnly) {
  printHeader("My Thing Validation");
  const myResults = await validateMyThing(ROOT);
  // ... print results
}
```

3. **Add CLI flag** (optional):

```typescript
const myThingOnly = args.includes("--my-thing-only");
```

## Adding a Consistency Check

Edit `consistency-checker.ts`:

```typescript
// Add new check
const myCheckErrors: string[] = [];

// Your check logic...
if (someCondition) {
  myCheckErrors.push("Description of the issue");
}

results.push({
  check: "My consistency check",
  valid: myCheckErrors.length === 0,
  details: myCheckErrors.length === 0
    ? ["All checks passed"]
    : myCheckErrors,
});
```

## Testing Changes

```bash
# Run full validation
bun run validate

# Run specific validator
bun run validate:frontmatter

# Test with a broken file to verify error detection
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `ajv` | JSON Schema validation |
| `gray-matter` | YAML frontmatter parsing |
| `fast-glob` | File pattern matching |
| `execa` | Shell command execution |

## Related

- [Validation Overview](./README.md) — What's validated and how
- [Schemas](./schemas.md) — Existing JSON schema definitions
- [Troubleshooting](./troubleshooting.md) — Common errors and fixes
