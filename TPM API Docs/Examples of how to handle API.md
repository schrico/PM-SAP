# Examples of how to handle API

On every example I will not repeat what I have already clarified in the last. If you have any questions ask.

Everything inside «» is a DB variable.

all Examples are from GET “https://lpxtpmsub-tpm.ingress.prod.lp.shoot.live.k8s-hana.ondemand.com/v1/suppliers/projects/{projectId}/subprojects/{subProjectId}”

## Example 1 :

```json

{
    "subProjectId": "8235-90",
    "subProjectName": "DOC_20260128",
    "terminologyKey": [
        "000546",
        "000655"
    ],
    "environment": [
        {
            "contentId": "000001",
            "environmentName": "SAP Translation System - DNW / 000 / SAP",
            "toolType": "SAP",
            "toolTypeDescription": "SAP Translation System",
            "lxeProject": [
                "006716 - DWC 2026.04 - In-App Help"
            ],
            "translationArea": [
                "600000 - Ixiasoft - PRODUCTION"
            ],
            "worklist": [
                "0001 - Ixiasoft Production"
            ],
            "is_xtm": false,
            "content_name": "SAP Datasphere",
            "external_project_id": "0000000000"
        }
    ],
    "subProjectSteps": [
        {
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "stepText": "Translate final volume",
            "slsLang": "ptPT",
            "sourceLang": "enUS",
            "tGroup": "TE",
            "startDate": "2026-02-06T00:00:00.000Z",
            "endDate": "2026-02-06T14:00:00.000Z",
            "hasInstructions": true,
            "stepStatusId": "350",
            "stepStatusDescription": "Billing in progress"
        },
        {
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "stepText": "Translate current volume",
            "slsLang": "ptPT",
            "sourceLang": "enUS",
            "tGroup": "TE",
            "startDate": "2026-01-28T00:00:00.000Z",
            "endDate": "2026-02-06T00:00:00.000Z",
            "hasInstructions": true,
            "stepStatusId": "351",
            "stepStatusDescription": "Billing in progress"
        }
    ]
}
```

### Relevant info:

- «system» - In this example and in every single one that has toolType as SAP I want the system to be saved as the charachters after ”SAP Translation System - ” and before the next “ “ , in this case is “DNW” (that is always in environmentName);
- «terminologyKey» - save all numbers;
- «lxeProject» - save just the first number(if there is more than one save all), in this example is 006716;
- «translationArea» - save just the first number, in this example is “600000”(if there is more than one save all);
- «worklist» - save just the first number, in this example is “0001”;
- I want to check the serviceStep when it has TRANSLFWL(final) and TRANSLREGU(inicial), they are supposed to be saved as the same project as long as they have the same contentId.
    - «initial_deadline» - is filled when there is a TRANSLREGU and is the endDate;
    - «final_deadline» - is filled when there is a TRANSLFWL and is the endDate;
    - «language_out» - save what is in slsLang (from TRANSLFWL);
    - «language_in» - save what is in sourceLang (from TRANSLFWL);

## Example 2 :

```json
{
    "subProjectId": "8250-31",
    "subProjectName": "Rigi_LT_SCT_2026Q1",
    "environment": [
        {
            "contentId": "000001",
            "environmentName": "Rigi",
            "toolType": "RIGI",
            "toolTypeDescription": "Rigi",
            "is_xtm": false,
            "content_name": "Rigi_LT_SCT_2026Q1",
            "external_project_id": "0000000000"
        }
    ],
    "subProjectSteps": [
        {
            "contentId": "000001",
            "serviceStep": "TEST_REV4",
            "stepText": "Test, correct and report result",
            "slsLang": "ptBR",
            "sourceLang": "enUS",
            "tGroup": "TE",
            "startDate": "2026-02-24T00:00:00.000Z",
            "endDate": "2026-02-27T16:00:00.000Z",
            "hasInstructions": true,
            "subProjectFiles": "https://sapext.sharepoint.com/sites/Sol_ext_prod/Shared Documents/TE/8250-31/TEST_REV4/ptBR",
            "volume": [
                {
                    "volumeQuantity": 16.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 16.0,
                    "ceBillUnit": "Hours",
                    "activityText": "Test using Rigi"
                }
            ],
            "stepStatusId": "250",
            "stepStatusDescription": "In Process"
        }
    ]
}
```

