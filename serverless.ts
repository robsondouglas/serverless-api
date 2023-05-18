import type { AWS } from '@serverless/typescript';
import * as funcs from './src/index';

const args = (key:string, defaultValue:string) =>  {
  const idx = process.argv.findIndex(f=>f.startsWith(`--${key}`))
  if(idx<0)
  { return defaultValue }
  else
  {
    const arg = process.argv[idx].split('=')
    return (arg.length == 2) ? arg[1] : process.argv[idx+1]
  }
}

const stage =  args('stage', 'dev')//'${opt:stage, "dev"}'

const tables = {
  Task: {key: 'tblTask', name: `TSK_TASK_${stage}`},
  Gallery: {key: 'tblGallery', name: `TSK_GALLERY_${stage}`},
  Schedule: {key: 'tblSchedule', name: `TSK_SCHEDULE_${stage}`},
  Subscribe: {key: 'tblSubscribe', name: `TSK_SUBSCRIBE_${stage}`}
};

const queues = {
  Schedule: [
    {key: `sqsSchedule`,    name: `tskSchedule${stage}`},
    {key: `sqsScheduleDLQ`, name: `tskScheduleDLQ${stage}`}
  ]
};

const buckets = {
  Temp: {key: 'bktPriv', name: `temp.photo.poc.${stage.toLowerCase()}`},
  Priv: {key: 'bktTemp', name: `priv.photo.poc.${stage.toLowerCase()}`}
};


const {runSchedules, enqueueSchedules, ...functions } = funcs
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
      ... Object.keys(tables).reduce((obj, k)=> { obj[k]  = tables[k].name; return obj }, {}),
      ... Object.keys(buckets).reduce((obj, k)=> { obj[k] = buckets[k].name; return obj }, {}),
      ... Object.keys(queues).reduce((obj, k)=> { obj[k] = queues[k][0].name; return obj }, {})
    },
    iam:{
      role:{
        statements:[
          {
            Effect: "Allow", 
            Action: [
              "s3:ListBucket", 
              "s3:GetObject", 
              "s3:PutObject",
              "s3:DeleteObject"
            ],
            Resource: Object.keys(buckets).map( k => ({"Fn::GetAtt": [buckets[k].key, 'Arn']}) ) 
          },
          {
            Effect: "Allow", 
            Action: [
              "dynamodb:BatchGet*",
              "dynamodb:DescribeTable",
              "dynamodb:Get*",
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:BatchWrite*",
              "dynamodb:Delete*",
              "dynamodb:Update*",
              "dynamodb:PutItem"
            ],
            Resource: Object.keys(tables).map( k => ({"Fn::GetAtt": [tables[k].key, 'Arn']}) )
          },
          {
            Effect: "Allow", 
            Action: ["sqs:*"],
            Resource: 
            [
              ...Object.keys(queues).map( k => ({"Fn::GetAtt": [queues[k][0].key, 'Arn']}) ), //QUEUE
              ...Object.keys(queues).map( k => ({"Fn::GetAtt": [queues[k][1].key, 'Arn']}) ), //DLQ
            ]
          }
        ]
      }
    }
  },
  // import the function via paths
  functions: {...functions, runSchedules: runSchedules( 'sqsSchedule' ), enqueueSchedules: enqueueSchedules(`evtSchedule${stage}`)},
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
        [tables.Task.key]: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: tables.Task.name,
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
      [tables.Gallery.key]: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: tables.Gallery.name,
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
            IndexName: `${tables.Gallery.name}_IDX_DATE`,
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
      [tables.Schedule.key]: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: tables.Schedule.name,
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
      [tables.Subscribe.key]: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: tables.Subscribe.name,
          AttributeDefinitions:[
            {AttributeName:'IdTopic',    AttributeType: 'S'},
            {AttributeName:'IdOwner',     AttributeType: 'S'}
          ],
          KeySchema:[
            {AttributeName: 'IdTopic', KeyType: 'HASH'},
            {AttributeName: 'IdOwner',  KeyType:  'RANGE'}
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits:  10,
            WriteCapacityUnits: 2
          }
        }
      },
      [buckets.Temp.key]:{
        Type: 'AWS::S3::Bucket',
        Properties:{
          BucketName: buckets.Temp.name,
          AccessControl: 'Private',
          LifecycleConfiguration: {
            Rules: [ {Id: "AutoClean", ExpirationInDays: 1, Status: 'Enabled'} ]
          }
        }
      },
      [buckets.Priv.key]: {
        Type: 'AWS::S3::Bucket',
        Properties:{
          BucketName: buckets.Priv.name,
          AccessControl: 'Private'
        }
      },
      [queues.Schedule[0].key]: {
        Type: 'AWS::SQS::Queue',
        Properties:{
          QueueName: queues.Schedule[0].name,
          RedrivePolicy:{
            deadLetterTargetArn: {"Fn::GetAtt": [queues.Schedule[1].key, 'Arn']},
            maxReceiveCount: 3
          }
        }
      },
      [queues.Schedule[1].key]: {
        Type: 'AWS::SQS::Queue',
        Properties:{
          QueueName: queues.Schedule[1].name
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;