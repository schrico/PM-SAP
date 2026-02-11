# TPM API Docs

## **Consuming the Sol API using the REST client (Postman)**

- Open Postman.
- Go to **Authorization** and choose **OAuth 2.0**.
- Choose **Get New Access Token**.
- On the following screen, enter the following details:
    - Acess token URL: https://lpxtpmsub.authentication.sap.hana.ondemand.com/oauth/token
    - Under **Password Credentials**, choose type **Grant**.
    - Use the technical user name and password provided.
    - For **Client Authentication** choose **Send as Basic Auth Header**.
    - Choose **Request Token**.
    - Choose **Use Token** to copy the generated token so you can use it later.
- Under the tab **Headers**, add the key **x-approuter-authorization**. As the value for this key, use the token that you generated earlier. Add the prefix **Bearer** to the token.
- Select the method **Get**.
- To get the list of projects and subprojects for your supplier, use this URL: https://lpxtpmsub-tpm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/v1/suppliers/projects.
- Choose **Send**.

If your request is successful, the system will respond with code 200 and the response body will consist of a list of the project IDs and subproject IDs that are assigned to your supplier.

- To get details of subprojects based on the subproject ID, use this URL: https://lpxtpmsub-tpm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/v1/suppliers/projects/{projectID}/subprojects/{subProjectID}. You can get the project and subproject IDs from the results of the above process.
- To get the Instructions for the subprojects use the following URL: https://lpxtpmsub-tpm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/v1/suppliers/projects/{projectId}/subproject/{subProjectId}/instructions
- Choose **Send**.
- If your request is successful, the system will respond with code 200 and the response body will contain additional information about the subproject whose ID you have provided.**Note**You can only access details of subprojects assigned to your supplier.
    
    The access token (JWT) is valid for 12 hours from the time you send the request. Once it expires, you have to request a new one.
    

## **Consuming the Sol API from another service**

You can integrate the API into your system by using service2service communication. You must follow the standard HTTPS-REST communication where you fetch the access token first and invoke the application URL by attaching the token to it in the appropriate header section (see above).

You can request the access token in one of the following two ways:

1. Password credential flow (see above).
2. Refresh token flow (details below)

The refresh token will expire after 12 hours. If you use an expired token, the system returns 401: Unauthorized together with an error message about the invalid token. Depending on your scenario, you can plan not to implement the refresh token workflow and always fetch a new token when the old one has expired.

Refresh token details:

## **Refresh Token**

```bash
$curl 'http://localhost/oauth/token' -i -X POST \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    -H 'Accept: application/json' \
    -d 'client_id=app&client_secret=appclientsecret&grant_type=refresh_token&token_format=opaque&refresh_token=880518543af44fe2b50fd61878a83bf9-r'
```

```
POST /oauth/token HTTP/1.1
Content-Type: application/x-www-form-urlencoded
Accept: application/json
Host: localhost

client_id=app&client_secret=appclientsecret&grant_type=refresh_token&token_format=opaque&refresh_token=880518543af44fe2b50fd61878a83bf9-r
```

