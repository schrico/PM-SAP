# TPM API Docs

# API docs

This following json is what data is coming through in the TPM API.
```json
{
  "ProjectDTO": {
    "projects": [
      {
        "projectId": "int64",
        "projectName": "string",
        "account": "string",
        "subProjects": [
          {
            "subProjectId": "string",
            "subProjectName": "string",
            "dmName": "string",
            "pmName": "string",
            "projectType": "string"
          }
        ]
      }
    ]
  },
  "ProjectModel": {
    "projectId": "int64",
    "projectName": "string",
    "account": "string",
    "subProjects": [
      {
        "subProjectId": "string",
        "subProjectName": "string",
        "dmName": "string",
        "pmName": "string",
        "projectType": "string"
      }
    ]
  },
  "SubProjectModel": {
    "subProjectId": "string",
    "subProjectName": "string",
    "dmName": "string",
    "pmName": "string",
    "projectType": "string"
  },
  "ProjectInfoDTO": {
    "projectId": "int64",
    "projectName": "string",
    "account": "string",
    "subProjects": [
      {
        "subProjectId": "string",
        "subProjectName": "string",
        "dmName": "string",
        "pmName": "string",
        "projectType": "string"
      }
    ]
  },
  "EnvironmentModel": {
    "contentId": "string",
    "environmentName": "string",
    "toolType": "string",
    "toolTypeDescription": "string",
    "projectUrl": "string",
    "graphId": ["string"],
    "lxeProject": ["string"],
    "translationArea": ["string"],
    "worklist": ["string"],
    "is_xtm": "boolean",
    "content_name": "string",
    "external_project_id": "string",
    "external_system": "string"
  },
  "SubProjectInfoDTO": {
    "subProjectId": "string",
    "subProjectName": "string",
    "terminologyKey": ["string"],
    "environment": [
      {
        "contentId": "string",
        "environmentName": "string",
        "toolType": "string",
        "toolTypeDescription": "string",
        "projectUrl": "string",
        "graphId": ["string"],
        "lxeProject": ["string"],
        "translationArea": ["string"],
        "worklist": ["string"],
        "is_xtm": "boolean",
        "content_name": "string",
        "external_project_id": "string",
        "external_system": "string"
      }
    ],
    "subProjectSteps": [
      {
        "contentId": "string",
        "serviceStep": "string",
        "stepText": "string",
        "slsLang": "string",
        "sourceLang": "string",
        "tGroup": "string",
        "startDate": "string",
        "endDate": "string",
        "hasInstructions": "boolean",
        "instructionsLastChangedAt": "string",
        "subProjectFiles": "string",
        "volume": [
          {
            "volumeQuantity": "float",
            "volumeUnit": "string",
            "ceBillQuantity": "float",
            "ceBillUnit": "string",
            "activityText": "string",
            "stepStatusId": "string",
            "stepStatusDescription": "string"
          }
        ]
      }
    ]
  },
  "SubProjectStepsModel": {
    "contentId": "string",
    "serviceStep": "string",
    "stepText": "string",
    "slsLang": "string",
    "sourceLang": "string",
    "tGroup": "string",
    "startDate": "string",
    "endDate": "string",
    "hasInstructions": "boolean",
    "instructionsLastChangedAt": "string",
    "subProjectFiles": "string",
    "volume": [
      {
        "volumeQuantity": "float",
        "volumeUnit": "string",
        "ceBillQuantity": "float",
        "ceBillUnit": "string",
        "activityText": "string",
        "stepStatusId": "string",
        "stepStatusDescription": "string"
      }
    ]
  },
  "VolumeModel": {
    "volumeQuantity": "float",
    "volumeUnit": "string",
    "ceBillQuantity": "float",
    "ceBillUnit": "string",
    "activityText": "string"
  },
  "InstructionDTO": {
    "instructions": [
      {
        "subProjectId": "string",
        "contentId": "string",
        "serviceStep": "string",
        "slsLang": "string",
        "lastChangedAt": "string",
        "instructionShort": "string",
        "instructionLong": "string",
        "isTemplate": "boolean",
        "deleted": "boolean"
      }
    ]
  },
  "InstructionModel": {
    "subProjectId": "string",
    "contentId": "string",
    "serviceStep": "string",
    "slsLang": "string",
    "lastChangedAt": "string",
    "instructionShort": "string",
    "instructionLong": "string",
    "isTemplate": "boolean",
    "deleted": "boolean"
  },
  "ErrorDto": {
    "error": {
      "status": "string",
      "message": "string",
      "target": "string",
      "timestamp": "date-time",
      "details": [
        {
          "message": "string"
        }
      ]
    }
  },
  "DetailError": {
    "message": "string"
  }
}

```
