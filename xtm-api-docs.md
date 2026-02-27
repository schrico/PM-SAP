# XTM REST API — Overview & Reference

## What is XTM?

**XTM Cloud** is an enterprise-grade, cloud-based **Translation Management System (TMS)**. Its REST API (version **25.2**) provides programmatic access to everything in the platform: project lifecycle management, file handling, workflow automation, user management, cost calculations, analytics, terminology, and translation memory.

- **OpenAPI Spec:** 3.0.1
- **Base path:** `/project-manager-api-rest`
- **Server:** `https://SERVER_URL/rest-api`
- **Primary response format:** JSON
- **Total endpoints:** ~161 across 35 categories

---

## Authentication

All endpoints require one of the two supported auth methods in the `Authorization` header.

### XTM-Basic (Token)

Generate a permanent token from credentials:

```http
POST /auth/token
Authorization: XTM-Basic <your-token>
```

### OAuth 2.0 (Bearer)

```http
Authorization: Bearer <your-oauth-token>
```

OAuth 2.0 uses the Password grant type. SAML is also supported.

---

## Endpoint Categories

### Projects

The core of the API. Full CRUD plus lifecycle actions.

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/projects` | List projects (simple filter) |
| `POST` | `/projects/search` | List projects (advanced filter) |
| `POST` | `/projects` | Create project |
| `POST` | `/projects/clone` | Clone an existing project |
| `POST` | `/projects/multi-create` | Create multiple projects at once |
| `GET` | `/projects/{projectId}` | Get project details |
| `PUT/PATCH` | `/projects/{projectId}` | Update project |
| `DELETE` | `/projects/{projectId}` | Delete project |
| `POST` | `/projects/{projectId}/activate` | Activate project |
| `POST` | `/projects/{projectId}/deactivate` | Cancel project |
| `POST` | `/projects/{projectId}/archive` | Archive project |
| `GET` | `/projects/{projectId}/status` | Get project status |
| `GET` | `/projects/{projectId}/word-count` | Get total deducted word count |
| `GET` | `/projects/{projectId}/users` | Get users on project |
| `POST` | `/projects/{projectId}/target-languages` | Add target languages |
| `DELETE` | `/projects/{projectId}/target-languages` | Remove target languages |
| `PUT` | `/projects/{projectId}/due-dates` | Update due dates |
| `GET` | `/projects/{projectId}/proposal` | Get project estimates |

### Project Templates

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/projects/templates` | List templates (simple filter) |
| `POST` | `/projects/templates/search` | List templates (advanced filter) |
| `POST` | `/projects/templates` | Create template |
| `GET` | `/projects/templates/{templateId}` | Get template |
| `GET` | `/projects/templates/{templateId}/custom-fields` | Get template custom fields |

### Project Workflows

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/projects/{projectId}/workflow` | Get project workflows |
| `POST` | `/projects/{projectId}/workflow/start` | Start workflow |
| `POST` | `/projects/{projectId}/workflow/finish` | Move jobs to next step |
| `POST` | `/projects/{projectId}/workflow/reject` | Move jobs to previous step |
| `POST` | `/projects/{projectId}/workflow/assign` | Assign users to workflow |
| `GET` | `/projects/{projectId}/workflow/assignment` | Get workflow assignments |
| `PUT/PATCH` | `/projects/{projectId}/workflow/jobs` | Update workflow for jobs |
| `GET` | `/projects/{projectId}/workflows/time-trackings/jobs` | Get manual time trackings |
| `GET` | `/workflows` | List all available workflows |
| `GET` | `/workflows/{workflowId}` | Get workflow steps |

### Project Files

| Method | Path | Summary |
|--------|------|---------|
| `POST` | `/projects/{projectId}/files/sources/upload` | Upload source files |
| `GET` | `/projects/{projectId}/files/sources/download` | Download source files |
| `POST` | `/projects/{projectId}/files/translations/upload` | Upload translation file |
| `GET` | `/projects/{projectId}/files/translations/{fileId}/status` | Check translation upload status |
| `POST` | `/projects/{projectId}/files/generate` | Generate target files |
| `GET` | `/projects/{projectId}/files/status` | Get status of all generated files |
| `GET` | `/projects/{projectId}/files/{fileId}/status` | Get status of a specific file |
| `GET` | `/projects/{projectId}/files/download` | Download all project files |
| `GET` | `/projects/{projectId}/files/{fileId}/download` | Download a specific file |
| `DELETE` | `/projects/{projectId}/files` | Delete file |
| `POST` | `/projects/{projectId}/files/preview-files/upload` | Upload preview files |
| `POST` | `/projects/{projectId}/files/reference-materials/upload` | Upload reference materials |
| `GET` | `/projects/{projectId}/files/reference-materials/download` | Download reference materials |
| `POST` | `/projects/{projectId}/files/segment-id-images/upload` | Upload segment ID images |
| `POST` | `/projects/{projectId}/files/{fileId}/docx/compare` | Compare DOCX files |
| `GET` | `/projects/{projectId}/files/{fileId}/docx/compare` | Download comparison file |

### Project Jobs

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/projects/{projectId}/jobs` | List project jobs |
| `POST` | `/projects/{projectId}/jobs/cancel` | Cancel jobs |
| `GET` | `/projects/jobs/bundles` | List project bundles |
| `POST` | `/projects/{projectId}/jobs/{jobId}/bundles/{bundleId}/finish` | Finish bundle |