```
HTTP/1.1 200 OK
Cache-Control: no-store
Pragma: no-cache
Content-Type: application/json;charset=UTF-8
X-XSS-Protection: 1; mode=block
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Content-Length: 1140

{"access_token":"b9d3780de4c64413b32501fcf08f1b97","token_type":"bearer","id_token":"eyJhbGciOiJIUzI1NiIsImprdSI6Imh0dHBzOi8vbG9jYWxob3N0OjgwODAvdWFhL3Rva2VuX2tleXMiLCJraWQiOiJsZWdhY3ktdG9rZW4ta2V5IiwidHlwIjoiSldUIn0.eyJzdWIiOiIwMGQzNjMxZS0yMDY0LTRiN2QtODUzMC01OGY0YjUzNjI2OGEiLCJhdWQiOlsiYXBwIl0sImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC91YWEvb2F1dGgvdG9rZW4iLCJleHAiOjE1OTQ4ODE1OTMsImlhdCI6MTU5NDgzODM5MywiYW1yIjpbInB3ZCJdLCJhenAiOiJhcHAiLCJzY29wZSI6WyJvcGVuaWQiXSwiZW1haWwiOiJSbDRtaEJAdGVzdC5vcmciLCJ6aWQiOiJ1YWEiLCJvcmlnaW4iOiJ1YWEiLCJqdGkiOiI2NDM4NWMzMzBlNjE0NTg4YjM1ZTA2OWNjOWVjNDBmZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJjbGllbnRfaWQiOiJhcHAiLCJjaWQiOiJhcHAiLCJncmFudF90eXBlIjoicGFzc3dvcmQiLCJ1c2VyX25hbWUiOiJSbDRtaEJAdGVzdC5vcmciLCJyZXZfc2lnIjoiNzhlYmY1YjciLCJ1c2VyX2lkIjoiMDBkMzYzMWUtMjA2NC00YjdkLTg1MzAtNThmNGI1MzYyNjhhIiwiYXV0aF90aW1lIjoxNTk0ODM4MzkzfQ.gBL6pWZ5JqVTr1rnn_JN4Or6uda78Cr1HNLT_XME8nk","refresh_token":"880518543af44fe2b50fd61878a83bf9-r","expires_in":43199,"scope":"scim.userids cloud_controller.read password.write cloud_controller.write openid","jti":"b9d3780de4c64413b32501fcf08f1b97"}
```

*Request Parameters*

| Parameter | Type | Constraints | Description |
| --- | --- | --- | --- |
| grant_type | String | Required | the type of authentication being used to obtain the token, in this case `refresh_token` |
| client_id | String | Optional | A unique string representing the registration information provided by the client, the recipient of the token. Optional if it is passed as part of the Basic Authorization header. |
| client_secret | String | Optional | The secret passphrase configured for the OAuth client. Optional if it is passed as part of the Basic Authorization header. |
| refresh_token | String | Required | the refresh_token that was returned along with the access token. |
| token_format | String | Optional | Can be set to `opaque` to retrieve an opaque and revocable token or to `jwt` to retrieve a JWT token. If not set the zone setting config.tokenPolicy.jwtRevocable is used. |

*Response Fields*

