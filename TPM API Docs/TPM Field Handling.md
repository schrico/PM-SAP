# TPM API Field Handling

How every field from the SAP TPM API is processed in the codebase — what gets stored in Supabase, what goes into instructions, and what is discarded.

---

## Data Flow Overview

1. **Fetch** — SAP API is called via `/lib/sap/client.ts` (OAuth 2.0 password grant)
2. **Map** — Raw responses are transformed in `/lib/sap/mappers.ts`
3. **Sanitize** — All imported strings are XSS-sanitized (script tags + HTML removed)
4. **Store** — Mapped data is upserted into `projects` table via `/app/api/sap/sync/route.ts`

---

## Field-by-Field Breakdown

### ProjectDTO / ProjectModel

| SAP Field | Stored in Supabase? | DB Column | Processing |
|---|---|---|---|
| `projectId` | Yes | `sap_parent_id` | Converted to string |
| `projectName` | Yes | `sap_parent_name` | Direct, sanitized |
| `account` | Yes | `sap_account` | Direct, sanitized |
| `subProjects` | — | — | Each subproject processed individually (see below) |

### SubProjectModel

| SAP Field | Stored in Supabase? | DB Column | Processing |
|---|---|---|---|
| `subProjectId` | Yes | `sap_subproject_id` | Direct. Used as **upsert key** (unique identifier) |
| `subProjectName` | Yes | `name` | Direct, sanitized. Becomes the project display name |
| `dmName` | Yes (in instructions) | `sap_instructions` | Prepended as `"DM: {dmName}"` header in the instructions string |
| `pmName` | **No** | — | Displayed in import preview list only |
| `projectType` | **No** | — | Displayed in import preview list only |

### EnvironmentModel

| SAP Field | Stored in Supabase? | DB Column | Processing |
|---|---|---|---|
| `toolType` | Yes | `system` | Mapped via lookup table (see System Mapping below) |
| `toolTypeDescription` | **No** | — | Not used |
| `environmentName` | **No** | — | Displayed in import preview only |
| `contentId` | **No** | — | Internal metadata |
| `projectUrl` | **No** | — | Not used |
| `graphId` | **No** | — | Not used |
| `lxeProject` | **No** | — | Not used |
| `translationArea` | **No** | — | Not used |
| `worklist` | **No** | — | Not used |
| `is_xtm` | **No** | — | Not used |
| `content_name` | **No** | — | Not used |
| `external_project_id` | **No** | — | Not used |
| `external_system` | **No** | — | Not used |

**Note:** `toolType` lives on `SapEnvironment` (not `SapStep`) per the OpenAPI spec. The extraction logic (`extractSystem`) checks steps first for backwards compatibility, then falls back to environment.

### SubProjectStepsModel

| SAP Field | Stored in Supabase? | DB Column | Processing |
|---|---|---|---|
| `sourceLang` | Yes | `language_in` | First non-null value across all steps |
| `slsLang` | Yes | `language_out` | First non-null value across all steps |
| `startDate` | Yes | `initial_deadline` | **Minimum** start date across all steps |
| `endDate` | Yes | `final_deadline` | **Maximum** end date across all steps |
| `stepText` | **No** | — | Displayed in import preview only |
| `serviceStep` | **No** | — | Metadata, used as identifier in instructions fetch |
| `contentId` | **No** | — | Internal identifier |
| `tGroup` | **No** | — | Not used |
| `hasInstructions` | **No** | — | Metadata only |
| `instructionsLastChangedAt` | **No** | — | Metadata only |
| `subProjectFiles` | **No** | — | Not used |
| `volume` | — | — | See VolumeModel below |

### VolumeModel

| SAP Field | Stored in Supabase? | DB Column | Processing |
|---|---|---|---|
| `volumeQuantity` | **No** | — | Summed by `volumeUnit` across all steps. **Displayed in preview only, NOT imported** |
| `volumeUnit` | **No** | — | Used to group sums (case-insensitive: "Words", "Lines") |
| `ceBillQuantity` | **No** | — | Not used |
| `ceBillUnit` | **No** | — | Not used |
| `activityText` | **No** | — | Not used |
| `stepStatusId` | **No** | — | Not used |
| `stepStatusDescription` | **No** | — | Not used |

**Important:** Volumes (words/lines) are calculated and shown in the import preview UI but are deliberately **not stored** per client requirement. The `words` and `lines` columns in Supabase are local-only fields managed manually.

### InstructionModel

