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

## Example

GET: https://lpxtpmsub-tpm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/v1/suppliers/projects/7854

{
    "projectId": 7854,
    "projectName": "SAP International Trade Management Services",
    "account": "Global_Trade_Services",
    "subProjects": [
        {
            "subProjectId": "7854-16",
            "subProjectName": "SP00_UI_ABAP_GJC000_2026CW07",
            "dmName": "Lion Wang",
            "pmName": "Sang Kyoo Lee",
            "projectType": "Product"
        }
    ]
}

GET: https://lpxtpmsub-tpm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/v1/suppliers/projects/7854/subprojects/7854-16

{
    "subProjectId": "7854-16",
    "subProjectName": "SP00_UI_ABAP_GJC000_2026CW07",
    "terminologyKey": [
        "000148",
        "000148"
    ],
    "environment": [
        {
            "contentId": "000001",
            "environmentName": "SAP Translation System - SSH / 000 / SAP",
            "toolType": "SAP",
            "toolTypeDescription": "SAP Translation System",
            "lxeProject": [
                "002258 - SAP International Trade Management Services: SP00_UI_ABAP_GJC000_2026CW07: Content_1 7854-16"
            ],
            "translationArea": [
                "GJC000 - GTS: E4H 2025"
            ],
            "worklist": [
                "0001 - Standard worklist"
            ],
            "is_xtm": false,
            "content_name": "Content_1",
            "external_project_id": "0000000000"
        },
        {
            "contentId": "000002",
            "environmentName": "SAP Translation System - SSH / 000 / SAP",
            "toolType": "SAP",
            "toolTypeDescription": "SAP Translation System",
            "lxeProject": [
                "002259 - SAP International Trade Management Services: SP00_UI_ABAP_GJC000_2026CW07: Content_2 7854-16"
            ],
            "translationArea": [
                "GJC000 - GTS: E4H 2025"
            ],
            "worklist": [
                "0001 - Standard worklist"
            ],
            "is_xtm": false,
            "content_name": "Content_2",
            "external_project_id": "0000000000"
        }
    ],
    "subProjectSteps": [
        {
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "stepText": "Translate final volume",
            "slsLang": "ptBR",
            "sourceLang": "enUS",
            "tGroup": "TE",
            "startDate": "2026-02-26T00:00:00.000Z",
            "endDate": "2026-02-27T16:00:00.000Z",
            "hasInstructions": true,
            "volume": [
                {
                    "volumeQuantity": 10.0,
                    "volumeUnit": "Lines",
                    "ceBillQuantity": 10.0,
                    "ceBillUnit": "Lines",
                    "activityText": "Translate short texts"
                },
                {
                    "volumeQuantity": 100.0,
                    "volumeUnit": "Words",
                    "ceBillQuantity": 100.0,
                    "ceBillUnit": "Words",
                    "activityText": "Translate long texts"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Hours",
                    "activityText": "Automated minimum charge"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Hours",
                    "activityText": "Translate long texts without TAMO"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Hours",
                    "activityText": "Other hourly-based activities in translation project"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Terms",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Terms",
                    "activityText": "Translate terminology during translation"
                }
            ],
            "stepStatusId": "000",
            "stepStatusDescription": "Pending"
        },
        {
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "stepText": "Translate current volume",
            "slsLang": "ptBR",
            "sourceLang": "enUS",
            "tGroup": "TE",
            "startDate": "2026-02-10T00:00:00.000Z",
            "endDate": "2026-02-25T20:00:00.000Z",
            "hasInstructions": true,
            "volume": [
                {
                    "volumeQuantity": 2000.0,
                    "volumeUnit": "Lines",
                    "ceBillQuantity": 2000.0,
                    "ceBillUnit": "Lines",
                    "activityText": "Translate short texts"
                },
                {
                    "volumeQuantity": 300.0,
                    "volumeUnit": "Words",
                    "ceBillQuantity": 300.0,
                    "ceBillUnit": "Words",
                    "activityText": "Translate long texts"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Terms",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Terms",
                    "activityText": "Translate terminology during translation"
                }
            ],
            "stepStatusId": "250",
            "stepStatusDescription": "In Process"
        },
        {
            "contentId": "000002",
            "serviceStep": "TRANSLFWL",
            "stepText": "Translate final volume",
            "slsLang": "ptBR",
            "sourceLang": "deDE",
            "tGroup": "TE",
            "startDate": "2026-02-26T00:00:00.000Z",
            "endDate": "2026-02-27T16:00:00.000Z",
            "hasInstructions": true,
            "volume": [
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.5,
                    "ceBillUnit": "Hours",
                    "activityText": "Automated minimum charge"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Terms",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Terms",
                    "activityText": "Translate terminology during translation"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Hours",
                    "activityText": "Other hourly-based activities in translation project"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Hours",
                    "activityText": "Translate long texts without TAMO"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Words",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Words",
                    "activityText": "Translate long texts"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Lines",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Lines",
                    "activityText": "Translate short texts"
                }
            ],
            "stepStatusId": "000",
            "stepStatusDescription": "Pending"
        },
        {
            "contentId": "000002",
            "serviceStep": "TRANSLREGU",
            "stepText": "Translate current volume",
            "slsLang": "ptBR",
            "sourceLang": "deDE",
            "tGroup": "TE",
            "startDate": "2026-02-10T00:00:00.000Z",
            "endDate": "2026-02-25T20:00:00.000Z",
            "hasInstructions": true,
            "volume": [
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Lines",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Lines",
                    "activityText": "Translate short texts"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Words",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Words",
                    "activityText": "Translate long texts"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Terms",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Terms",
                    "activityText": "Translate terminology during translation"
                }
            ],
            "stepStatusId": "250",
            "stepStatusDescription": "In Process"
        }
    ]
}

GET: https://lpxtpmsub-tpm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/v1/suppliers/projects/7854/subprojects/7854-16/instructions

