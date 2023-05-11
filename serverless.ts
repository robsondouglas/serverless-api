import type { AWS } from '@serverless/typescript';
import * as functions from './src/index'

const stage       = '${opt:stage, "dev"}'
const tblTask     = `TSK_TASK_${stage}`;
const tblGallery  = `TSK_GALLERY_${stage}`;
const tblSchedule = `TSK_SCHEDULE_${stage}`;
const bktTmp      = `temp.photo.poc.${stage.toLowerCase}`;
const bktPriv     = `priv.photo.poc.${stage.toLowerCase}`;
const keyAWS      = 813397945060;

const serverlessConfiguration: AWS = {
  service: 'taskmanager',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dynamodb-local'],
  provider: {
    name: 'aws',
    region: 'sa-east-1',
    runtime: 'nodejs16.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      tblTask,
      tblGallery,
      bktTmp,
      bktPriv
    },
    iam:{
      role:{
        statements:[
          {
            Effect: "Allow", 
            Action: ["s3:ListBucket", "s3:GetObject", "s3:PutObject"],
            Resource: [`arn:aws:s3:::tmp.sls.poc`, `arn:aws:s3:::priv.sls.poc`]
          },
          {
            Effect: "Allow", 
            Action: ["dynamodb:*"],
            Resource: [`arn:aws:dynamodb:sa-east-1:${keyAWS}:${tblTask}`]
          }
        ]
      }
    }
  },
  // import the function via paths
  functions: functions,
  package: { individually: true },
  
  custom: {
    dynamodb: {
      stages: [stage],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
        seed: true
      }
    }, 

    esbuild: {
      bundle: true,
      minify: true,
      sourcemap: false,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
  resources:{
    Resources:{
      tblTask: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: tblTask,
          AttributeDefinitions:[
            {AttributeName:'IdOwner',    AttributeType: 'S'},
            {AttributeName:'IdTask',     AttributeType: 'S'}
          ],
          KeySchema:[
            {AttributeName: 'IdOwner', KeyType:    'HASH'},
            {AttributeName: 'IdTask',  KeyType: 'RANGE'}
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits:  10,
            WriteCapacityUnits: 2
          }
        }
      },
      tblGallery: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: tblGallery,
          AttributeDefinitions:[
            {AttributeName:'IdOwner',  AttributeType: 'S'},
            {AttributeName: 'IdPicture', AttributeType: 'S'},
            {AttributeName: 'DateAdd', AttributeType: 'N'}
          ],
          KeySchema:[
            {AttributeName: 'IdOwner', KeyType: 'HASH'},
            {AttributeName: 'IdPicture', KeyType: 'RANGE'}
          ],
          LocalSecondaryIndexes:[{
            IndexName: `${tblGallery}_IDX_DATE`,
            KeySchema:[
              {AttributeName: 'IdOwner', KeyType: 'HASH'},
              {AttributeName: 'DateAdd', KeyType: 'RANGE'},
            ],
            Projection: {ProjectionType: "ALL"}
          }],
          ProvisionedThroughput:{
            ReadCapacityUnits:  10,
            WriteCapacityUnits: 2
          }
        }
      },
      tblSchedule: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: tblSchedule,
          AttributeDefinitions:[
            {AttributeName:'AlertTime',    AttributeType: 'N'},
            {AttributeName:'IdOwner',     AttributeType: 'S'}
          ],
          KeySchema:[
            {AttributeName: 'AlertTime', KeyType: 'HASH'},
            {AttributeName: 'IdOwner',  KeyType:  'RANGE'}
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits:  10,
            WriteCapacityUnits: 2
          }
        }
      },
      bktTmp:{
        Type: 'AWS::S3::Bucket',
        Properties:{
          BucketName: bktTmp,
          AccessControl: 'Private',
          LifecycleConfiguration: {
            Rules: [ {Id: "AutoClean", ExpirationInDays: 1} ]
          }
        }
      },
      bktPriv: {
        Type: 'AWS::S3::Bucket',
        Properties:{
          BucketName: bktPriv,
          AccessControl: 'Private'
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;