### Project Analytics & Statistics

| Method | Path | Summary |
|--------|------|---------|
| `POST` | `/projects/statistics` | Generate statistics for projects or users |
| `GET` | `/projects/statistics` | Download generated statistics |
| `GET` | `/projects/{projectId}/statistics` | Get project statistics |
| `GET` | `/projects/{projectId}/statistics/edc` | Get EDC score *(Beta)* |
| `GET` | `/projects/{projectId}/metrics` | Get project metrics |
| `GET` | `/projects/{projectId}/metrics/bundles` | Get bundle metrics |
| `GET` | `/projects/{projectId}/metrics/jobs` | Get job metrics |
| `GET` | `/projects/{projectId}/metrics/files` | Get metrics file list |
| `GET` | `/projects/{projectId}/analysis` | Get analysis status |
| `POST` | `/projects/{projectId}/reanalyze` | Re-run analysis |
| `GET` | `/projects/lqa` | Get LQA overview |
| `GET` | `/projects/{projectId}/lqa` | Get project LQA |
| `GET` | `/projects/{projectId}/lqa/download` | Download project LQA report |

### Project Costs

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/projects/{projectId}/costs` | Get project costs |
| `POST` | `/projects/{projectId}/costs` | Generate costs |
| `GET` | `/projects/{projectId}/costs/{costId}` | Get specific cost record |
| `POST` | `/projects/{projectId}/costs/{costId}/pos` | Generate Purchase Order |
| `GET` | `/projects/{projectId}/costs/{costId}/pos` | Download Purchase Order |

### Project Editor Links

| Method | Path | Summary |
|--------|------|---------|
| `POST` | `/projects/{projectId}/links/editor` | Get link to the Editor |
| `GET` | `/projects/{projectId}/links/project-editor` | Get link to the Project Editor |

### Project Custom Fields

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/projects/{projectId}/custom-fields` | Get project custom fields |
| `POST` | `/projects/{projectId}/custom-fields` | Set project custom fields |
| `GET` | `/custom-fields/project` | Get custom field definitions (project) |
| `GET` | `/custom-fields/customer` | Get custom field definitions (customer) |
| `GET` | `/custom-fields/terminology` | Get custom field definitions (terminology) |
| `GET` | `/custom-fields/user` | Get custom field definitions (user) |

### Project Callbacks (Webhooks)

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/projects/{projectId}/callbacks` | List project callbacks |
| `POST` | `/projects/{projectId}/callbacks` | Add callback |
| `DELETE` | `/projects/{projectId}/callbacks` | Delete callbacks |
| `PATCH` | `/projects/{projectId}/callbacks/{callbackId}` | Update callback |

### Customers

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/customers` | List customers |
| `POST` | `/customers` | Create customer |
| `GET` | `/customers/{customerId}` | Get customer |
| `PUT/PATCH` | `/customers/{customerId}` | Update customer |
| `DELETE` | `/customers/{customerId}` | Delete customer |
| `GET` | `/customers/{customerId}/language-combinations` | Get customer language combinations |
| `GET` | `/customers/{customerId}/subject-matters` | Get customer subject matters |
| `GET` | `/customers/{customerId}/files/reference-materials/download` | Download customer reference materials |

### Users

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/users` | List users |
| `POST` | `/users` | Create user |
| `PUT/PATCH` | `/users/{userId}` | Update user |
| `GET` | `/users/{userId}/roles` | Get user roles |
| `GET` | `/users/{userId}/access-rights` | Get access rights |
| `POST` | `/users/{userId}/access-rights` | Add roles |
| `DELETE` | `/users/{userId}/access-rights` | Remove roles |
| `GET` | `/users/{userId}/language-combinations` | Get language pairs |
| `POST` | `/users/{userId}/language-combinations` | Add language pairs |
| `DELETE` | `/users/{userId}/language-combinations` | Remove language pairs |
| `GET` | `/users/{userId}/subject-matters` | Get subject matters |
| `POST` | `/users/{userId}/subject-matters` | Add subject matters |
| `DELETE` | `/users/{userId}/subject-matters` | Remove subject matters |
| `GET` | `/users/{userId}/workflow-steps` | Get workflow steps |
| `POST` | `/users/{userId}/workflow-steps` | Add workflow steps |
| `DELETE` | `/users/{userId}/workflow-steps` | Remove workflow steps |
| `GET` | `/users/{userId}/rate-cards` | Get user rate cards |
| `GET` | `/roles` | List all available roles |

### External Users

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/externals/users` | List external users |
| `POST` | `/externals/users` | Create external user |
| `GET` | `/externals/users/{externalUserId}` | Get external user |
| `PUT` | `/externals/users/{externalUserId}` | Update external user |

