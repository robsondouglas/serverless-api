import type { AWS } from '@serverless/typescript';
import { auth, addTask, addImage, readTask, listTask, listImages, removeTask } from './src/index'

const stage = '${opt:stage, "dev"}'
const tblTask = `TSK_TASK_${stage}`;
const tblImg  = `TSK_IMAGE_${stage}`;
const bktTmp    = `tmp.sls.poc`;
const bktPriv    = `priv.sls.poc`;
const keyAWS     = 813397945060;

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
      tblImg,
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
  functions: { auth, addTask, addImage, readTask, listTask, listImages, removeTask },
  package:   { individually: true },
  
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
            {AttributeName:'IdOwner', AttributeType: 'S'},
            {AttributeName:'DayTask',     AttributeType: 'N'}
          ],
          KeySchema:[
            {AttributeName: 'IdOwner', KeyType: 'HASH'},
            {AttributeName: 'DayTask',     KeyType: 'RANGE'}
          ],
          ProvisionedThroughput:{
            ReadCapacityUnits:  10,
            WriteCapacityUnits: 2
          }
        }
      },
      tblImage: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: tblImg,
          AttributeDefinitions:[
            {AttributeName:'IdOwner', AttributeType: 'S'}
          ],
          KeySchema:[
            {AttributeName: 'IdOwner', KeyType: 'HASH'}
          ],
          ProvisionedThroughput:{
            ReadCapacityUnits:  10,
            WriteCapacityUnits: 2
          }
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;