### Relevant info:

- If serviceText field from API is “Test, correct and report result”:
    - «system» -  the system to be saved is “LAT”;
    - «instructions» - append toolType to instructions;
- «url» - subProjectFiles;
- «hours» - If volumeUnit is "Hours" add volumeQuantity(if volumeQuantity is 0 use ceBillQuantity);

## Example 3:

```json
{
    "subProjectId": "7785-21",
    "subProjectName": "2026_03",
    "environment": [
        {
            "contentId": "000001",
            "environmentName": "XTM for Product",
            "toolType": "XTM_PM",
            "toolTypeDescription": "XTM for Product",
            "is_xtm": true,
            "content_name": "2026_03",
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
            "startDate": "2026-02-23T00:00:00.000Z",
            "endDate": "2026-02-26T12:00:00.000Z",
            "hasInstructions": true,
            "volume": [
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Hours",
                    "activityText": "Other hourly-based activities (XTM for Product)"
                },
                {
                    "volumeQuantity": 1555.0,
                    "volumeUnit": "Words",
                    "ceBillQuantity": 1555.0,
                    "ceBillUnit": "Words",
                    "activityText": "Translate with XTM"
                }
            ],
            "stepStatusId": "270",
            "stepStatusDescription": "Delivered"
        }
    ]
}
```

### Relevant info:

- «system» - All toolTypes == “XTM_PM” or “XTM” are saved as the system “XTM”;
- «words» - If volumeUnit is "Words" add volumeQuantity(if volumeQuantity is 0 use ceBillQuantity);

## Example 4:

```json
{
    "subProjectId": "8356-53",
    "subProjectName": "2604_Private_Cloud",
    "terminologyKey": [
        "000614"
    ],
    "environment": [
        {
            "contentId": "000001",
            "environmentName": "XTM for Product",
            "toolType": "XTM_PM",
            "toolTypeDescription": "XTM for Product",
            "is_xtm": true,
            "content_name": "2604_Private_Cloud",
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
            "startDate": "2026-03-03T00:00:00.000Z",
            "endDate": "2026-03-05T11:00:00.000Z",
            "hasInstructions": true,
            "volume": [
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Hours",
                    "activityText": "Other hourly-based activities (XTM for Product)"
                },
                {
                    "volumeQuantity": 200.0,
                    "volumeUnit": "Words",
                    "ceBillQuantity": 200.0,
                    "ceBillUnit": "Words",
                    "activityText": "Translate with XTM"
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
            "startDate": "2026-02-16T00:00:00.000Z",
            "endDate": "2026-03-03T13:00:00.000Z",
            "hasInstructions": true,
            "volume": [
                {
                    "volumeQuantity": 1000.0,
                    "volumeUnit": "Words",
                    "ceBillQuantity": 1000.0,
                    "ceBillUnit": "Words",
                    "activityText": "Translate with XTM"
                }
            ],
            "stepStatusId": "250",
            "stepStatusDescription": "In Process"
        },
        {
            "contentId": "000001",
            "serviceStep": "TRANSLFWL",
            "stepText": "Translate final volume",
            "slsLang": "ptPT",
            "sourceLang": "enUS",
            "tGroup": "TE",
            "startDate": "2026-03-03T00:00:00.000Z",
            "endDate": "2026-03-05T11:00:00.000Z",
            "hasInstructions": true,
            "stepStatusId": "000",
            "stepStatusDescription": "Pending"
        },
        {
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "stepText": "Translate current volume",
            "slsLang": "ptPT",
            "sourceLang": "enUS",
            "tGroup": "TE",
            "startDate": "2026-02-16T00:00:00.000Z",
            "endDate": "2026-03-03T13:00:00.000Z",
            "hasInstructions": true,
            "stepStatusId": "250",
            "stepStatusDescription": "In Process"
        }
    ]
}
```

### Relevant info:

- «words»/«hours»/«linee» - If volumeQuantity in REGU & FWL are ≠ 0 sum both;
- (General) - as you can see in this example it recieves 4 subProjectSteps, but as they all have the same contentId it gets saved as only 1 project;

## Example 5:

