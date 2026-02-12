# Risk Assessment Criteria

Guidelines for assessing risk levels in code changes.

## File-Based Risk Indicators

### High Risk Files

Files that warrant extra scrutiny:

| Pattern | Risk Factor |
|---------|-------------|
| `**/auth/**`, `**/authentication/**` | Identity/access control |
| `**/security/**`, `**/crypto/**` | Security-critical code |
| `**/migrations/**`, `**/schema/**` | Database changes |
| `**/*.sql` | Direct database operations |
| `**/payment/**`, `**/billing/**` | Financial transactions |
| `**/api/**` routes/controllers | External interface |
| `**/.env*`, `**/secrets/**` | Configuration/secrets |
| `**/core/**`, `**/kernel/**` | Core business logic |
| `**/middleware/**` | Request processing |
| `**/*config*`, `**/*settings*` | Application configuration |

### Medium Risk Files

Files requiring normal review attention:

| Pattern | Risk Factor |
|---------|-------------|
| `**/services/**`, `**/lib/**` | Shared business logic |
| `**/utils/**`, `**/helpers/**` | Shared utilities |
| `**/models/**`, `**/entities/**` | Data structures |
| `**/hooks/**`, `**/context/**` | State management |
| `**/api/**` (non-route files) | API utilities |
| `package.json`, `requirements.txt` | Dependency changes |

### Low Risk Files

Files typically lower risk:

| Pattern | Risk Factor |
|---------|-------------|
| `**/*.test.*`, `**/*.spec.*` | Test files |
| `**/__tests__/**` | Test directories |
| `**/docs/**`, `**/*.md` | Documentation |
| `**/*.css`, `**/*.scss` | Styling |
| `**/locales/**`, `**/i18n/**` | Translations |
| `**/.github/**` | CI/CD config |
| `**/types/**`, `**/*.d.ts` | Type definitions |

## Change-Based Risk Assessment

### High Risk Changes

| Change Type | Why It's Risky |
|-------------|----------------|
| Authentication logic | Direct security impact |
| Authorization checks | Access control bypass potential |
| Input validation removal | Injection vulnerability |
| Error handling removal | Information disclosure |
| Cryptographic operations | Data protection |
| Database schema changes | Data integrity/migration |
| API contract changes | Breaking consumers |
| Dependency version changes | Supply chain risk |

### Medium Risk Changes

| Change Type | Concern |
|-------------|---------|
| New external API calls | Integration points |
| Caching logic | Data consistency |
| Rate limiting changes | Abuse potential |
| Logging modifications | Audit trail |
| Configuration changes | Environment impact |
| Shared utility changes | Ripple effects |

### Low Risk Changes

| Change Type | Note |
|-------------|------|
| Comment updates | No runtime impact |
| Formatting changes | Style only |
| Test additions | Improves coverage |
| Documentation | Knowledge capture |
| Type annotations | Development aid |

## Composite Risk Scoring

Combine file risk and change risk:

```
Final Risk = max(File Risk, Change Risk)

If multiple high-risk factors present:
  Final Risk = Critical (requires security review)
```

## Risk Mitigation Indicators

Factors that can lower risk assessment:

| Indicator | Risk Reduction |
|-----------|----------------|
| Comprehensive tests added | -1 level |
| Security-reviewed previously | -1 level |
| Feature-flagged | -1 level (can disable) |
| Small, focused change | Easier to review |
| Clear documentation | Intent is understood |

## Review Depth Guidelines

Based on final risk assessment:

| Risk Level | Review Approach |
|------------|-----------------|
| **Critical** | Security team review, threat modeling |
| **High** | Senior engineer review, security checklist |
| **Medium** | Standard review, test coverage check |
| **Low** | Quick review, spot check |
