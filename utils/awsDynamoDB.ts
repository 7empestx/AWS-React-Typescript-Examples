// src/utils/awsDynamoDB.ts

import { DynamoDB } from 'aws-sdk';
import * as AWS from 'aws-sdk';
// import { awsConfig } from './awsConfig';

// Initialize the AWS SDK
// AWS.config.update(awsConfig);

const dynamoDB = new DynamoDB.DocumentClient({ region: 'us-west-2' });

export async function updateNotes(ticket_id: string, notes: string) {
  console.log('updateNotes', ticket_id, notes);
  const decodedTicketId = decodeURIComponent(ticket_id);
  const params = {
    TableName: 'ADCOpsHand_TicketTable',
    Key: {
      ticket_id: decodedTicketId,
    },
    UpdateExpression: 'set #notes = :notes',
    ExpressionAttributeValues: {
      ':notes': notes,
    },
    ExpressionAttributeNames: {
      '#notes': 'notes',
    },
  };

  try {
    await dynamoDB.update(params).promise();
    console.log('Update successful');
  } catch (error) {
    console.error('Error updating notes:', error);
  }
}

export async function getTicketNotes(ticket_id: string) {
  const params = {
    TableName: 'ADCOpsHand_TicketTable',
    Key: {
      ticket_id,
    },
  };

  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item ? result.Item.notes : '';
  } catch (error) {
    console.error('Error fetching notes:', error);
    return '';
  }
}