```json
{
    "subProjectId": "4017-29",
    "subProjectName": "SP13_ABAP",
    "terminologyKey": [
        "000299"
    ],
    "environment": [
        {
            "contentId": "000001",
            "environmentName": "SAP Translation System - SSK / 000 / SAP",
            "toolType": "SAP",
            "toolTypeDescription": "SAP Translation System",
            "lxeProject": [
                "001497 - MRSS V1000: SP13_ABAP 4017-29"
            ],
            "translationArea": [
                "CGQ000 - MRSS/MRSS_NW/MRSS_UI5/MRSS_UI5GT: V1000"
            ],
            "worklist": [
                "0001 - Standard Worklist"
            ],
            "is_xtm": false,
            "content_name": "SP13_ABAP",
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
            "startDate": "2026-02-23T00:00:00.000Z",
            "endDate": "2026-02-25T16:00:00.000Z",
            "hasInstructions": false,
            "volume": [
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
                },
                {
                    "volumeQuantity": 12.0,
                    "volumeUnit": "Lines",
                    "ceBillQuantity": 12.0,
                    "ceBillUnit": "Lines",
                    "activityText": "Translate short texts"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.5,
                    "ceBillUnit": "Hours",
                    "activityText": "Automated minimum charge"
                }
            ],
            "stepStatusId": "270",
            "stepStatusDescription": "Delivered"
        }
    ]
}
```

### Relevant info:

- «translationArea» does not need to be just a number in this case it should be saved “CGQ000”;
- «system» - In this example and in every single one that has toolType as SAP I want the system to be saved as the charachters after ”SAP Translation System - ” and before the next “ “ , in this case is “SSK” (that is always in environmentName);
- an extra project should be created, with words and lines 0/null and «system» STM, because "volumeUnit": "Terms" exists.

## Example 6:

```json
{
    "subProjectId": "8826-5",
    "subProjectName": "WL0001_2026_February",
    "terminologyKey": [
        "000614",
        "000614"
    ],
    "environment": [
        {
            "contentId": "000001",
            "environmentName": "SAP Translation System - SSE / 000 / SAP",
            "toolType": "SAP",
            "toolTypeDescription": "SAP Translation System",
            "lxeProject": [
                "003998 - S4HANA_OnPremise_S4PEXT: WL0001_2026_February: WL0001_source_EN 8826-5"
            ],
            "translationArea": [
                "CPP000 - S/4H: Product Extensions"
            ],
            "worklist": [
                "0001 - Standard Worklist"
            ],
            "is_xtm": false,
            "content_name": "WL0001_source_EN",
            "external_project_id": "0000000000"
        },
        {
            "contentId": "000002",
            "environmentName": "SAP Translation System - SSE / 000 / SAP",
            "toolType": "SAP",
            "toolTypeDescription": "SAP Translation System",
            "lxeProject": [
                "003999 - S4HANA_OnPremise_S4PEXT: WL0001_2026_February: WL0001_source_DE 8826-5"
            ],
            "translationArea": [
                "CPP000 - S/4H: Product Extensions"
            ],
            "worklist": [
                "0001 - Standard Worklist"
            ],
            "is_xtm": false,
            "content_name": "WL0001_source_DE",
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
            "startDate": "2026-02-24T00:00:00.000Z",
            "endDate": "2026-02-26T11:00:00.000Z",
            "hasInstructions": false,
            "volume": [
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
                },
                {
                    "volumeQuantity": 13.0,
                    "volumeUnit": "Lines",
                    "ceBillQuantity": 13.0,
                    "ceBillUnit": "Lines",
                    "activityText": "Translate short texts"
                },
                {
                    "volumeQuantity": 143.0,
                    "volumeUnit": "Words",
                    "ceBillQuantity": 143.0,
                    "ceBillUnit": "Words",
                    "activityText": "Translate long texts"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Hours",
                    "activityText": "Automated minimum charge"
                }
            ],
            "stepStatusId": "350",
            "stepStatusDescription": "Billing in progress"
        },
        {
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "stepText": "Translate current volume",
            "slsLang": "ptBR",
            "sourceLang": "enUS",
            "tGroup": "TE",
            "startDate": "2026-02-02T00:00:00.000Z",
            "endDate": "2026-02-23T11:00:00.000Z",
            "hasInstructions": false,
            "volume": [
                {
                    "volumeQuantity": 95.0,
                    "volumeUnit": "Words",
                    "ceBillQuantity": 95.0,
                    "ceBillUnit": "Words",
                    "activityText": "Translate long texts"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Terms",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Terms",
                    "activityText": "Translate terminology during translation"
                },
                {
                    "volumeQuantity": 6.0,
                    "volumeUnit": "Lines",
                    "ceBillQuantity": 6.0,
                    "ceBillUnit": "Lines",
                    "activityText": "Translate short texts"
                }
            ],
            "stepStatusId": "351",
            "stepStatusDescription": "Billing in progress"
        },
        {
            "contentId": "000002",
            "serviceStep": "TRANSLFWL",
            "stepText": "Translate final volume",
            "slsLang": "ptBR",
            "sourceLang": "deDE",
            "tGroup": "TE",
            "startDate": "2026-02-24T00:00:00.000Z",
            "endDate": "2026-02-26T11:00:00.000Z",
            "hasInstructions": false,
            "volume": [
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Words",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Words",
                    "activityText": "Translate long texts"
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
                },
                {
                    "volumeQuantity": 1.0,
                    "volumeUnit": "Lines",
                    "ceBillQuantity": 1.0,
                    "ceBillUnit": "Lines",
                    "activityText": "Translate short texts"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.5,
                    "ceBillUnit": "Hours",
                    "activityText": "Automated minimum charge"
                }
            ],
            "stepStatusId": "350",
            "stepStatusDescription": "Billing in progress"
        },
        {
            "contentId": "000002",
            "serviceStep": "TRANSLREGU",
            "stepText": "Translate current volume",
            "slsLang": "ptBR",
            "sourceLang": "deDE",
            "tGroup": "TE",
            "startDate": "2026-02-02T00:00:00.000Z",
            "endDate": "2026-02-23T11:00:00.000Z",
            "hasInstructions": false,
            "volume": [
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
                },
                {
                    "volumeQuantity": 1.0,
                    "volumeUnit": "Lines",
                    "ceBillQuantity": 1.0,
                    "ceBillUnit": "Lines",
                    "activityText": "Translate short texts"
                }
            ],
            "stepStatusId": "351",
            "stepStatusDescription": "Billing in progress"
        }
    ]
}
```