| SAP Field | Stored in Supabase? | DB Column | Processing |
|---|---|---|---|
| `instructionLong` | Yes | `sap_instructions` | **Preferred.** Combined into a single string with other instructions |
| `instructionShort` | Yes (fallback) | `sap_instructions` | Used only if `instructionLong` is empty/null |
| `subProjectId` | **No** | — | Identifier for fetching |
| `contentId` | **No** | — | Identifier for fetching |
| `serviceStep` | **No** | — | Identifier for fetching |
| `slsLang` | **No** | — | Used to filter relevant instructions |
| `lastChangedAt` | **No** | — | Metadata only |
| `isTemplate` | **No** | — | Metadata only |
| `deleted` | **No** | — | Metadata only |

### ErrorDto / DetailError

| SAP Field | Stored in Supabase? | Processing |
|---|---|---|
| `error.status` | **No** | Logged, returned to frontend |
| `error.message` | **No** | Logged, returned to frontend |
| `error.target` | **No** | Logged |
| `error.timestamp` | **No** | Logged |
| `error.details[].message` | **No** | Logged |

---

## How Instructions Are Built

Function: `buildSapInstructions()` in `/lib/sap/mappers.ts`

The `sap_instructions` column is assembled as follows:

```
DM: {dmName}

{instructionLong or instructionShort from entry 1}

{instructionLong or instructionShort from entry 2}

...
```

Rules:
- DM name is always the first line (if present)
- For each instruction entry: `instructionLong` is preferred; falls back to `instructionShort`
- Entries are joined with `\n\n` (double newline)
- Result is `null` if there's no content at all
- Stored in `sap_instructions` (read-only in UI)
- Completely separate from `custom_instructions` (user-editable) and the legacy `instructions` column

---

## System / toolType Mapping

Function: `extractSystem()` + `mapToolTypeToSystem()` in `/lib/sap/mappers.ts`

| SAP `toolType` | Supabase `system` |
|---|---|
| `XTM` | `XTM` |
| `LXE` | `LAT` |
| `SSE` | `SSE` |
| `STM` | `STM` |
| *(anything else / missing)* | `B0X` (default) |

Extraction order:
1. Check `SapStep.toolType` (optional field, backwards compat)
2. Fall back to `SapEnvironment[].toolType` (canonical location per OpenAPI spec)
3. If nothing found → default `B0X`

---

## Fields Protected on Update (Never Overwritten by SAP Sync)

When a project already exists in Supabase and is re-synced, these local-only fields are **never touched**:

| Column | Reason |
|---|---|
| `words` | Locally managed volume |
| `lines` | Locally managed volume |
| `status` | Local lifecycle state (active/complete/cancelled) |
| `custom_instructions` | User-written instructions |
| `instructions` | Legacy field |
| `paid` | Invoicing flag |
| `invoiced` | Invoicing flag |
| `interim_deadline` | Local deadline |
| All `projects_assignment` data | Local assignment state |

Only SAP-owned fields are updated: `name`, `language_in`, `language_out`, `initial_deadline`, `final_deadline`, `system`, `sap_instructions`, `sap_parent_name`, `sap_account`, `last_synced_at`.

---

## Auto-Generated Fields on Import

| DB Column | Value | Source |
|---|---|---|
| `api_source` | `'TPM_sap_api'` | Hardcoded constant |
| `last_synced_at` | Current timestamp | `new Date().toISOString()` |

---

## Summary: Stored vs. Displayed vs. Discarded

| Category | Fields |
|---|---|
| **Stored in DB** | `projectId` → `sap_parent_id`, `projectName` → `sap_parent_name`, `account` → `sap_account`, `subProjectId` → `sap_subproject_id`, `subProjectName` → `name`, `sourceLang` → `language_in`, `slsLang` → `language_out`, `startDate` → `initial_deadline`, `endDate` → `final_deadline`, `toolType` → `system`, `dmName` + `instructionLong`/`instructionShort` → `sap_instructions` |
| **Displayed but NOT stored** | `pmName`, `projectType`, `environmentName`, `stepText`, `volumeQuantity`+`volumeUnit` (words/lines preview) |
| **Not stored, not displayed** | `terminologyKey`, `projectUrl`, `graphId`, `lxeProject`, `translationArea`, `worklist`, `is_xtm`, `content_name`, `external_project_id`, `external_system`, `tGroup`, `subProjectFiles`, `ceBillQuantity`, `ceBillUnit`, `activityText`, `stepStatusId`, `stepStatusDescription`, `lastChangedAt`, `instructionsLastChangedAt`, `isTemplate`, `deleted`, all `ErrorDto` fields |
| **Thrown into `sap_instructions`** | `dmName` (as header), `instructionLong` (preferred), `instructionShort` (fallback) |
