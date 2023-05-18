// src/components/TicketTable/TicketTable/AthenaHandler.tsx

import React, { useEffect } from 'react';
import {
  executeAthenaQuery,
  waitForAthenaQuery,
  fetchAthenaQueryResults,
  AthenaQueryResult,
  ensureAthenaClientInitialized,
} from '../../../utils/awsAthena';
import { RowData } from './rowData';

interface AthenaHandlerProps {
  onDataReceived: (data: RowData[]) => void;
  dateRange: string;
}

// This component is responsible for executing the Athena query and passing the results to the Table component
const AthenaHandler: React.FC<AthenaHandlerProps> = ({
  onDataReceived,
  dateRange,
}) => {
  useEffect(() => {
    const [startDate, endDate] = dateRange.split('_to_');
    const newQuery = `SELECT id, title, status, createdate, lastresolveddate, extensions.tt.impact, extensions.tt.minImpact, labels
                      FROM "AwsDataCatalog"."sim_database"."sim_tickets"
                      WHERE createdate
                      BETWEEN '${startDate}' AND '${endDate}' AND extensions.tt.minImpact < 3 ORDER BY createdate ASC`;
    //const newQuery = ' ';
    const executeQuery = async () => {
      try {
        await ensureAthenaClientInitialized();
        const queryExecutionId = await executeAthenaQuery(newQuery);
        await waitForAthenaQuery(queryExecutionId);
        const queryResults = await fetchAthenaQueryResults(queryExecutionId);
        const rowData = await convertQueryResultsToRowData(queryResults);
        onDataReceived(rowData);
      } catch (error) {
        console.log('Error executing Athena query:', error);
      }
    };

    executeQuery();
  }, [dateRange, onDataReceived]);
  return <div></div>;
};

const fixJsonFormat = (input: string): string => {
  return input.replace(/(\w+)=([\w-]+)/g, '"$1": "$2"');
};

// This function converts the Athena query results into a format that the Table component can use
const convertQueryResultsToRowData = (
  queryResults: AthenaQueryResult
): RowData[] => {
  const rowData: RowData[] = queryResults.rows.map(row => {
    const fixedJson = fixJsonFormat(row[7]);
    const labels = typeof row[7] === 'string' ? JSON.parse(fixedJson) : row[7];
    return {
      title: row[1],
      status: row[2],
      createdDate: row[3],
      UUID: row[0],
      lastresolveddate: row[4],
      impact: row[5],
      minImpact: row[6],
      notes: '',
      labels: labels,
    };
  });
  return rowData;
};

export default AthenaHandler;