{
    "instructions": [
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Internal Info: EN/DE for Internal / Query Contacts",
            "instructionLong": "<p>Dreier, Wiebke is EN/DE translator</p>\n<p>Query Contacts:<br>Stolz, Torsten &lt;torsten.stolz@sap.com&gt;<br>Endres, Annette &lt;annette.endres@sap.com&gt;</p>",
            "isTemplate": false,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Not Translation-Relevant tables for GTS",
            "instructionLong": "<table style=\"width: 607px ; height: 1574.14px\" border=\"0\"><colgroup><col style=\"width: 606px\"></colgroup>\n<tbody>\n<tr style=\"height: 22.3906px\">\n<td style=\"width: 413pt ; height: 22.3906px\">Not Translation-Relevant for GTS:</td>\n</tr>\n<tr style=\"height: 99.1719px\">\n<td style=\"height: 99.1719px\">\n<p>Irrelevant Tables: The following tables are only relevant for translation into EN! From GTS 7.1 SP05 on, they may appear again in the worklist, but please do not translate them into any other language except EN!</p>\n</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">&nbsp;</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">TADC</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">\n<p style=\"margin: 0in ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">1 table newly added</p>\n</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">\n<p style=\"margin: 0in ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong>000/SAPSLL/CUCEQTT &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; +</strong></p>\n</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">\n<p style=\"margin: 0in ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">2 tables newly added</p>\n</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">\n<p style=\"margin: 0in ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 12pt\"><strong>000/SAPSLL/CUCARCT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; +</strong></span></p>\n</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">\n<p style=\"margin: 0in ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 12pt\"><strong>000/SAPSLL/CUCCNRT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; +</strong></span></p>\n</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">\n<p style=\"margin: 0in ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">/SAPSLL/CUCAART Abgabenarten - Bezeichnung</p>\n</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCAFAT Beantragte Beg&uuml;nstigung - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCAGGT Abgabengruppe Steuerbescheid - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCAPRT Zusatzverfahren - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCBMST Bemessungsma&szlig;stab Steuerbescheid - Bez.</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCCPGT Containerstatus</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCDADT Definition Abgabenarten - Texttabelle</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCDCT Art der Anmeldung f&uuml;r Global Trade Srv. - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCFDPT Packst&uuml;ckarten - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCINDT Kennzeichen Zollabwicklung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCMEST Meldungscodes - Bezeichnungen</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCMOTT Art des Bef&ouml;rderungsmittels - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCMTRT Verkehrszweig</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCNGAT Warenkreis - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCPATT Vorpapierarten Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCPOPT Ausstellende Beh&ouml;rde Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCPQUT Qualifikator der Unterlage - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCPROT Zollrechtliche Bestimmung Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCPSTT Status einer Unterlage Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCPTYT Packst&uuml;ckarten - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCPYTT Zahlungsarten - Bezeichnungen</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCREST Kontrollergebnis Zoll - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCSLTT Verschlu&szlig;arten - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCSTAT Zollrechtlicher Status der Ware - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCSTT Zollrechtlicher Status - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCSUST Aufschubarten - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCVAT Anmeldeart - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCZAFT Zahlungsaufforderung f&uuml;r Steuerbescheid - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/LEGBTT Zollgesch&auml;ftsarten - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/LEGEPT Ausfuhrarten Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/LEGSLTT Sitz des Einf&uuml;hrers - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/LEGSSTT Statistikstatus - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/TLEACMT Nachrichten zur Aktivit&auml;t</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/TLEPAFT Aktivit&auml;tenfolge f&uuml;r Global Trade Srv. - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/TLEPRAT Prozessaktivit&auml;ten f&uuml;r Global Trade Services</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/TLEPRT Prozesse f&uuml;r Global Trade Services - Bezeichnung</td>\n</tr>\n<tr style=\"height: 44.75px\">\n<td style=\"height: 44.75px\">/SAPSLL/TLEPST Prozessschema f&uuml;r Global Trade Services - Bezeichnung Irrelevant</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">&nbsp;</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">TLGS (obj names with /SAPSLL/PF*)&nbsp;</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_US_7525V</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_US_CF3461</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_US_CF7501</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_US_CF7533</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_US_COM_IN</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_US_COO</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_US_SLI</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_CA_CCCF</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_NAFTA_VD_1</td>\n</tr>\n<tr>\n<td>/SAPSLL/PF_DE_CTAX</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_DE_CUSTST</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_NAFTA_CA_COO</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">&nbsp;</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">ATTENTION: Relevant for FR,ES</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\"><strong>/SAPSLL/PF_NAFTA_CA_COO</strong></td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_NAFTA_COO</td>\n</tr>\n<tr style=\"height: 10px\">\n<td style=\"height: 10px\">/SAPSLL/PF_NAFTA_MX_COO</td>\n</tr>\n</tbody>\n</table>",
            "isTemplate": false,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000002",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Internal Info: EN/DE for Internal / Query Contacts",
            "instructionLong": "<p>Dreier, Wiebke is EN/DE translator</p>\n<p>Query Contacts:<br>Stolz, Torsten &lt;torsten.stolz@sap.com&gt;<br>Endres, Annette &lt;annette.endres@sap.com&gt;</p>",
            "isTemplate": false,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Internal Info: EN/DE for Internal / Query Contacts",
            "instructionLong": "<p>Dreier, Wiebke is EN/DE translator</p>\n<p>Query Contacts:<br>Stolz, Torsten &lt;torsten.stolz@sap.com&gt;<br>Endres, Annette &lt;annette.endres@sap.com&gt;</p>",
            "isTemplate": false,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Not Translation-Relevant tables for GTS",
            "instructionLong": "<table style=\"width: 607px ; height: 1574.14px\" border=\"0\"><colgroup><col style=\"width: 606px\"></colgroup>\n<tbody>\n<tr style=\"height: 22.3906px\">\n<td style=\"width: 413pt ; height: 22.3906px\">Not Translation-Relevant for GTS:</td>\n</tr>\n<tr style=\"height: 99.1719px\">\n<td style=\"height: 99.1719px\">\n<p>Irrelevant Tables: The following tables are only relevant for translation into EN! From GTS 7.1 SP05 on, they may appear again in the worklist, but please do not translate them into any other language except EN!</p>\n</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">&nbsp;</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">TADC</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">\n<p style=\"margin: 0in ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">1 table newly added</p>\n</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">\n<p style=\"margin: 0in ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong>000/SAPSLL/CUCEQTT &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; +</strong></p>\n</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">\n<p style=\"margin: 0in ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">2 tables newly added</p>\n</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">\n<p style=\"margin: 0in ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 12pt\"><strong>000/SAPSLL/CUCARCT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; +</strong></span></p>\n</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">\n<p style=\"margin: 0in ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 12pt\"><strong>000/SAPSLL/CUCCNRT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; +</strong></span></p>\n</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">\n<p style=\"margin: 0in ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">/SAPSLL/CUCAART Abgabenarten - Bezeichnung</p>\n</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCAFAT Beantragte Beg&uuml;nstigung - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCAGGT Abgabengruppe Steuerbescheid - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCAPRT Zusatzverfahren - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCBMST Bemessungsma&szlig;stab Steuerbescheid - Bez.</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCCPGT Containerstatus</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCDADT Definition Abgabenarten - Texttabelle</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCDCT Art der Anmeldung f&uuml;r Global Trade Srv. - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCFDPT Packst&uuml;ckarten - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCINDT Kennzeichen Zollabwicklung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCMEST Meldungscodes - Bezeichnungen</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCMOTT Art des Bef&ouml;rderungsmittels - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCMTRT Verkehrszweig</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCNGAT Warenkreis - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCPATT Vorpapierarten Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCPOPT Ausstellende Beh&ouml;rde Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCPQUT Qualifikator der Unterlage - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCPROT Zollrechtliche Bestimmung Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCPSTT Status einer Unterlage Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCPTYT Packst&uuml;ckarten - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCPYTT Zahlungsarten - Bezeichnungen</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCREST Kontrollergebnis Zoll - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCSLTT Verschlu&szlig;arten - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCSTAT Zollrechtlicher Status der Ware - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCSTT Zollrechtlicher Status - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCSUST Aufschubarten - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCVAT Anmeldeart - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/CUCZAFT Zahlungsaufforderung f&uuml;r Steuerbescheid - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/LEGBTT Zollgesch&auml;ftsarten - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/LEGEPT Ausfuhrarten Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/LEGSLTT Sitz des Einf&uuml;hrers - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/LEGSSTT Statistikstatus - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/TLEACMT Nachrichten zur Aktivit&auml;t</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/TLEPAFT Aktivit&auml;tenfolge f&uuml;r Global Trade Srv. - Bezeichnung</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/TLEPRAT Prozessaktivit&auml;ten f&uuml;r Global Trade Services</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/TLEPRT Prozesse f&uuml;r Global Trade Services - Bezeichnung</td>\n</tr>\n<tr style=\"height: 44.75px\">\n<td style=\"height: 44.75px\">/SAPSLL/TLEPST Prozessschema f&uuml;r Global Trade Services - Bezeichnung Irrelevant</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">&nbsp;</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">TLGS (obj names with /SAPSLL/PF*)&nbsp;</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_US_7525V</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_US_CF3461</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_US_CF7501</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_US_CF7533</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_US_COM_IN</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_US_COO</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_US_SLI</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_CA_CCCF</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_NAFTA_VD_1</td>\n</tr>\n<tr>\n<td>/SAPSLL/PF_DE_CTAX</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_DE_CUSTST</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_NAFTA_CA_COO</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">&nbsp;</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">ATTENTION: Relevant for FR,ES</td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\"><strong>/SAPSLL/PF_NAFTA_CA_COO</strong></td>\n</tr>\n<tr style=\"height: 22.3906px\">\n<td style=\"height: 22.3906px\">/SAPSLL/PF_NAFTA_COO</td>\n</tr>\n<tr style=\"height: 10px\">\n<td style=\"height: 10px\">/SAPSLL/PF_NAFTA_MX_COO</td>\n</tr>\n</tbody>\n</table>",
            "isTemplate": false,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000002",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Internal Info: EN/DE for Internal / Query Contacts",
            "instructionLong": "<p>Dreier, Wiebke is EN/DE translator</p>\n<p>Query Contacts:<br>Stolz, Torsten &lt;torsten.stolz@sap.com&gt;<br>Endres, Annette &lt;annette.endres@sap.com&gt;</p>",
            "isTemplate": false,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "PROD_COPYRIGHT",
            "instructionLong": "<p>TX COPYRIGHT* for all languages except DE, EN, ES, FR, IT, JA, PT, ZH (SAP_BASIS only) 1. These objects need to called up directly as the object type is not relevant for most of the languages. 2. Go to SE63 3. Enter TX 4. Enter COPYRIGHT*, press F4 5. Translate all listed objects</p>",
            "isTemplate": true,
            "deleted": true
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "PROD_COPYRIGHT",
            "instructionLong": "<p>TX COPYRIGHT* for all languages except DE, EN, ES, FR, IT, JA, PT, ZH (SAP_BASIS only) 1. These objects need to called up directly as the object type is not relevant for most of the languages. 2. Go to SE63 3. Enter TX 4. Enter COPYRIGHT*, press F4 5. Translate all listed objects</p>",
            "isTemplate": true,
            "deleted": true
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "SAP International Trade Management: PDF Translation",
            "instructionLong": "<p>PDF under&nbsp;SAP International Trade Management umbrella are translated into much more languages than for other products. So please always check the statistics, even if you normally do not translate PDFs.</p>\n<p>There are special rules concerning translation- relevance, templates and source languages. Please refer to the following list: <a href=\"https://eur-lex.europa.eu/\">https://eur-lex.europa.eu/</a></p>\n<p>- Translation-relevance: If PDFs are marked in black in this list, they have to be translated into the respective target language if they appear in your worklist. If the template is NOT on this list, the PDF must NOT be translated, even if it appears in your worklist! <br>- Templates: All PDFs marked in red in this list have to be translated according to the template! So please consider that you have to use the template for this translation, there is no \"free\" translation allowed! <br>- Source language: Some languages have to check the PDFs from a different source language than usual.</p>\n<p>Please pay attention whether your source language is DE or EN.</p>\n<p>Not Translation-Relevant:&nbsp;<br>Irrelevant Tables: The following tables are only relevant for translation into EN! From GTS 7.1 SP05 on, they may appear again in the worklist, but please do not translate them into any other language except EN! <br>/SAPSLL/CUCAART Abgabenarten - Bezeichnung <br>/SAPSLL/CUCAFAT Beantragte Beg&uuml;nstigung - Bezeichnung <br>/SAPSLL/CUCAGGT Abgabengruppe Steuerbescheid - Bezeichnung <br>/SAPSLL/CUCAPRT Zusatzverfahren - Bezeichnung <br>/SAPSLL/CUCBMST Bemessungsma&szlig;stab Steuerbescheid - Bez. <br>/SAPSLL/CUCCPGT Containerstatus <br>/SAPSLL/CUCDADT Definition Abgabenarten - Texttabelle <br>/SAPSLL/CUCDCT Art der Anmeldung f&uuml;r Global Trade Srv. - Bezeichnung <br>/SAPSLL/CUCFDPT Packst&uuml;ckarten - Bezeichnung <br>/SAPSLL/CUCINDT Kennzeichen Zollabwicklung <br>/SAPSLL/CUCMEST Meldungscodes - Bezeichnungen <br>/SAPSLL/CUCMOTT Art des Bef&ouml;rderungsmittels - Bezeichnung <br>/SAPSLL/CUCMTRT Verkehrszweig <br>/SAPSLL/CUCNGAT Warenkreis - Bezeichnung <br>/SAPSLL/CUCPATT Vorpapierarten Bezeichnung <br>/SAPSLL/CUCPOPT Ausstellende Beh&ouml;rde Bezeichnung <br>/SAPSLL/CUCPQUT Qualifikator der Unterlage - Bezeichnung <br>/SAPSLL/CUCPROT Zollrechtliche Bestimmung Bezeichnung <br>/SAPSLL/CUCPSTT Status einer Unterlage Bezeichnung <br>/SAPSLL/CUCPTYT Packst&uuml;ckarten - Bezeichnung <br>/SAPSLL/CUCPYTT Zahlungsarten - Bezeichnungen <br>/SAPSLL/CUCREST Kontrollergebnis Zoll - Bezeichnung <br>/SAPSLL/CUCSLTT Verschlu&szlig;arten - Bezeichnung <br>/SAPSLL/CUCSTAT Zollrechtlicher Status der Ware - Bezeichnung <br>/SAPSLL/CUCSTT Zollrechtlicher Status - Bezeichnung <br>/SAPSLL/CUCSUST Aufschubarten - Bezeichnung <br>/SAPSLL/CUCVAT Anmeldeart - Bezeichnung <br>/SAPSLL/CUCZAFT Zahlungsaufforderung f&uuml;r Steuerbescheid - Bezeichnung <br>/SAPSLL/LEGBTT Zollgesch&auml;ftsarten - Bezeichnung <br>/SAPSLL/LEGEPT Ausfuhrarten Bezeichnung <br>/SAPSLL/LEGSLTT Sitz des Einf&uuml;hrers - Bezeichnung <br>/SAPSLL/LEGSSTT Statistikstatus - Bezeichnung <br>/SAPSLL/TLEACMT Nachrichten zur Aktivit&auml;t <br>/SAPSLL/TLEPAFT Aktivit&auml;tenfolge f&uuml;r Global Trade Srv. - Bezeichnung <br>/SAPSLL/TLEPRAT Prozessaktivit&auml;ten f&uuml;r Global Trade Services <br>/SAPSLL/TLEPRT Prozesse f&uuml;r Global Trade Services - Bezeichnung <br>/SAPSLL/TLEPST Prozessschema f&uuml;r Global Trade Services - Bezeichnung Irrelevant</p>\n<p>TLGS: <br>/SAPSLL/PF_US_7525V <br>/SAPSLL/PF_US_CF3461 <br>/SAPSLL/PF_US_CF7501 <br>/SAPSLL/PF_US_CF7533 <br>/SAPSLL/PF_US_COM_IN <br>/SAPSLL/PF_US_COO <br>/SAPSLL/PF_US_SLI <br>/SAPSLL/PF_CA_CCCF <br>/SAPSLL/PF_NAFTA_VD_1 <br>/SAPSLL/PF_DE_CTAX /SAPSLL/PF_DE_CUSTST <br>/SAPSLL/PF_NAFTA_CA_COO;</p>\n<p>ATTENTION: Relevant for FR,ES <br>/SAPSLL/PF_NAFTA_COO;</p>\n<p>ATTENTION: Relevant for FR,ES <br>/SAPSLL/PF_NAFTA_MX_COO;</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "SAP International Trade Management: PDF Translation",
            "instructionLong": "<p>PDF under&nbsp;SAP International Trade Management umbrella are translated into much more languages than for other products. So please always check the statistics, even if you normally do not translate PDFs.</p>\n<p>There are special rules concerning translation- relevance, templates and source languages. Please refer to the following list: <a href=\"https://eur-lex.europa.eu/\">https://eur-lex.europa.eu/</a></p>\n<p>- Translation-relevance: If PDFs are marked in black in this list, they have to be translated into the respective target language if they appear in your worklist. If the template is NOT on this list, the PDF must NOT be translated, even if it appears in your worklist! <br>- Templates: All PDFs marked in red in this list have to be translated according to the template! So please consider that you have to use the template for this translation, there is no \"free\" translation allowed! <br>- Source language: Some languages have to check the PDFs from a different source language than usual.</p>\n<p>Please pay attention whether your source language is DE or EN.</p>\n<p>Not Translation-Relevant:&nbsp;<br>Irrelevant Tables: The following tables are only relevant for translation into EN! From GTS 7.1 SP05 on, they may appear again in the worklist, but please do not translate them into any other language except EN! <br>/SAPSLL/CUCAART Abgabenarten - Bezeichnung <br>/SAPSLL/CUCAFAT Beantragte Beg&uuml;nstigung - Bezeichnung <br>/SAPSLL/CUCAGGT Abgabengruppe Steuerbescheid - Bezeichnung <br>/SAPSLL/CUCAPRT Zusatzverfahren - Bezeichnung <br>/SAPSLL/CUCBMST Bemessungsma&szlig;stab Steuerbescheid - Bez. <br>/SAPSLL/CUCCPGT Containerstatus <br>/SAPSLL/CUCDADT Definition Abgabenarten - Texttabelle <br>/SAPSLL/CUCDCT Art der Anmeldung f&uuml;r Global Trade Srv. - Bezeichnung <br>/SAPSLL/CUCFDPT Packst&uuml;ckarten - Bezeichnung <br>/SAPSLL/CUCINDT Kennzeichen Zollabwicklung <br>/SAPSLL/CUCMEST Meldungscodes - Bezeichnungen <br>/SAPSLL/CUCMOTT Art des Bef&ouml;rderungsmittels - Bezeichnung <br>/SAPSLL/CUCMTRT Verkehrszweig <br>/SAPSLL/CUCNGAT Warenkreis - Bezeichnung <br>/SAPSLL/CUCPATT Vorpapierarten Bezeichnung <br>/SAPSLL/CUCPOPT Ausstellende Beh&ouml;rde Bezeichnung <br>/SAPSLL/CUCPQUT Qualifikator der Unterlage - Bezeichnung <br>/SAPSLL/CUCPROT Zollrechtliche Bestimmung Bezeichnung <br>/SAPSLL/CUCPSTT Status einer Unterlage Bezeichnung <br>/SAPSLL/CUCPTYT Packst&uuml;ckarten - Bezeichnung <br>/SAPSLL/CUCPYTT Zahlungsarten - Bezeichnungen <br>/SAPSLL/CUCREST Kontrollergebnis Zoll - Bezeichnung <br>/SAPSLL/CUCSLTT Verschlu&szlig;arten - Bezeichnung <br>/SAPSLL/CUCSTAT Zollrechtlicher Status der Ware - Bezeichnung <br>/SAPSLL/CUCSTT Zollrechtlicher Status - Bezeichnung <br>/SAPSLL/CUCSUST Aufschubarten - Bezeichnung <br>/SAPSLL/CUCVAT Anmeldeart - Bezeichnung <br>/SAPSLL/CUCZAFT Zahlungsaufforderung f&uuml;r Steuerbescheid - Bezeichnung <br>/SAPSLL/LEGBTT Zollgesch&auml;ftsarten - Bezeichnung <br>/SAPSLL/LEGEPT Ausfuhrarten Bezeichnung <br>/SAPSLL/LEGSLTT Sitz des Einf&uuml;hrers - Bezeichnung <br>/SAPSLL/LEGSSTT Statistikstatus - Bezeichnung <br>/SAPSLL/TLEACMT Nachrichten zur Aktivit&auml;t <br>/SAPSLL/TLEPAFT Aktivit&auml;tenfolge f&uuml;r Global Trade Srv. - Bezeichnung <br>/SAPSLL/TLEPRAT Prozessaktivit&auml;ten f&uuml;r Global Trade Services <br>/SAPSLL/TLEPRT Prozesse f&uuml;r Global Trade Services - Bezeichnung <br>/SAPSLL/TLEPST Prozessschema f&uuml;r Global Trade Services - Bezeichnung Irrelevant</p>\n<p>TLGS: <br>/SAPSLL/PF_US_7525V <br>/SAPSLL/PF_US_CF3461 <br>/SAPSLL/PF_US_CF7501 <br>/SAPSLL/PF_US_CF7533 <br>/SAPSLL/PF_US_COM_IN <br>/SAPSLL/PF_US_COO <br>/SAPSLL/PF_US_SLI <br>/SAPSLL/PF_CA_CCCF <br>/SAPSLL/PF_NAFTA_VD_1 <br>/SAPSLL/PF_DE_CTAX /SAPSLL/PF_DE_CUSTST <br>/SAPSLL/PF_NAFTA_CA_COO;</p>\n<p>ATTENTION: Relevant for FR,ES <br>/SAPSLL/PF_NAFTA_COO;</p>\n<p>ATTENTION: Relevant for FR,ES <br>/SAPSLL/PF_NAFTA_MX_COO;</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Translating/Previewing PDF-based Forms",
            "instructionLong": "<p>Instructions on how to translate and preview PDF-based forms is available here:&nbsp; <a href=\"https://translation.sap.com/content/dam/sls/en_us/Tools/SystemTranslation/KeyFunctions/SE63_Form_translation.pdf\" target=\"_blank\" rel=\"noopener\">Translating Forms</a></p>\n<p>&nbsp;</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Translating/Previewing PDF-based Forms",
            "instructionLong": "<p>Instructions on how to translate and preview PDF-based forms is available here:&nbsp; <a href=\"https://translation.sap.com/content/dam/sls/en_us/Tools/SystemTranslation/KeyFunctions/SE63_Form_translation.pdf\" target=\"_blank\" rel=\"noopener\">Translating Forms</a></p>\n<p>&nbsp;</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "SOLITT Environment",
            "instructionLong": "<p>Here you find the <strong>SOLITT documentation </strong>for all scenarios: <a href=\"https://translation.sap.com/product-translation/system-translation.html?anchorId=section_1646882881#section_1646882881\">SOLITT</a></p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt ; color: black\">I</span><span style=\"font-size: 11.0pt ; color: black\">NSTRUCTIONS for Non-ABAP projects in B0X</span></strong></p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt ; color: black\">Handling of Special Characters in Translation</span></strong></p>\n<ul style=\"margin-top: 0cm ; margin-bottom: 0cm\">\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt\">% (for example: %d, %3.3d, %s and %ld)</span></strong><span style=\"font-size: 11.0pt\"><br>Combinations of a percentage sign with a number or letter usually represent a placeholder. These character combinations might or might not be protected in the file. The position of a placeholder can be changed according to the syntax required in the target language. The placeholders must not be deleted.</span></li>\n</ul>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<ul style=\"margin-top: 0cm ; margin-bottom: 0cm\">\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt\">Format character:</span></strong></li>\n</ul>\n<p style=\"text-indent: 36pt ; margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">Do not modify format characters during translation. Format characters must not be deleted in the translated text.</span></p>\n<p style=\"text-indent: 36pt ; margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">'\\n' new line</span></p>\n<p style=\"text-indent: 36pt ; margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">New line characters represent a new line on the UI.</span></p>\n<p style=\"text-indent: 36pt ; margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">Ensure that the translated line does not exceed the length of the source text significantly (not more than 20% of the source text length).</span></p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<p style=\"text-indent: 36pt ; margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">'\\t' tab</span></p>\n<p style=\"text-indent: 36pt ; margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">The \\t character represents a tab. Keep it in the same location as in the source.</span></p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<ul style=\"margin-top: 0cm ; margin-bottom: 0cm\">\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt\">Hotkey (fastpath) character: '&amp;' and '_'<br></span></strong><span style=\"font-size: 11.0pt\">Please apply the conventions specific for your target language.</span></li>\n</ul>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<ul style=\"margin-top: 0cm ; margin-bottom: 0cm\">\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt\">Single straight quotes</span></strong></li>\n</ul>\n<p style=\"text-indent: 36pt ; margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">Deactivate the setting &ldquo;Replace &ldquo;straight quotes&rdquo; with smart quotes.&rdquo; in SDL Trados Studio. </span><u><span style=\"font-size: 11.0pt ; color: #4472c4\"><a href=\"https://translation.sap.com/content/dam/sls/en_us/Tools/SystemTranslation/SOLITT/SOLITT%20for%20non-ABAP.pdf\"><span style=\"color: #4472c4\">See SOLITT for Non-ABAP documentation</span></a></span></u></p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\"><strong><span style=\"font-size: 11pt ; color: black\">I</span><span style=\"font-size: 11pt ; color: black\">NSTRUCTIONS for Non-ABAP projects in <span style=\"font-size: 11.0pt ; font-family: &#34;aptos&#34; , sans-serif ; color: black\">B7A, and BOL</span></span></strong><br><br><br><strong>Handling of Special Characters in Translation</strong></span></p>\n<ul style=\"margin-top: 0cm ; margin-bottom: 0cm\">\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt\">%<br>If a text contains % characters, for example: %d, %3.3d, %s and %ld, these positions cannot be modified or deleted and the sequence cannot be changed.</span></li>\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt\">Format character: '\\n' new line and '\\t' tab<br></span></strong><span style=\"font-size: 11.0pt\">Do not modify format characters during translation. Format characters must remain unchanged in the translated text.</span></li>\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt\">End-of-text character \"</span></strong><span style=\"font-size: 11.0pt\"><br>The end-of-text character \" should not be inserted into the translation because texts are then truncated after this character. Use ' instead.</span></li>\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt\">Fastpath character: '&amp;' and '~'<br></span></strong><span style=\"font-size: 11.0pt\">The character following the '&amp;' character is a fastpath character. If possible, the fastpath character should be specified uniquely. The unambiguity of the fastpath cannot be ensured without a test. If you cannot test the translation, you can ignore the fastpath character.</span></li>\n</ul>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt ; color: black\">Please follow these rules. Special characters must be correct in the translations.</span></strong></p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">Description of objects and where they are used can be found here:</span></p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\"><a href=\"http://service.sap.com/~form/handler?_APP=01100107900000000342&amp;_EVENT=DISPL_TXT&amp;_NNUM=150244&amp;\">http://service.sap.com/~form/handler?_APP=01100107900000000342&amp;_EVENT=DISPL_TXT&amp;_NNUM=150244&amp;</a>&nbsp;</span></p>\n<div>&nbsp;</div>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "SOLITT Environment",
            "instructionLong": "<p>Here you find the <strong>SOLITT documentation </strong>for all scenarios: <a href=\"https://translation.sap.com/product-translation/system-translation.html?anchorId=section_1646882881#section_1646882881\">SOLITT</a></p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt ; color: black\">I</span><span style=\"font-size: 11.0pt ; color: black\">NSTRUCTIONS for Non-ABAP projects in B0X</span></strong></p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt ; color: black\">Handling of Special Characters in Translation</span></strong></p>\n<ul style=\"margin-top: 0cm ; margin-bottom: 0cm\">\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt\">% (for example: %d, %3.3d, %s and %ld)</span></strong><span style=\"font-size: 11.0pt\"><br>Combinations of a percentage sign with a number or letter usually represent a placeholder. These character combinations might or might not be protected in the file. The position of a placeholder can be changed according to the syntax required in the target language. The placeholders must not be deleted.</span></li>\n</ul>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<ul style=\"margin-top: 0cm ; margin-bottom: 0cm\">\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt\">Format character:</span></strong></li>\n</ul>\n<p style=\"text-indent: 36pt ; margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">Do not modify format characters during translation. Format characters must not be deleted in the translated text.</span></p>\n<p style=\"text-indent: 36pt ; margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">'\\n' new line</span></p>\n<p style=\"text-indent: 36pt ; margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">New line characters represent a new line on the UI.</span></p>\n<p style=\"text-indent: 36pt ; margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">Ensure that the translated line does not exceed the length of the source text significantly (not more than 20% of the source text length).</span></p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<p style=\"text-indent: 36pt ; margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">'\\t' tab</span></p>\n<p style=\"text-indent: 36pt ; margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">The \\t character represents a tab. Keep it in the same location as in the source.</span></p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<ul style=\"margin-top: 0cm ; margin-bottom: 0cm\">\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt\">Hotkey (fastpath) character: '&amp;' and '_'<br></span></strong><span style=\"font-size: 11.0pt\">Please apply the conventions specific for your target language.</span></li>\n</ul>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<ul style=\"margin-top: 0cm ; margin-bottom: 0cm\">\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt\">Single straight quotes</span></strong></li>\n</ul>\n<p style=\"text-indent: 36pt ; margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">Deactivate the setting &ldquo;Replace &ldquo;straight quotes&rdquo; with smart quotes.&rdquo; in SDL Trados Studio. </span><u><span style=\"font-size: 11.0pt ; color: #4472c4\"><a href=\"https://translation.sap.com/content/dam/sls/en_us/Tools/SystemTranslation/SOLITT/SOLITT%20for%20non-ABAP.pdf\"><span style=\"color: #4472c4\">See SOLITT for Non-ABAP documentation</span></a></span></u></p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\"><strong><span style=\"font-size: 11pt ; color: black\">I</span><span style=\"font-size: 11pt ; color: black\">NSTRUCTIONS for Non-ABAP projects in <span style=\"font-size: 11.0pt ; font-family: &#34;aptos&#34; , sans-serif ; color: black\">B7A, and BOL</span></span></strong><br><br><br><strong>Handling of Special Characters in Translation</strong></span></p>\n<ul style=\"margin-top: 0cm ; margin-bottom: 0cm\">\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt\">%<br>If a text contains % characters, for example: %d, %3.3d, %s and %ld, these positions cannot be modified or deleted and the sequence cannot be changed.</span></li>\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt\">Format character: '\\n' new line and '\\t' tab<br></span></strong><span style=\"font-size: 11.0pt\">Do not modify format characters during translation. Format characters must remain unchanged in the translated text.</span></li>\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt\">End-of-text character \"</span></strong><span style=\"font-size: 11.0pt\"><br>The end-of-text character \" should not be inserted into the translation because texts are then truncated after this character. Use ' instead.</span></li>\n<li style=\"color: black ; margin-top: 0cm ; margin-right: 0cm ; margin-bottom: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt\">Fastpath character: '&amp;' and '~'<br></span></strong><span style=\"font-size: 11.0pt\">The character following the '&amp;' character is a fastpath character. If possible, the fastpath character should be specified uniquely. The unambiguity of the fastpath cannot be ensured without a test. If you cannot test the translation, you can ignore the fastpath character.</span></li>\n</ul>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><strong><span style=\"font-size: 11.0pt ; color: black\">Please follow these rules. Special characters must be correct in the translations.</span></strong></p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\">Description of objects and where they are used can be found here:</span></p>\n<p style=\"margin: 0cm ; font-size: 12pt ; font-family: &#34;aptos&#34; , sans-serif\"><span style=\"font-size: 11.0pt ; color: black\"><a href=\"http://service.sap.com/~form/handler?_APP=01100107900000000342&amp;_EVENT=DISPL_TXT&amp;_NNUM=150244&amp;\">http://service.sap.com/~form/handler?_APP=01100107900000000342&amp;_EVENT=DISPL_TXT&amp;_NNUM=150244&amp;</a>&nbsp;</span></p>\n<div>&nbsp;</div>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "EHFN* Tables for Business Suite",
            "instructionLong": "<p>Sometimes translators get a shortdump or error message when trying to save a table in the SE63 translation editor.<br /><br /><strong>Error message:</strong> The system tried to insert a data record, even though a data record with the same primary key already exists.<br /><br />The reason for this is that the developer has maintained an index for the table to enforce that each table entry has a unique text. <br />From the translator perspective, this means that it is not possible to save an identical translation for two&nbsp;different source texts within one and the same table.<br /><br />The affected tables generally have a table name starting with EHFN* such as EHFNDC_ACTSUB_T, EHFNDC_CHCOLOR_T or EHFNDC_REQ_OSM_T. <br />The only way to avoid this issue is to make sure to not use the same translation for two different source texts within the table.<br />This issue is documented in the SLS Info Tool (search for EHF) and in note <strong>1789434</strong> and is mainly relevant for ERP translation systems such as CI9, CIL and V7T.</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "EHFN* Tables for Business Suite",
            "instructionLong": "<p>Sometimes translators get a shortdump or error message when trying to save a table in the SE63 translation editor.<br /><br /><strong>Error message:</strong> The system tried to insert a data record, even though a data record with the same primary key already exists.<br /><br />The reason for this is that the developer has maintained an index for the table to enforce that each table entry has a unique text. <br />From the translator perspective, this means that it is not possible to save an identical translation for two&nbsp;different source texts within one and the same table.<br /><br />The affected tables generally have a table name starting with EHFN* such as EHFNDC_ACTSUB_T, EHFNDC_CHCOLOR_T or EHFNDC_REQ_OSM_T. <br />The only way to avoid this issue is to make sure to not use the same translation for two different source texts within the table.<br />This issue is documented in the SLS Info Tool (search for EHF) and in note <strong>1789434</strong> and is mainly relevant for ERP translation systems such as CI9, CIL and V7T.</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Term and Glossary Translation in STM (enUS and deDE only)",
            "instructionLong": "<p>Please ensure you translate any terms available in your term worklist.</p>\n<p>If you need information about the terminology translation process or authorizations, please see&nbsp;<a href=\"https://translation.sap.com/terminology.html\" target=\"_blank\" rel=\"noopener noreferrer\">https://translation.sap.com/terminology.html</a>.</p>\n<p>Once the terms have been translated and released, the glossary entries will also become available for translation on the Virtual Translation Portal in system STM/000. Allow one day after term translation for an evaluation to take place.&nbsp;</p>\n<p>Collection naming convention: ASAPTERM_COMPONENT_SUBCOMPONENT</p>\n<p>Example:<br />Component: SLL-IPP <br />Collection: ASAPTERM_SLL_IPP</p>\n<p>Relevant collection(s) will be assigned to your ASSIGN user.</p>\n<p>Volume: TMAS should be available the day after you complete term translation</p>\n<p>In case you are not familiar with the process of translating glossary entries, please see the following video:&nbsp;<br /><a href=\"https://video.sap.com/embed/secure/iframe/entryId/1_9jeay4sp/uiConfId/30317401/pbc/77686681\" target=\"_blank\" rel=\"noopener noreferrer\">https://video.sap.com/embed/secure/iframe/entryId/1_9jeay4sp/uiConfId/30317401/pbc/77686681</a></p>\n<p>If you have any questions, please contact the&nbsp;PM.</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Term and Glossary Translation in STM (enUS and deDE only)",
            "instructionLong": "<p>Please ensure you translate any terms available in your term worklist.</p>\n<p>If you need information about the terminology translation process or authorizations, please see&nbsp;<a href=\"https://translation.sap.com/terminology.html\" target=\"_blank\" rel=\"noopener noreferrer\">https://translation.sap.com/terminology.html</a>.</p>\n<p>Once the terms have been translated and released, the glossary entries will also become available for translation on the Virtual Translation Portal in system STM/000. Allow one day after term translation for an evaluation to take place.&nbsp;</p>\n<p>Collection naming convention: ASAPTERM_COMPONENT_SUBCOMPONENT</p>\n<p>Example:<br />Component: SLL-IPP <br />Collection: ASAPTERM_SLL_IPP</p>\n<p>Relevant collection(s) will be assigned to your ASSIGN user.</p>\n<p>Volume: TMAS should be available the day after you complete term translation</p>\n<p>In case you are not familiar with the process of translating glossary entries, please see the following video:&nbsp;<br /><a href=\"https://video.sap.com/embed/secure/iframe/entryId/1_9jeay4sp/uiConfId/30317401/pbc/77686681\" target=\"_blank\" rel=\"noopener noreferrer\">https://video.sap.com/embed/secure/iframe/entryId/1_9jeay4sp/uiConfId/30317401/pbc/77686681</a></p>\n<p>If you have any questions, please contact the&nbsp;PM.</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "One China Policy for Product Translation",
            "instructionLong": "<p>In accordance with SAP&rsquo;s recent guidance on handling languages in products under the &ldquo;One China&rdquo; policy, the following applies: &ldquo;Taiwan&rdquo;, &ldquo;Hong Kong&rdquo; and &ldquo;Macao&rdquo; are to be written with their simple geographical names without the addition of &ldquo;China&rdquo;. This applies to all target languages in SAP product UI and Documentation.</p>\n<p>As before, please ensure that your translation follows the source. Only adjust the translation of an object containing these terms if the original language (either English or German) has been changed. Changes to the source will show up automatically in the worklists and/or in the assets that are passed through the usual channels for translation. If the source texts contain any new texts <u>with</u> &ldquo;, China&rdquo; following &ldquo;Taiwan&rdquo;, &ldquo;Hong Kong&rdquo; and &ldquo;Macao&rdquo;, please report this via Query Management.</p>\n<p>Please ensure that this guidance is reflected in your target languages.</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">&nbsp;</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "One China Policy for Product Translation",
            "instructionLong": "<p>In accordance with SAP&rsquo;s recent guidance on handling languages in products under the &ldquo;One China&rdquo; policy, the following applies: &ldquo;Taiwan&rdquo;, &ldquo;Hong Kong&rdquo; and &ldquo;Macao&rdquo; are to be written with their simple geographical names without the addition of &ldquo;China&rdquo;. This applies to all target languages in SAP product UI and Documentation.</p>\n<p>As before, please ensure that your translation follows the source. Only adjust the translation of an object containing these terms if the original language (either English or German) has been changed. Changes to the source will show up automatically in the worklists and/or in the assets that are passed through the usual channels for translation. If the source texts contain any new texts <u>with</u> &ldquo;, China&rdquo; following &ldquo;Taiwan&rdquo;, &ldquo;Hong Kong&rdquo; and &ldquo;Macao&rdquo;, please report this via Query Management.</p>\n<p>Please ensure that this guidance is reflected in your target languages.</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">&nbsp;</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Smart Forms: Object type SSF - Translation instructions",
            "instructionLong": "<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">Relevant for all languages that have not translated smart forms (object type SSF) before:</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">This object type has now been activated for all languages, so it is new for some languages. &nbsp;</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">SSF objects are not SOLITT-enabled, but have to be translated in the SAPscript long text editor. Costs have to be billed time-based.</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">You can find more information on how to translate smart forms and how to work with the SAPscript long text editor here: <a href=\"https://translation.sap.com/content/dam/sls/en_us/Tools/SystemTranslation/KeyFunctions/SE63_Form_translation.pdf\" target=\"_blank\" rel=\"noopener\">Translating Forms</a>&nbsp;</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">&nbsp;Smart forms are print templates. They are called by an ABAP program so that spools are generated, ready to be printed.</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">More technical information on the use of smart forms can be found here:&nbsp;<a href=\"https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e0ef07e1f76b4370b1baa502eace5ece/4e50b68d95e14dd2e10000000a42189b.html?locale=en-US\">https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e0ef07e1f76b4370b1baa502eace5ece/4e50b68d95e14dd2e10000000a42189b.html?locale=en-US</a></p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">&nbsp;</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Smart Forms: Object type SSF - Translation instructions",
            "instructionLong": "<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">Relevant for all languages that have not translated smart forms (object type SSF) before:</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">This object type has now been activated for all languages, so it is new for some languages. &nbsp;</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">SSF objects are not SOLITT-enabled, but have to be translated in the SAPscript long text editor. Costs have to be billed time-based.</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">You can find more information on how to translate smart forms and how to work with the SAPscript long text editor here: <a href=\"https://translation.sap.com/content/dam/sls/en_us/Tools/SystemTranslation/KeyFunctions/SE63_Form_translation.pdf\" target=\"_blank\" rel=\"noopener\">Translating Forms</a>&nbsp;</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">&nbsp;Smart forms are print templates. They are called by an ABAP program so that spools are generated, ready to be printed.</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">More technical information on the use of smart forms can be found here:&nbsp;<a href=\"https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e0ef07e1f76b4370b1baa502eace5ece/4e50b68d95e14dd2e10000000a42189b.html?locale=en-US\">https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/e0ef07e1f76b4370b1baa502eace5ece/4e50b68d95e14dd2e10000000a42189b.html?locale=en-US</a></p>\n<p style=\"margin: 0cm 0cm 0.0001pt ; font-size: 11pt ; font-family: &#34;calibri&#34; , sans-serif\">&nbsp;</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Query Management Instructions",
            "instructionLong": "<p>Queries are managed in the <a title=\"Query Management\" href=\"https://qm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/queries\" target=\"_blank\" rel=\"noopener\">Query Management</a> tool for this project.</p>\n<p>Access Query Management (<a href=\"https://help.sap.com/docs/help/2ef426021322412db3ff04e071be3922/093cf5c2206b4a3d914e7fff549aef0d.html?locale=en-US\" target=\"_blank\" rel=\"noopener\">Accessing Query Management</a>) to submit your queries by following these instructions:&nbsp;<a title=\"Creating Queries | SAP Help Portal\" href=\"https://help.sap.com/docs/help/2ef426021322412db3ff04e071be3922/de7e6c63954e404cb3a6eb27866bba3c.html\" target=\"_blank\" rel=\"noopener\">Creating Queries | SAP Help Portal</a>.&nbsp;</p>\n<p>Open the&nbsp;<strong>in-app help</strong>&nbsp;within the application by clicking the question mark in the top right of your screen. <br><br>Please refer to the <a href=\"https://translation.sap.com/content/dam/sls/en_us/Tools/querymanagement/00_Query_Management_Instructions_for_Translators_202412.pdf\" target=\"_blank\" rel=\"noopener\">instructions for translators</a> with our expectations of managing queries.</p>\n<p>For an overview of the features and functions of the Query Management application, see the documentation: <a title=\"Query Management | SAP Help Portal\" href=\"https://help.sap.com/docs/help/2ef426021322412db3ff04e071be3922/b18e6333d9ab41b796c41f9222dbe247.html\" target=\"_blank\" rel=\"noopener\">Query Management | SAP Help Portal</a>.</p>\n<p>For <strong>XTM-specific information about how to copy metadata from XTM to Query Management</strong>, see this topic in the XTM Cloud User Guide: Product UI and UA: <a href=\"https://help.sap.com/docs/help/f25b7b08e921451783352a5469bd1505/275a1f49363f4a5c8041d7e63dabc7db.html\" target=\"_blank\" rel=\"noopener\">Copying Metadata to Queries</a></p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Query Management Instructions",
            "instructionLong": "<p>Queries are managed in the <a title=\"Query Management\" href=\"https://qm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/queries\" target=\"_blank\" rel=\"noopener\">Query Management</a> tool for this project.</p>\n<p>Access Query Management (<a href=\"https://help.sap.com/docs/help/2ef426021322412db3ff04e071be3922/093cf5c2206b4a3d914e7fff549aef0d.html?locale=en-US\" target=\"_blank\" rel=\"noopener\">Accessing Query Management</a>) to submit your queries by following these instructions:&nbsp;<a title=\"Creating Queries | SAP Help Portal\" href=\"https://help.sap.com/docs/help/2ef426021322412db3ff04e071be3922/de7e6c63954e404cb3a6eb27866bba3c.html\" target=\"_blank\" rel=\"noopener\">Creating Queries | SAP Help Portal</a>.&nbsp;</p>\n<p>Open the&nbsp;<strong>in-app help</strong>&nbsp;within the application by clicking the question mark in the top right of your screen. <br><br>Please refer to the <a href=\"https://translation.sap.com/content/dam/sls/en_us/Tools/querymanagement/00_Query_Management_Instructions_for_Translators_202412.pdf\" target=\"_blank\" rel=\"noopener\">instructions for translators</a> with our expectations of managing queries.</p>\n<p>For an overview of the features and functions of the Query Management application, see the documentation: <a title=\"Query Management | SAP Help Portal\" href=\"https://help.sap.com/docs/help/2ef426021322412db3ff04e071be3922/b18e6333d9ab41b796c41f9222dbe247.html\" target=\"_blank\" rel=\"noopener\">Query Management | SAP Help Portal</a>.</p>\n<p>For <strong>XTM-specific information about how to copy metadata from XTM to Query Management</strong>, see this topic in the XTM Cloud User Guide: Product UI and UA: <a href=\"https://help.sap.com/docs/help/f25b7b08e921451783352a5469bd1505/275a1f49363f4a5c8041d7e63dabc7db.html\" target=\"_blank\" rel=\"noopener\">Copying Metadata to Queries</a></p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "ABAP Cloud Editor",
            "instructionLong": "<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">Dear supplier,</p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">please&nbsp;<strong>use the ABAP cloud editor for translation of the short texts</strong>:</p>\n<ul style=\"margin-top: 0cm ; margin-bottom: 0cm\">\n<li style=\"margin-top: 6pt ; margin-right: 0cm ; margin-bottom: 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">Please access the following URL:&nbsp;<a title=\"https://abapeditor.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/\" href=\"https://abapeditor.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/\" target=\"_blank\" rel=\"noopener\">https://abapeditor.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/</a>&nbsp;.<span style=\"font-family: &#34;arial&#34; , sans-serif\">​</span><span style=\"font-family: &#34;arial&#34; , sans-serif\">​</span></li>\n<li style=\"margin-top: 6pt ; margin-right: 0cm ; margin-bottom: 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">If requested, enter your sap email address&nbsp;(Cxxxxxxx@sap.com) and finish the login&nbsp;process with your SAP password and&nbsp;authorization code in case you have enabled&nbsp;Multi-Factor Authentication<span style=\"font-family: &#34;arial&#34; , sans-serif\">​</span><span style=\"font-family: &#34;arial&#34; , sans-serif\">​</span></li>\n<li style=\"margin-top: 6pt ; margin-right: 0cm ; margin-bottom: 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">Once you have logged in, you will be&nbsp;redirected to the&nbsp;My Assignments UI</li>\n</ul>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\"><strong>Documentation: </strong><a href=\"https://help.sap.com/docs/help/371687c9e9eb4b2c9df3804c992d61a0/d8bd61a71b0d4dbe8ff74f8ba2d83e02.html?locale=en-US\">https://help.sap.com/docs/help/371687c9e9eb4b2c9df3804c992d61a0/d8bd61a71b0d4dbe8ff74f8ba2d83e02.html?locale=en-US</a></p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\"><strong>Long texts </strong>cannot yet be translated in the ABAP Cloud Editor but need to be translated in the known way. See<span style=\"font-size: 10.0pt ; line-height: 130% ; font-family: &#34;72 brand&#34; , sans-serif\">&nbsp;</span><span style=\"font-size: 10.0pt ; line-height: 130% ; font-family: &#34;72 brand&#34; , sans-serif\"><a href=\"https://translation.sap.com/content/dam/sls/en_us/Tools/SystemTranslation/SOLITT/Translating_with_SOLITT.pdf\">Translating with SOLITT</a>.</span></p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">&nbsp;</p>\n<p>&nbsp;</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "ABAP Cloud Editor",
            "instructionLong": "<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">Dear supplier,</p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">please&nbsp;<strong>use the ABAP cloud editor for translation of the short texts</strong>:</p>\n<ul style=\"margin-top: 0cm ; margin-bottom: 0cm\">\n<li style=\"margin-top: 6pt ; margin-right: 0cm ; margin-bottom: 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">Please access the following URL:&nbsp;<a title=\"https://abapeditor.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/\" href=\"https://abapeditor.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/\" target=\"_blank\" rel=\"noopener\">https://abapeditor.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/</a>&nbsp;.<span style=\"font-family: &#34;arial&#34; , sans-serif\">​</span><span style=\"font-family: &#34;arial&#34; , sans-serif\">​</span></li>\n<li style=\"margin-top: 6pt ; margin-right: 0cm ; margin-bottom: 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">If requested, enter your sap email address&nbsp;(Cxxxxxxx@sap.com) and finish the login&nbsp;process with your SAP password and&nbsp;authorization code in case you have enabled&nbsp;Multi-Factor Authentication<span style=\"font-family: &#34;arial&#34; , sans-serif\">​</span><span style=\"font-family: &#34;arial&#34; , sans-serif\">​</span></li>\n<li style=\"margin-top: 6pt ; margin-right: 0cm ; margin-bottom: 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">Once you have logged in, you will be&nbsp;redirected to the&nbsp;My Assignments UI</li>\n</ul>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\"><strong>Documentation: </strong><a href=\"https://help.sap.com/docs/help/371687c9e9eb4b2c9df3804c992d61a0/d8bd61a71b0d4dbe8ff74f8ba2d83e02.html?locale=en-US\">https://help.sap.com/docs/help/371687c9e9eb4b2c9df3804c992d61a0/d8bd61a71b0d4dbe8ff74f8ba2d83e02.html?locale=en-US</a></p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\"><strong>Long texts </strong>cannot yet be translated in the ABAP Cloud Editor but need to be translated in the known way. See<span style=\"font-size: 10.0pt ; line-height: 130% ; font-family: &#34;72 brand&#34; , sans-serif\">&nbsp;</span><span style=\"font-size: 10.0pt ; line-height: 130% ; font-family: &#34;72 brand&#34; , sans-serif\"><a href=\"https://translation.sap.com/content/dam/sls/en_us/Tools/SystemTranslation/SOLITT/Translating_with_SOLITT.pdf\">Translating with SOLITT</a>.</span></p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">&nbsp;</p>\n<p>&nbsp;</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Wrong Language Usage (WLU) in Short Texts",
            "instructionLong": "https://translation.sap.com/content/dam/sls/en_us/Tools/SystemTranslation/KeyFunctions/SE63_Dealing_With_WLU.pdf",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Wrong Language Usage (WLU) in Short Texts",
            "instructionLong": "https://translation.sap.com/content/dam/sls/en_us/Tools/SystemTranslation/KeyFunctions/SE63_Dealing_With_WLU.pdf",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Inclusive Language at SAP",
            "instructionLong": "<p>SAP guidelines for inclusive language offer recommendations for crafting language that supports a culture of diversity and inclusion.</p>\n<p><a href=\"https://help.sap.com/docs/TERMINOLOGY/25cbeaaad3c24eba8ea10b579ce81aa1/83a23df24013403ea4c1fdd0107cc0fd.html?locale=en-US\">https://help.sap.com/docs/TERMINOLOGY/25cbeaaad3c24eba8ea10b579ce81aa1/83a23df24013403ea4c1fdd0107cc0fd.html?locale=en-US</a></p>\n<p><span lang=\"EN-US\">If the source texts contain any texts listed on above site</span><span lang=\"EN-US\">, please report this via</span><span lang=\"EN-US\">&nbsp;</span><span lang=\"EN-US\">Query Management: <a title=\"https://qm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/queries\" href=\"https://qm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/queries\" target=\"_blank\" rel=\"noopener\">https://qm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/queries</a>&nbsp;</span></p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Inclusive Language at SAP",
            "instructionLong": "<p>SAP guidelines for inclusive language offer recommendations for crafting language that supports a culture of diversity and inclusion.</p>\n<p><a href=\"https://help.sap.com/docs/TERMINOLOGY/25cbeaaad3c24eba8ea10b579ce81aa1/83a23df24013403ea4c1fdd0107cc0fd.html?locale=en-US\">https://help.sap.com/docs/TERMINOLOGY/25cbeaaad3c24eba8ea10b579ce81aa1/83a23df24013403ea4c1fdd0107cc0fd.html?locale=en-US</a></p>\n<p><span lang=\"EN-US\">If the source texts contain any texts listed on above site</span><span lang=\"EN-US\">, please report this via</span><span lang=\"EN-US\">&nbsp;</span><span lang=\"EN-US\">Query Management: <a title=\"https://qm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/queries\" href=\"https://qm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/queries\" target=\"_blank\" rel=\"noopener\">https://qm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/queries</a>&nbsp;</span></p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Product Translation Documentation on LX Support Portal",
            "instructionLong": "<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">For general information about Product translation, please refer to&nbsp;<a href=\"https://translation.sap.com/product-translation.html\">https://translation.sap.com/product-translation.html </a></p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\"><strong>Important!</strong></p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">Subscribe here <a href=\"https://translation.sap.com/index.html\">https://translation.sap.com/index.html</a>&nbsp;to receive notifications when a document is updated.</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Product Translation Documentation on LX Support Portal",
            "instructionLong": "<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">For general information about Product translation, please refer to&nbsp;<a href=\"https://translation.sap.com/product-translation.html\">https://translation.sap.com/product-translation.html </a></p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">&nbsp;</p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\"><strong>Important!</strong></p>\n<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">Subscribe here <a href=\"https://translation.sap.com/index.html\">https://translation.sap.com/index.html</a>&nbsp;to receive notifications when a document is updated.</p>",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "PROD_SOLITT",
            "instructionLong": "<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">Please refer to <a href=\"https://translation.sap.com/product-translation/system-translation.html?anchorId=section_1646882881#section_1646882881\">SOLITT</a> &nbsp;documentation.</p>",
            "isTemplate": true,
            "deleted": true
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "PROD_SOLITT",
            "instructionLong": "<p style=\"margin: 6pt 0cm 0cm ; line-height: 130% ; font-size: 10pt ; font-family: &#34;72 brand&#34; , sans-serif\">Please refer to <a href=\"https://translation.sap.com/product-translation/system-translation.html?anchorId=section_1646882881#section_1646882881\">SOLITT</a> &nbsp;documentation.</p>",
            "isTemplate": true,
            "deleted": true
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "SAP Terminology Search",
            "instructionLong": "https://lpiprod-term.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/ui/",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "SAP Terminology Search",
            "instructionLong": "https://lpiprod-term.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/ui/",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Edit Distance Calculation (EDC)-Based Billing at SAP",
            "instructionLong": "https://translation.sap.com/content/dam/sls/en_us/Billing/VolumeBasedBilling/TAMO/EDC%20Based%20Billing.pdf",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Edit Distance Calculation (EDC)-Based Billing at SAP",
            "instructionLong": "https://translation.sap.com/content/dam/sls/en_us/Billing/VolumeBasedBilling/TAMO/EDC%20Based%20Billing.pdf",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000002",
            "serviceStep": "TRANSLREGU",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Edit Distance Calculation (EDC)-Based Billing at SAP",
            "instructionLong": "https://translation.sap.com/content/dam/sls/en_us/Billing/VolumeBasedBilling/TAMO/EDC%20Based%20Billing.pdf",
            "isTemplate": true,
            "deleted": false
        },
        {
            "subProjectId": "7854-16",
            "contentId": "000002",
            "serviceStep": "TRANSLFWL",
            "slsLang": "ptBR",
            "lastChangedAt": "2026-02-09T00:05:55.000Z",
            "instructionShort": "Edit Distance Calculation (EDC)-Based Billing at SAP",
            "instructionLong": "https://translation.sap.com/content/dam/sls/en_us/Billing/VolumeBasedBilling/TAMO/EDC%20Based%20Billing.pdf",
            "isTemplate": true,
            "deleted": false
        }
    ]
}