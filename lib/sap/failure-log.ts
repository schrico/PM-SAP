// /lib/sap/failure-log.ts
// Failure tracking and log file writing for SAP imports

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

export type FailureStage = 'lookup' | 'details' | 'match' | 'update' | 'insert' | 'process';

export interface FailedImportItem {
  projectId: number | null;
  subProjectId: string | null;
  stage: FailureStage;
  message: string;
  explanation: string;
  timestamp: string;
}

const FAILURE_LOG_DIR = join(process.cwd(), 'logs', 'sap-import-failures');

function explainFailure(stage: FailureStage): string {
  switch (stage) {
    case 'lookup':
      return 'The SAP project or subproject could not be found in the fetched SAP project list for this import run.';
    case 'details':
      return 'The SAP subproject details or instructions could not be fetched before local processing started.';
    case 'match':
      return 'The local project lookup failed before the importer could decide whether to update an existing row or create a new one.';
    case 'update':
      return 'A local project row was found, but updating the SAP-owned fields in the database failed.';
    case 'insert':
      return 'The importer generated a local project row, but inserting it into the database failed.';
    case 'process':
    default:
      return 'An unexpected error occurred while processing this SAP subproject during the import run.';
  }
}

function formatLogTimestamp(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export async function writeFailureLogFile(params: {
  userId: string;
  imported: number;
  updated: number;
  failed: number;
  failures: FailedImportItem[];
  reportCreated: boolean;
  reportCreationError: string | null;
}) {
  const filename = `sap-import-failures-${formatLogTimestamp()}.json`;
  const filePath = join(FAILURE_LOG_DIR, filename);

  await mkdir(FAILURE_LOG_DIR, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        triggeredBy: params.userId,
        summary: {
          imported: params.imported,
          updated: params.updated,
          failed: params.failed,
        },
        failures: params.failures,
        reportCreated: params.reportCreated,
        reportCreationError: params.reportCreationError,
      },
      null,
      2
    ),
    'utf8'
  );

  return `logs/sap-import-failures/${filename}`;
}

/** Creates a failure recorder that accumulates failures during an import run */
export function createFailureRecorder() {
  const items: FailedImportItem[] = [];
  let failedCount = 0;
  const errorMessages: string[] = [];

  return {
    record(
      stage: FailureStage,
      message: string,
      projectId: number | null,
      subProjectId: string | null,
    ) {
      failedCount++;
      errorMessages.push(message);
      items.push({
        projectId,
        subProjectId,
        stage,
        message,
        explanation: explainFailure(stage),
        timestamp: new Date().toISOString(),
      });
    },
    get items() { return items; },
    get failedCount() { return failedCount; },
    get errorMessages() { return errorMessages; },
  };
}