| Path | Type | Description |
| --- | --- | --- |
| `access_token` | `String` | An OAuth2 [access token](https://tools.ietf.org/html/rfc6749#section-1.4). When `token_format=opaque` is requested this value will be a random string that can only be validated using the UAA's `/check_token` or `/introspect` endpoints. When `token_format=jwt` is requested, this token will be a [JSON Web Token](https://tools.ietf.org/html/rfc7519) suitable for offline validation by OAuth2 Resource Servers. |
| `id_token` | `String` | An OpenID Connect [ID token](http://openid.net/specs/openid-connect-core-1_0.html#IDToken). This portion of the token response is only returned when clients are configured with the scope `openid`, the `response_type` includes `id_token`, and the user has granted approval to the client for the `openid` scope. |
| `refresh_token` | `String` | An OAuth2 [refresh token](https://tools.ietf.org/html/rfc6749#section-6). Clients typically use the refresh token to obtain a new access token without the need for the user to authenticate again. They do this by calling `/oauth/token` with `grant_type=refresh_token`. See [here](https://docs.cloudfoundry.org/api/uaa/version/74.23.0/index.html#refresh-token) for more information. A refresh token will only be issued to [clients](https://docs.cloudfoundry.org/api/uaa/version/74.23.0/index.html#clients) that have `refresh_token` in their list of `authorized_grant_types`. |
| `token_type` | `String` | The type of the access token issued. This field is mandated in [RFC 6749](https://tools.ietf.org/html/rfc6749#section-7.1). In the UAA, the only supported `token_type` is `bearer`. |
| `expires_in` | `Number` | The number of seconds until the access token expires. |
| `scope` | `String` | A space-delimited list of scopes authorized by the user for this client. This list is the intersection of the scopes configured on the [client](https://docs.cloudfoundry.org/api/uaa/version/74.23.0/index.html#clients), the group memberships of the [user](https://docs.cloudfoundry.org/api/uaa/version/74.23.0/index.html#users), and the user's approvals (when `autoapprove: true` is not configured on the [client](https://docs.cloudfoundry.org/api/uaa/version/74.23.0/index.html#clients)). |
| `jti` | `String` | A globally unique identifier for this access token. This identifier is used when [revoking tokens](https://docs.cloudfoundry.org/api/uaa/version/74.23.0/index.html#revoke-tokens). |

# API docs

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "SLS Translation Project Management",
    "description": "TPM API exposes light weight REST endpoints to be consumed by service2service communication",
    "termsOfService": "https://www.sap.com/about/trust-center/agreements/cloud/cloud-services.html?search=General+Terms+and+Conditions&sort=latest_desc&pdf-asset=3e09c607-957d-0010-87a3-c30de2ffd8ff&page=1",
    "contact": {
      "name": "SAP LX LAB",
      "email": "DL_61B0932A4DB243027DDF9F81@global.corp.sap"
    },
    "license": {
      "name": "SAP Cloud Platform",
      "url": "https://www.sap.com/about/trust-center/agreements/cloud.html"
    },
    "version": "1.1.0"
  },
  "servers": [
    {
      "url": "https://lpxtpmsub-tpm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com"
    }
  ],
  "tags": [
    {
      "name": "Supplier-Controller",
      "description": "SLS - Translation Project Management - Supplier Data Handler"
    }
  ],
  "paths": {
    "/v1/suppliers/projects": {
      "get": {
        "tags": [
          "Supplier-Controller"
        ],
        "summary": "List Projects and Sub-Projects for a supplier",
        "operationId": "listSubProjects",
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {

              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "404": {
            "description": "Not Found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "500": {
            "description": "Internal Server Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          }
        }
      }
    },
    "/v1/suppliers/projects/{projectId}": {
      "get": {
        "tags": [
          "Supplier-Controller"
        ],
        "summary": "Get details of Sub-Projects based on Sub-project ID",
        "operationId": "projectsById",
        "parameters": [
          {
            "name": "projectId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {

              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "404": {
            "description": "Not Found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "500": {
            "description": "Internal Server Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          }
        }
      }
    },
    "/v1/suppliers/projects/{projectId}/subprojects/{subProjectId}": {
      "get": {
        "tags": [
          "Supplier-Controller"
        ],
        "summary": "Get details of Sub-Projects based on Sub-project ID",
        "operationId": "subProjectsById",
        "parameters": [
          {
            "name": "projectId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "subProjectId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {

              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "404": {
            "description": "Not Found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "500": {
            "description": "Internal Server Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          }
        }
      }
    },
    "/v1/suppliers/projects/{projectId}/subprojects/{subProjectId}/instructions": {
      "get": {
        "tags": [
          "Supplier-Controller"
        ],
        "summary": "Get instructions assigned to Sub-Projects based on Sub-project ID, Content ID, Service Step & SLS Language",
        "operationId": "listInstructions",
        "parameters": [
          {
            "name": "projectId",
            "in": "path",
            "description": "Project ID",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "subProjectId",
            "in": "path",
            "description": "Sub-project ID",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "content_id",
            "in": "query",
            "description": "Content ID of the sub-project step",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "service_step",
            "in": "query",
            "description": "Service Step of the sub-project step",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "sls_lang",
            "in": "query",
            "description": "SLS language of the sub-project step",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {

              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "404": {
            "description": "Not Found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          },
          "500": {
            "description": "Internal Server Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorDto"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "ProjectDTO": {
        "type": "object",
        "properties": {
          "projects": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ProjectModel"
            }
          }
        }
      },
      "ProjectModel": {
        "type": "object",
        "properties": {
          "projectId": {
            "type": "integer",
            "format": "int64"
          },
          "projectName": {
            "type": "string"
          },
          "account": {
            "type": "string"
          },
          "subProjects": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/SubProjectModel"
            }
          }
        }
      },
      "SubProjectModel": {
        "type": "object",
        "properties": {
          "subProjectId": {
            "type": "string"
          },
          "subProjectName": {
            "type": "string"
          },
          "dmName": {
            "type": "string"
          },
          "pmName": {
            "type": "string"
          },
          "projectType": {
            "type": "string"
          }
        }
      },
      "ProjectInfoDTO": {
        "type": "object",
        "properties": {
          "projectId": {
            "type": "integer",
            "format": "int64"
          },
          "projectName": {
            "type": "string"
          },
          "account": {
            "type": "string"
          },
          "subProjects": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/SubProjectModel"
            }
          }
        }
      },
      "EnvironmentModel": {
        "type": "object",
        "properties": {
          "contentId": {
            "type": "string"
          },
          "environmentName": {
            "type": "string"
          },
          "toolType": {
            "type": "string"
          },
          "toolTypeDescription": {
            "type": "string"
          },
          "projectUrl": {
            "type": "string"
          },
          "graphId": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "lxeProject": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "translationArea": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "worklist": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "is_xtm": {
            "type": "boolean"
          },
          "content_name": {
            "type": "string"
          },
          "external_project_id": {
            "type": "string"
          },
          "external_system": {
            "type": "string"
          }
        }
      },
      "SubProjectInfoDTO": {
        "type": "object",
        "properties": {
          "subProjectId": {
            "type": "string"
          },
          "subProjectName": {
            "type": "string"
          },
          "terminologyKey": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "environment": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/EnvironmentModel"
            }
          },
          "subProjectSteps": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/SubProjectStepsModel"
            }
          }
        }
      },
      "SubProjectStepsModel": {
        "type": "object",
        "properties": {
          "contentId": {
            "type": "string"
          },
          "serviceStep": {
            "type": "string"
          },
          "stepText": {
            "type": "string"
          },
          "slsLang": {
            "type": "string"
          },
          "sourceLang": {
            "type": "string"
          },
          "tGroup": {
            "type": "string"
          },
          "startDate": {
            "type": "string"
          },
          "endDate": {
            "type": "string"
          },
          "hasInstructions": {
            "type": "boolean"
          },
          "instructionsLastChangedAt": {
            "type": "string"
          },
          "subProjectFiles": {
            "type": "string"
          },
          "volume": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/VolumeModel"
            }
          },
          "stepStatusId": {
            "type": "string"
          },
          "stepStatusDescription": {
            "type": "string"
          }
        }
      },
      "VolumeModel": {
        "type": "object",
        "properties": {
          "volumeQuantity": {
            "type": "number",
            "format": "float"
          },
          "volumeUnit": {
            "type": "string"
          },
          "ceBillQuantity": {
            "type": "number",
            "format": "float"
          },
          "ceBillUnit": {
            "type": "string"
          },
          "activityText": {
            "type": "string"
          }
        }
      },
      "InstructionDTO": {
        "type": "object",
        "properties": {
          "instructions": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/InstructionModel"
            }
          }
        }
      },
      "InstructionModel": {
        "type": "object",
        "properties": {
          "subProjectId": {
            "type": "string"
          },
          "contentId": {
            "type": "string"
          },
          "serviceStep": {
            "type": "string"
          },
          "slsLang": {
            "type": "string"
          },
          "lastChangedAt": {
            "type": "string"
          },
          "instructionShort": {
            "type": "string"
          },
          "instructionLong": {
            "type": "string"
          },
          "isTemplate": {
            "type": "boolean"
          },
          "deleted": {
            "type": "boolean"
          }
        }
      },
      "ErrorDto": {
        "type": "object",
        "properties": {
          "error": {
            "properties": {
              "status": {
                "type": "string",
                "enum": [
                  "100 CONTINUE",
                  "101 SWITCHING_PROTOCOLS",
                  "102 PROCESSING",
                  "103 EARLY_HINTS",
                  "103 CHECKPOINT",
                  "200 OK",
                  "201 CREATED",
                  "202 ACCEPTED",
                  "203 NON_AUTHORITATIVE_INFORMATION",
                  "204 NO_CONTENT",
                  "205 RESET_CONTENT",
                  "206 PARTIAL_CONTENT",
                  "207 MULTI_STATUS",
                  "208 ALREADY_REPORTED",
                  "226 IM_USED",
                  "300 MULTIPLE_CHOICES",
                  "301 MOVED_PERMANENTLY",
                  "302 FOUND",
                  "302 MOVED_TEMPORARILY",
                  "303 SEE_OTHER",
                  "304 NOT_MODIFIED",
                  "305 USE_PROXY",
                  "307 TEMPORARY_REDIRECT",
                  "308 PERMANENT_REDIRECT",
                  "400 BAD_REQUEST",
                  "401 UNAUTHORIZED",
                  "402 PAYMENT_REQUIRED",
                  "403 FORBIDDEN",
                  "404 NOT_FOUND",
                  "405 METHOD_NOT_ALLOWED",
                  "406 NOT_ACCEPTABLE",
                  "407 PROXY_AUTHENTICATION_REQUIRED",
                  "408 REQUEST_TIMEOUT",
                  "409 CONFLICT",
                  "410 GONE",
                  "411 LENGTH_REQUIRED",
                  "412 PRECONDITION_FAILED",
                  "413 PAYLOAD_TOO_LARGE",
                  "413 REQUEST_ENTITY_TOO_LARGE",
                  "414 URI_TOO_LONG",
                  "414 REQUEST_URI_TOO_LONG",
                  "415 UNSUPPORTED_MEDIA_TYPE",
                  "416 REQUESTED_RANGE_NOT_SATISFIABLE",
                  "417 EXPECTATION_FAILED",
                  "418 I_AM_A_TEAPOT",
                  "419 INSUFFICIENT_SPACE_ON_RESOURCE",
                  "420 METHOD_FAILURE",
                  "421 DESTINATION_LOCKED",
                  "422 UNPROCESSABLE_ENTITY",
                  "423 LOCKED",
                  "424 FAILED_DEPENDENCY",
                  "425 TOO_EARLY",
                  "426 UPGRADE_REQUIRED",
                  "428 PRECONDITION_REQUIRED",
                  "429 TOO_MANY_REQUESTS",
                  "431 REQUEST_HEADER_FIELDS_TOO_LARGE",
                  "451 UNAVAILABLE_FOR_LEGAL_REASONS",
                  "500 INTERNAL_SERVER_ERROR",
                  "501 NOT_IMPLEMENTED",
                  "502 BAD_GATEWAY",
                  "503 SERVICE_UNAVAILABLE",
                  "504 GATEWAY_TIMEOUT",
                  "505 HTTP_VERSION_NOT_SUPPORTED",
                  "506 VARIANT_ALSO_NEGOTIATES",
                  "507 INSUFFICIENT_STORAGE",
                  "508 LOOP_DETECTED",
                  "509 BANDWIDTH_LIMIT_EXCEEDED",
                  "510 NOT_EXTENDED",
                  "511 NETWORK_AUTHENTICATION_REQUIRED"
                ]
              },
              "message": {
                "type": "string"
              },
              "target": {
                "type": "string"
              },
              "timestamp": {
                "type": "string",
                "format": "date-time"
              },
              "details": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/DetailError"
                }
              }
            }
          }
        }
      },
      "DetailError": {
        "properties": {
          "message": {
            "type": "string"
          }
        }
      }
    }
  }
}
```