### Terminology Management

| Method | Path | Summary |
|--------|------|---------|
| `POST` | `/terminology/files/import` | Import terminology file |
| `GET` | `/terminology/files/import` | Check import status |
| `POST` | `/terminology/files/export` | Export terminology file |
| `GET` | `/terminology/files/export` | Check export status |
| `GET` | `/terminology/files/{terminologyId}/download` | Download exported terminology |
| `DELETE` | `/terminology/files/{terminologyId}` | Delete terminology |

### Translation Memory (TM)

| Method | Path | Summary |
|--------|------|---------|
| `POST` | `/translation-memory/files/generate` | Generate TM file |
| `POST` | `/translation-memory/files/import` | Import TM file |
| `GET` | `/translation-memory/files/import` | Check import status |
| `GET` | `/translation-memory/files/{tmFileId}/status` | Check TM file status |
| `GET` | `/translation-memory/files/{tmFileId}/download` | Download TM file |

### Concordance Search

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/concordance` | Search for concordance matches |

### Tags

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/tag-groups` | List tag groups |
| `POST` | `/tag-groups` | Create tag group |
| `GET` | `/tag-groups/{tagGroupId}` | Get tag group |
| `PUT/PATCH` | `/tag-groups/{tagGroupId}` | Update tag group |
| `DELETE` | `/tag-groups/{tagGroupId}` | Delete tag group |
| `GET` | `/tag-groups/{tagGroupId}/tags` | List tags in group |
| `POST` | `/tag-groups/{tagGroupId}/tags` | Create tag |

### LSP Rate Cards

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/lsps/{lspId}/rate-cards` | Get rate cards for an LSP |

### System

| Method | Path | Summary |
|--------|------|---------|
| `GET` | `/system` | Get system details |
| `GET` | `/subject-matters` | List all subject matters |

---

## Callbacks (Webhooks)

The API supports event-driven webhooks. Callbacks must be enabled by the XTM support team. Supported auth methods for callbacks: **Basic**, **Signature**, **OAuth 2.0**.

| Event | Trigger |
|-------|---------|
| `analysisFinishedCallback` | File analysis completes |
| `jobFinishedCallback` | A job finishes processing |
| `projectFinishedCallback` | Entire project finishes |
| `workflowTransitionCallback` | Workflow step changes |
| `projectCreatedCallback` | Project is created |
| `projectAcceptedCallback` | Project is accepted |
| `dueDateChangedCallback` | Due date is updated |
| `projectActivityChangedCallback` | Project activity changes |
| `projectLanguageChangedCallback` | Languages added or removed |
| `invoiceStatusChangedCallback` | Invoice status changes |
| `sourceFileUpdatedCallback` | Source file is updated |

---

## Response Conventions

- **Format:** JSON (all endpoints)
- **Tracing headers:** Every response includes `xtm-trace-id` and `xtm-span-id`
- **Dates:** ISO-8601 format — `YYYY-MM-DDThh:mm:ssZ` (UTC) or with timezone offset `±hh:mm`
- **Errors:** Returned as `RSErrorResponse` objects with standard HTTP status codes

---

## Key Data Models

| Model | Description |
|-------|-------------|
| `RSProjectResponse` | Full project object |
| `RSCreateProjectResponse` | Response after project creation |
| `RSCustomerGetResponse` | Customer details |
| `RSUserCreationRequest/Response` | User create payload & result |
| `RSProjectWorkflowUpdatePutRequest` | Workflow update payload |
| `RSCostsResponse` | Cost details |
| `RSCoreMetrics` | Core project metrics |
| `RSCoreStatistics` | Aggregated statistics |
| `RSFileMetadata` | File info |
| `RSEditorLinkResponse` | Editor link details |
| `RSExportTermRequest/Response` | Terminology export |
| `RSImportTermRequest/Response` | Terminology import |
| `RSTMFileImportRequest/Response` | TM file operations |
| `RSTag` / `RSCreateTag` | Tag objects |
| `RSErrorResponse` | Standard error envelope |

---

## Quick Reference

| Category | Endpoints |
|----------|-----------|
| Projects (core) | ~25 |
| Project files | ~17 |
| Project workflows | ~11 |
| Project analytics/statistics | ~11 |
| Project costs | 5 |
| Users | ~18 |
| Customers | ~8 |
| Terminology | 6 |
| Translation Memory | 5 |
| Tags | 8 |
| External Users | 4 |
| Callbacks | 4 |
| System / Other | ~5 |
| **Total** | **~161** |

---

## Further Reading

- [XTM Support Portal](https://xtm-cloud.atlassian.net/servicedesk/customer/portals)
- [SOAP API Docs](https://xtm.cloud/soap-api/)
- [API Examples](https://xtm.cloud/api-examples/)
