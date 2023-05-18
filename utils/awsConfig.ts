// src/utils/awsConfig.ts
import { getAllSecrets } from './awsSecretsManager';
import { secrets } from './secrets';

const secretName = 'on-call-notes-fe-secret';
const useEnvFile = process.env.USE_ENV_FILE === 'true';

async function getSecrets(): Promise<any> {
  if (useEnvFile) {
    console.log('Using .env file for AWS config');
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      AwsAccountId: process.env.AWS_QUICKSIGHT_ACCOUNT_ID,
      DashboardId: process.env.AWS_QUICKSIGHT_DASHBOARD_ID,
      AWS_SDK_LOAD_CONFIG: 1,
    };
  } else {
    console.log('Using AWS Secrets Manager for AWS config');
    return await getAllSecrets(secretName);
  }
}

async function getAwsConfig(): Promise<any> {
  const secretValues = await getSecrets();
  return secretValues;

  /* if (secretValues) {
    return {
      accessKeyId: secretValues[secrets.AWS_ACCESS_KEY_ID],
      secretAccessKey: secretValues[secrets.AWS_SECRET_ACCESS_KEY],
      region: secretValues[secrets.REACT_APP_AWS_REGION],
      AwsAccountId: secretValues[secrets.AWS_QUICKSIGHT_ACCOUNT_ID],
      DashboardId: secretValues[secrets.AWS_QUICKSIGHT_DASHBOARD_ID],
      AWS_SDK_LOAD_CONFIG: 1,
    };
  } else {
    console.log(`getAwsConfig: No secret values found for ${secretName}`);
    return null;
  } */
}

async function getAthenaConstants(): Promise<any> {
  const secretValues = await getSecrets();

  if (secretValues) {
    return {
      // The name of the s3 bucket where the query results will be stored
      // outputLocation: secretValues[secrets.AWS_ATHENA_OUTPUT_LOCATION],
      outputLocation: process.env.AWS_ATHENA_OUTPUT_LOCATION,
    };
  } else {
    console.log(`getAthenaConstants: No secret values found for ${secretName}`);
    return null;
  }
}

export const awsConfigPromise = getAwsConfig();
export const athenaConstantsPromise = getAthenaConstants();
