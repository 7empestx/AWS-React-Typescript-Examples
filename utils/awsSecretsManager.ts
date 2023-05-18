// src/utils/awsSecretsManager.ts

import { SecretsManager } from 'aws-sdk';
import * as AWS from 'aws-sdk';
// import { awsConfig } from './awsConfig';

// This is for calling secrets manager only
const awsConfig = {
  region: 'us-west-2',
  // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

// Initialize the AWS SDK using local credentials
AWS.config.update(awsConfig);

const secretsManager = new SecretsManager({ region: 'us-west-2' });

/**
 * Retrieves a secret from AWS Secrets Manager based on the given secret name.
 * If the secret value exists, returns it as a string. Otherwise, returns null.
 * If an error occurs during retrieval, logs the error and returns null.
 *
 * @param secretName - The name of the secret to retrieve.
 * @returns A promise that resolves to a string (the secret value) or null.
 */
export async function getSecret(secretName: string): Promise<string | null> {
  try {
    const response = await secretsManager
      .getSecretValue({ SecretId: secretName })
      .promise();
    if ('SecretString' in response) {
      return response.SecretString;
    } else {
      console.log(`Failed to retrieve secret: ${secretName}`);
      return null;
    }
  } catch (error) {
    console.error(`Error retrieving secret: ${secretName}`, error);
    return null;
  }
}

export async function getAllSecrets(secretName: string): Promise<any> {
  const secretValue = await getSecret(secretName);
  if (secretValue) {
    return JSON.parse(secretValue);
  } else {
    console.log(`getAllSecrets: No secret value found for ${secretName}`);
    return null;
  }
}