### Relevant info:

- «system» - In this example and in every single one that has toolType as SAP I want the system to be saved as the charachters after ”SAP Translation System - ” and before the next “ “ , in this case is “SSE” (that is always in environmentName);
- (General) - As you can see in this example we have 2 different projects as we also have 2 different contentId, in both environment and subProjectSteps, the ones with the same contentId should be combined as explained previously, but there should be created 2 different projects(in APP) for this subproject(in API). In this case there are also 2 terminologyKeys, one for each of the projects;
- «translationArea» - is “CPP000”;
- «lxeProject» - is “003998”;
- «worklist» - is “0001”
- 2 extra projects should be created, with words and lines 0/null and «system» STM, because "volumeUnit": "Terms" exists (in both TRANSLREGU + TRANSLFWL of both).

## Example 7:

```json
{
    "subProjectId": "5986-477",
    "subProjectName": "NW_Fiori_Apps_Hotfix_2026CW09",
    "terminologyKey": [
        "000111",
        "000766",
        "000111"
    ],
    "environment": [
        {
            "contentId": "000001",
            "environmentName": "SAP Translation System - B0X / 000 / SAP",
            "toolType": "SAP",
            "toolTypeDescription": "SAP Translation System",
            "graphId": [
                "00342 - NW UI: Unified Rendering - Admin Languages",
                "01102 - NW UI: Unified Rendering - All languages"
            ],
            "translationArea": [
                "000064 - Unified Rendering",
                "002000 - URD: SAP UI Theming Content [TEW] (1780199976)"
            ],
            "worklist": [
                "0001 - WL1 for SOLITT non-ABAP"
            ],
            "is_xtm": false,
            "content_name": "Unified_Rendering",
            "external_project_id": "0000000000"
        },
        {
            "contentId": "000002",
            "environmentName": "SAP Translation System - B0X / 000 / SAP",
            "toolType": "SAP",
            "toolTypeDescription": "SAP Translation System",
            "graphId": [
                "00342 - NW UI: Unified Rendering - Admin Languages",
                "00374 - NW UI: UI2Suite/PageBuilder (Fiori Launchpad Designer)",
                "00483 - NW UI: UI_Theme_Designer",
                "01011 - NW UI: NWBC 8.1 - All languages",
                "01108 - UI_Theming_Previews_Mobile",
                "01161 - NW UI: NWBC 8.0 - All languages"
            ],
            "translationArea": [
                "211001 - Fiori Launchpad Designer/UI2Suite/PageBuilder [LeanDI] (1870544363)",
                "010011 - NW UI: SAP BC 8.10 [TEW]",
                "000207 - NW UI: Theme Designer Release 1.75 [TEW] (2280181809)",
                "000089 - NW UI: Theme Designer [TEW] (1880083069)",
                "000186 - NW UI: SAP BC 8.0 [TEW] (2180381826)"
            ],
            "worklist": [
                "0001 - WL1 for SOLITT non-ABAP"
            ],
            "is_xtm": false,
            "content_name": "NW_UI",
            "external_project_id": "0000000000"
        },
        {
            "contentId": "000003",
            "environmentName": "SAP Translation System - B0X / 000 / SAP",
            "toolType": "SAP",
            "toolTypeDescription": "SAP Translation System",
            "graphId": [
                "00179 - NW:FIORI_APPS for NW (S/4 HANA on Prem All NW lang.) >=7.70",
                "00438 - NW:FIORI_APPS for NetWeaver (S/4 HANA Cloud) 7.77/7.78",
                "00580 - NW:EN only",
                "00622 - NW:FIORI_APPS for NetWeaver: Steampunk <=7.81",
                "00761 - NW:FIORI_APPS for NetWeaver (S/4 HANA Cloud) 7.79 to 7.83",
                "00178 - NW:FIORI_APPS for NetWeaver (S/4 HANA Cloud) 7.69",
                "00298 - NW:FIORI_APPS for NetWeaver (S/4 HANA) 7.50",
                "00507 - NW:FIORI_APPS for NW (S/4 HANA on Prem All NW lang.) < 7.70",
                "00508 - NW:FIORI_APPS for NetWeaver (S/4 HANA Cloud) 7.73",
                "00909 - NW:FIORI_APPS_Todo",
                "00910 - NW:FIORI_APPS for NetWeaver: Steampunk 7.82 to 7.88",
                "00932 - NW:FIORI_APPS for NetWeaver (S/4 HANA Cloud) 7.84 to 7.88",
                "01042 - NW:FIORI_APPS for NetWeaver (S/4 HANA Cloud) 7.89 to 9.14",
                "01043 - NW:FIORI_APPS for NetWeaver: Steampunk 7.89 to 9.14",
                "01144 - NW:FIORI_APPS for NetWeaver (S/4 HANA Cloud) as of 9.15",
                "01145 - NW:FIORI_APPS for NetWeaver: Steampunk as of 9.15"
            ],
            "translationArea": [
                "390017 - NW Fiori Apps - Hotfix: NW DW4CORE Fiori: Apps 9.14 (2502) [LeanDI]",
                "390005 - NW Fiori Apps - Hotfix: 754 SP0-SPn/7.77[LeanDI]",
                "390007 - NW Fiori Apps - Hotfix: 751 SP0-SPn/7.65[LeanDI]",
                "390019 - NW Fiori Apps - Hotfix: NW DW4CORE Fiori: Apps 9.13 (2411) [KLAUS]",
                "390013 - NW Fiori Apps - Hotfix: 7.58 (2023) [LeanDI]",
                "390010 - NW Fiori Apps - Hotfix: 7.81 (2008) [LeanDI]",
                "390014 - NW Fiori Apps - Hotfix: 9.16 (2508) [LeanDI]",
                "390003 - NW Fiori Apps - Hotfix: 750 SP1-SPn [LeanDI]",
                "390012 - NW Fiori Apps - Hotfix: 9.14 (2502) [LeanDI]",
                "390004 - NW Fiori Apps - Hotfix: 7.85 (2108) [LeanDI]",
                "390011 - NW Fiori Apps - Hotfix: 752 SP0-SPn/7.69 [LeanDI] (1770191054)",
                "390015 - NW Fiori Apps - Hotfix: 753 SP0-SPn/7.73 [LeanDI] (1880241229)",
                "390008 - NW Fiori Apps - Hotfix: 7.57 (2022) [LeanDI]",
                "390018 - NW Fiori Apps - Hotfix: NW DW4CORE Fiori: Apps 9.15 (2505) [LeanDI]",
                "390006 - NW Fiori Apps - Hotfix: 9.15 (2505) [LeanDI]",
                "390001 - NW Fiori Apps - Hotfix: 9.13 (2411) [LeanDI]",
                "390016 - NW Fiori Apps - Hotfix: NW DW4CORE Fiori: Apps 9.16 (2508) [LeanDI]"
            ],
            "worklist": [
                "0001 - WL1 for SOLITT non-ABAP"
            ],
            "is_xtm": false,
            "content_name": "NW_Fiori_Apps",
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
            "startDate": "2026-02-23T00:00:00.000Z",
            "endDate": "2026-02-25T00:00:00.000Z",
            "hasInstructions": true,
            "volume": [
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
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.5,
                    "ceBillUnit": "Hours",
                    "activityText": "Automated minimum charge"
                }
            ],
            "stepStatusId": "270",
            "stepStatusDescription": "Delivered"
        },
        {
            "contentId": "000002",
            "serviceStep": "TRANSLFWL",
            "stepText": "Translate final volume",
            "slsLang": "ptBR",
            "sourceLang": "enUS",
            "tGroup": "TE",
            "startDate": "2026-02-23T00:00:00.000Z",
            "endDate": "2026-02-25T00:00:00.000Z",
            "hasInstructions": true,
            "volume": [
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
                },
                {
                    "volumeQuantity": 6.0,
                    "volumeUnit": "Words",
                    "ceBillQuantity": 6.0,
                    "ceBillUnit": "Words",
                    "activityText": "Translate long texts"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.5,
                    "ceBillUnit": "Hours",
                    "activityText": "Automated minimum charge"
                }
            ],
            "stepStatusId": "270",
            "stepStatusDescription": "Delivered"
        },
        {
            "contentId": "000003",
            "serviceStep": "TRANSLFWL",
            "stepText": "Translate final volume",
            "slsLang": "ptBR",
            "sourceLang": "enUS",
            "tGroup": "TE",
            "startDate": "2026-02-23T00:00:00.000Z",
            "endDate": "2026-02-25T00:00:00.000Z",
            "hasInstructions": true,
            "volume": [
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Words",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Words",
                    "activityText": "Translate long texts"
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
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.5,
                    "ceBillUnit": "Hours",
                    "activityText": "Automated minimum charge"
                }
            ],
            "stepStatusId": "270",
            "stepStatusDescription": "Delivered"
        }
    ]
}
```

