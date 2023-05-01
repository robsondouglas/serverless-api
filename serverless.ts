import type { AWS } from '@serverless/typescript';


const stage = '${opt:stage, "dev"}'
const tblQuestionario = `QUE_QUESTIONARIO_${stage}`;
const tblAvaliacao    = `QUE_AVALIACAO_${stage}`;

const serverlessConfiguration: AWS = {
  service: 'questionario',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dynamodb-local'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      tblAvaliacao,
      tblQuestionario
    },
  },
  // import the function via paths
  functions: {  },
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
      tblQuestionario: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: tblQuestionario,
          AttributeDefinitions:[
            {AttributeName:'IdQuestionario', AttributeType: 'S'},
            {AttributeName:'Versao', AttributeType: 'S'}
          ],
          KeySchema:[
            {AttributeName: 'IdQuestionario', KeyType: 'HASH'},
            {AttributeName: 'Versao',         KeyType: 'RANGE'}
          ],
          ProvisionedThroughput:{
            ReadCapacityUnits:  10,
            WriteCapacityUnits: 2
          }
        }
      },
      tblAvaliacao: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: tblAvaliacao,
          AttributeDefinitions:[
            {AttributeName:'IdAvaliado', AttributeType: 'S'},
            {AttributeName:'IdAvaliacao', AttributeType: 'S'}
          ],
          KeySchema:[
            {AttributeName: 'IdAvaliado',   KeyType: 'HASH'},
            {AttributeName: 'IdAvaliacao',  KeyType: 'RANGE'}
          ],
          ProvisionedThroughput:{
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 5
          }
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;