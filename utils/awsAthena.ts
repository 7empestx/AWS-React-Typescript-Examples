// src/utils/awsAthena.ts

import * as AWS from 'aws-sdk';
import { awsConfigPromise, athenaConstantsPromise } from './awsConfig';

export interface AthenaQueryResult {
  rows: string[][];
  columnInfo: AWS.Athena.ColumnInfo[];
}

// Initialize the Athena SDK
let athena: AWS.Athena;

export const ensureAthenaClientInitialized = async (): Promise<void> => {
  if (!athena) {
    const awsConfig = await awsConfigPromise;
    const athenaConstants = await athenaConstantsPromise;

    if (awsConfig && athenaConstants) {
      AWS.config.update(awsConfig);
      athena = new AWS.Athena();
    } else {
      throw new Error('Failed to load AWS configuration or Athena constants');
    }
  }
};

export const executeAthenaQuery = async (
  queryString: string
): Promise<string> => {
  if (!athena) {
    throw new Error('Athena client is not initialized');
  }

  const athenaConstants = await athenaConstantsPromise;
  const params = {
    QueryString: queryString,
    ResultConfiguration: {
      OutputLocation: athenaConstants.outputLocation,
    },
  };
  const { QueryExecutionId } = await athena
    .startQueryExecution(params)
    .promise();
  return QueryExecutionId;
};

export const waitForAthenaQuery = async (
  queryExecutionId: string
): Promise<void> => {
  if (!athena) {
    throw new Error('Athena client is not initialized');
  }

  return new Promise((resolve, reject) => {
    const checkQueryStatus = async () => {
      const { QueryExecution } = await athena
        .getQueryExecution({ QueryExecutionId: queryExecutionId })
        .promise();

      if (
        QueryExecution.Status.State === 'RUNNING' ||
        QueryExecution.Status.State === 'QUEUED'
      ) {
        setTimeout(checkQueryStatus, 5000);
      } else if (QueryExecution.Status.State === 'SUCCEEDED') {
        resolve();
      } else {
        reject(new Error(QueryExecution.Status.StateChangeReason));
      }
    };

    checkQueryStatus();
  });
};

export const fetchAthenaQueryResults = async (
  queryExecutionId: string
): Promise<AthenaQueryResult> => {
  if (!athena) {
    throw new Error('Athena client is not initialized');
  }

  const result: AthenaQueryResult = {
    rows: [],
    columnInfo: [],
  };

  let nextToken: string | undefined;

  do {
    const getResultsParams = {
      QueryExecutionId: queryExecutionId,
      MaxResults: 1000,
      NextToken: nextToken,
    };

    const { ResultSet, NextToken } = await athena
      .getQueryResults(getResultsParams)
      .promise();
    const columnInfo = ResultSet.ResultSetMetadata.ColumnInfo;

    result.columnInfo = columnInfo;

    const rows = ResultSet.Rows;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].Data.map(col => col.VarCharValue || '');
      result.rows.push(row);
    }

    nextToken = NextToken;
  } while (nextToken);

  return result;
};