### Relevant info:

- As we can see we have 3 different projects, because we have 3 different contentIds;
- «terminologyKey» - we have 3 terminologyKeys, it is 1 for each of the projects from the different contentIds;
- «graphId» - we should per project save all graphIds(it can be 1 or more), for exampe in the project with contentId 000001 the values saved in «graphId» are 00342, 01102;
- «translationArea» - as we can see there can be more than 1 translationArea/graphId per project we need to save them all, for exampe in the project with contentId 000001 the values saved in «graphId» are 000064, 0020000;
- «system» - In this example and in every single one that has toolType as SAP I want the system to be saved as the charachters after ”SAP Translation System - ” and before the next “ “ , in this case is “B0X” (that is always in environmentName);
- this way of handling projects should be for projects with tooltype SAP and for systems B0X, B0T, RQ9

## Example 8:

```json
{
    "subProjectId": "6455-19",
    "subProjectName": "ISH_HMED_SP_FEB2026",
    "terminologyKey": [
        "000154",
        "000154",
        "000154",
        "000154"
    ],
    "environment": [
        {
            "contentId": "000001",
            "environmentName": "SAP Translation System - SSE / 000 / SAP",
            "toolType": "SAP",
            "toolTypeDescription": "SAP Translation System",
            "lxeProject": [
                "004020 - IS_Healthcare: ISH_HMED_SP_FEB2026: IS_H_source_enUS 6455-19"
            ],
            "translationArea": [
                "K6I000 - IS-H: 606",
                "KI8000 - IS-H: 618",
                "K7I000 - IS-H: 617"
            ],
            "worklist": [
                "0001 - Standard Worklist"
            ],
            "is_xtm": false,
            "content_name": "IS_H_source_enUS",
            "external_project_id": "0000000000"
        },
        {
            "contentId": "000002",
            "environmentName": "SAP Translation System - SSE / 000 / SAP",
            "toolType": "SAP",
            "toolTypeDescription": "SAP Translation System",
            "lxeProject": [
                "004021 - IS_Healthcare: ISH_HMED_SP_FEB2026: IS_H_source_deDE 6455-19"
            ],
            "translationArea": [
                "K6I000 - IS-H: 606",
                "KI8000 - IS-H: 618",
                "K7I000 - IS-H: 617"
            ],
            "worklist": [
                "0001 - Standard Worklist"
            ],
            "is_xtm": false,
            "content_name": "IS_H_source_deDE",
            "external_project_id": "0000000000"
        },
        {
            "contentId": "000003",
            "environmentName": "SAP Translation System - SSE / 000 / SAP",
            "toolType": "SAP",
            "toolTypeDescription": "SAP Translation System",
            "lxeProject": [
                "004022 - IS_Healthcare: ISH_HMED_SP_FEB2026: IS_HMED_source_enUS 6455-19"
            ],
            "translationArea": [
                "K6I000 - IS-H: 606",
                "KI8000 - IS-H: 618",
                "K7I000 - IS-H: 617"
            ],
            "worklist": [
                "0001 - Standard Worklist"
            ],
            "is_xtm": false,
            "content_name": "IS_HMED_source_enUS",
            "external_project_id": "0000000000"
        },
        {
            "contentId": "000004",
            "environmentName": "SAP Translation System - SSE / 000 / SAP",
            "toolType": "SAP",
            "toolTypeDescription": "SAP Translation System",
            "lxeProject": [
                "004023 - IS_Healthcare: ISH_HMED_SP_FEB2026: IS_HMED_source_deDE 6455-19"
            ],
            "translationArea": [
                "K6I000 - IS-H: 606",
                "KI8000 - IS-H: 618",
                "K7I000 - IS-H: 617"
            ],
            "worklist": [
                "0001 - Standard Worklist"
            ],
            "is_xtm": false,
            "content_name": "IS_HMED_source_deDE",
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
            "startDate": "2026-02-20T00:00:00.000Z",
            "endDate": "2026-02-24T16:00:00.000Z",
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
            "stepStatusId": "350",
            "stepStatusDescription": "Billing in progress"
        },
        {
            "contentId": "000001",
            "serviceStep": "TRANSLREGU",
            "stepText": "Translate current volume",
            "slsLang": "ptBR",
            "sourceLang": "enUS",
            "tGroup": "TE",
            "startDate": "2026-02-13T00:00:00.000Z",
            "endDate": "2026-02-19T09:00:00.000Z",
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
            "stepStatusId": "351",
            "stepStatusDescription": "Billing in progress"
        },
        {
            "contentId": "000002",
            "serviceStep": "TRANSLFWL",
            "stepText": "Translate final volume",
            "slsLang": "ptBR",
            "sourceLang": "deDE",
            "tGroup": "TE",
            "startDate": "2026-02-20T00:00:00.000Z",
            "endDate": "2026-02-24T16:00:00.000Z",
            "hasInstructions": true,
            "volume": [
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
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.5,
                    "ceBillUnit": "Hours",
                    "activityText": "Automated minimum charge"
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
            "stepStatusId": "350",
            "stepStatusDescription": "Billing in progress"
        },
        {
            "contentId": "000002",
            "serviceStep": "TRANSLREGU",
            "stepText": "Translate current volume",
            "slsLang": "ptBR",
            "sourceLang": "deDE",
            "tGroup": "TE",
            "startDate": "2026-02-13T00:00:00.000Z",
            "endDate": "2026-02-19T09:00:00.000Z",
            "hasInstructions": true,
            "volume": [
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Terms",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Terms",
                    "activityText": "Translate terminology during translation"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Words",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Words",
                    "activityText": "Translate long texts"
                },
                {
                    "volumeQuantity": 68.0,
                    "volumeUnit": "Lines",
                    "ceBillQuantity": 68.0,
                    "ceBillUnit": "Lines",
                    "activityText": "Translate short texts"
                }
            ],
            "stepStatusId": "351",
            "stepStatusDescription": "Billing in progress"
        },
        {
            "contentId": "000003",
            "serviceStep": "TRANSLFWL",
            "stepText": "Translate final volume",
            "slsLang": "ptBR",
            "sourceLang": "enUS",
            "tGroup": "TE",
            "startDate": "2026-02-20T00:00:00.000Z",
            "endDate": "2026-02-24T16:00:00.000Z",
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
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Hours",
                    "activityText": "Translate long texts without TAMO"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.5,
                    "ceBillUnit": "Hours",
                    "activityText": "Automated minimum charge"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Hours",
                    "activityText": "Other hourly-based activities in translation project"
                }
            ],
            "stepStatusId": "350",
            "stepStatusDescription": "Billing in progress"
        },
        {
            "contentId": "000003",
            "serviceStep": "TRANSLREGU",
            "stepText": "Translate current volume",
            "slsLang": "ptBR",
            "sourceLang": "enUS",
            "tGroup": "TE",
            "startDate": "2026-02-13T00:00:00.000Z",
            "endDate": "2026-02-19T09:00:00.000Z",
            "hasInstructions": true,
            "volume": [
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
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Lines",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Lines",
                    "activityText": "Translate short texts"
                }
            ],
            "stepStatusId": "351",
            "stepStatusDescription": "Billing in progress"
        },
        {
            "contentId": "000004",
            "serviceStep": "TRANSLFWL",
            "stepText": "Translate final volume",
            "slsLang": "ptBR",
            "sourceLang": "deDE",
            "tGroup": "TE",
            "startDate": "2026-02-20T00:00:00.000Z",
            "endDate": "2026-02-24T16:00:00.000Z",
            "hasInstructions": true,
            "volume": [
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
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Hours",
                    "ceBillQuantity": 0.5,
                    "ceBillUnit": "Hours",
                    "activityText": "Automated minimum charge"
                }
            ],
            "stepStatusId": "350",
            "stepStatusDescription": "Billing in progress"
        },
        {
            "contentId": "000004",
            "serviceStep": "TRANSLREGU",
            "stepText": "Translate current volume",
            "slsLang": "ptBR",
            "sourceLang": "deDE",
            "tGroup": "TE",
            "startDate": "2026-02-13T00:00:00.000Z",
            "endDate": "2026-02-19T09:00:00.000Z",
            "hasInstructions": true,
            "volume": [
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Terms",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Terms",
                    "activityText": "Translate terminology during translation"
                },
                {
                    "volumeQuantity": 0.0,
                    "volumeUnit": "Words",
                    "ceBillQuantity": 0.0,
                    "ceBillUnit": "Words",
                    "activityText": "Translate long texts"
                },
                {
                    "volumeQuantity": 44.0,
                    "volumeUnit": "Lines",
                    "ceBillQuantity": 44.0,
                    "ceBillUnit": "Lines",
                    "activityText": "Translate short texts"
                }
            ],
            "stepStatusId": "351",
            "stepStatusDescription": "Billing in progress"
        }
    ]
}
```

## Relevant info:

- Here as we can see we have 4 different contentIds, but that does NOT matter, to see what projects we create what we should do in this situation is see what TranslationAreas exist(in this case there are 3), and how many subprojectSteps(always group REGU & FWL with the same contentId together) there are so in this case there are 4 different contentIds, but what we want to look how many of those have different language combinations there are in this example we can see we only have deDE→ptBR & enUS→ptBR. And now we combine, 1 language combination per translationArea, so in this case we are going to get 6 projects imported, with the same everything except 3 will have the same Language comb(deDE→ptBR) but different translationAreas(from K6I000, KI8000, K7I000) each, and the other 3 (enUS→ptBR) also with each with 1 translationArea(from K6I000, KI8000, K7I000).
- this way of handling projects should be for projects with tooltype SAP and for systems SSE, SSH, SSK
- In this example no extra projects with system STM should be created because only in there is only "volumeUnit": "Terms", in TRANSLREGU and not in TRANSLFWL


## Example 9:

```json

```


7018-1 (XTM todo maluco)