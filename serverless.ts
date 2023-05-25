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

const stage =  args('stage', 'dev');
const projectName = 'taskmanager'
const cognitoPoolId = 'sa-east-1_28VaLNwAP'

const tables = {
  Task: {key: 'tblTask', name: `TSK_TASK_${stage}`},
  Gallery: {key: 'tblGallery', name: `TSK_GALLERY_${stage}`},
  Schedule: {key: 'tblSchedule', name: `TSK_SCHEDULE_${stage}`},
  Subscribe: {key: 'tblSubscription', name: `TSK_SUBSCRIPTION_${stage}`}
};

const queues = {
  Schedule: [
    {key: `sqsSchedule`,    name: `tskSchedule${stage}`},
    {key: `sqsScheduleDLQ`, name: `tskScheduleDLQ${stage}`}
  ]
};



const buckets = {
  Temp: {key: 'bktTemp', name: `temp.photo.${projectName.toLowerCase()}.${stage.toLowerCase()}`},
  Priv: {key: 'bktPriv', name: `priv.photo.${projectName.toLowerCase()}.${stage.toLowerCase()}`}
};

const cdns = {
  Gallery: {key: 'cdnGallery', target: buckets.Priv}
}

const {runSchedules, enqueueSchedules, processImage, ...functions } = funcs
const serverlessConfiguration: AWS = {
  service: projectName,
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dynamodb-local'],
  provider: {
    name: 'aws',
    httpApi: {
      cors: { allowedOrigins: ['*'], allowedHeaders: ['Content-Type', 'Authorization'], allowedMethods: ['POST'], /*allowCredentials: true*/ },
      authorizers: {
        auth: {
          type: 'jwt',
        identitySource: '$request.header.Authorization',
        issuerUrl: `https://cognito-idp.sa-east-1.amazonaws.com/${cognitoPoolId}`,
        audience: ['7joob4d238qo57i2gdmnkpava2']
        }
      }
    },
    region: 'sa-east-1',
    runtime: 'nodejs16.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      ... Object.keys(tables).reduce((obj, k)=> { obj[`tbl${k}`]  = tables[k].name; return obj }, {}),
      ... Object.keys(buckets).reduce((obj, k)=> { obj[`bkt${k}`] = buckets[k].name; return obj }, {}),
      ... Object.keys(queues).reduce((obj, k)=> { obj[`sqs${k}`] = queues[k][0].name; return obj }, {})
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
            Resource: Object.keys(buckets).map( k => ({"Fn::Sub":'arn:aws:s3:::${' + buckets[k].key + '}/*'}) ) 
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
            Resource: [...Object.keys(tables).map( k => ({"Fn::GetAtt": [tables[k].key, 'Arn']}) ), {"Fn::Sub":'arn:aws:dynamodb:sa-east-1:${AWS::AccountId}:table/${' + tables.Gallery.key + '}/index/*'}]
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
  functions: {...functions, runSchedules: runSchedules( 'sqsSchedule' ), enqueueSchedules: enqueueSchedules(`evtSchedule${stage}`), processImage: processImage(buckets.Priv.name)},
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
      external: ['sharp'],
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
      packagerOptions: {scripts: ['npm install --arch=x64 --platform=linux sharp']}
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
          BillingMode: 'PAY_PER_REQUEST'
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
          BillingMode: 'PAY_PER_REQUEST'
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
          BillingMode: 'PAY_PER_REQUEST'
        }
      },
      [tables.Subscribe.key]: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: tables.Subscribe.name,
          AttributeDefinitions:[
            {AttributeName:'IdTopic',         AttributeType: 'S'},
            {AttributeName:'IdSubscription',  AttributeType: 'S'}
          ],
          KeySchema:[
            {AttributeName: 'IdTopic',        KeyType: 'HASH'},
            {AttributeName: 'IdSubscription', KeyType:  'RANGE'}
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
          CorsConfiguration:{
              CorsRules: [
                {AllowedMethods: ['HEAD', 'GET', 'PUT'], AllowedOrigins: ['*'],  "AllowedHeaders": ["*"]}
              ]
          },
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
      },
      DefaultOAC: {
        Type: "AWS::CloudFront::OriginAccessControl",
        Properties:{ 
          OriginAccessControlConfig: {
              Name: 'DefaultOAC',
              OriginAccessControlOriginType: "s3",
              SigningBehavior: "always",
              SigningProtocol: "sigv4"
            }
        }
      },

      DefaultOAI: {
        Type: "AWS::CloudFront::CloudFrontOriginAccessIdentity",
        Properties: {
          CloudFrontOriginAccessIdentityConfig : {Comment: "OK!"}
        } 
      },

      [cdns.Gallery.key]: {
        Type : "AWS::CloudFront::Distribution",
        DependsOn:[cdns.Gallery.target.key],
        Properties: {
          DistributionConfig: {
            Origins: [
              {
                DomainName: `${cdns.Gallery.target.name}.s3.sa-east-1.amazonaws.com`,
                Id: "static-hosting",
                S3OriginConfig: { OriginAccessIdentity: "" },
                OriginAccessControlId: {'Fn::GetAtt': ['DefaultOAC', 'Id']}
              }
            ],
            Enabled: "true",
            DefaultRootObject: "notfound.png",
            CustomErrorResponses: [
              {
                ErrorCode: 404,
                ResponseCode: 200,
                ResponsePagePath: "/notfound.png"
              },
              {
                ErrorCode: 403,
                ResponseCode: 200,
                ResponsePagePath: "/notfound.png"
              }
            ],
            HttpVersion: "http2",
            //Aliases: [ "web.example.com"],
            // ViewerCertificate: {
            //   "AcmCertificateArn": "arn:aws:acm:sa-east-1:Id-of-IAM-User:certificate/1xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
            //   "MinimumProtocolVersion": "TLSv1.2_2021",
            //   "SslSupportMethod": "sni-only"
            // },
            ViewerCertificate: {
              CloudFrontDefaultCertificate: true
            },
            DefaultCacheBehavior: {
              AllowedMethods: [ 'HEAD', 'GET', 'OPTIONS' ],
              Compress: true,
              TargetOriginId: "static-hosting",
              ForwardedValues: {
                QueryString: "false",
                Cookies: { Forward: "none" }
              },
              ViewerProtocolPolicy: "redirect-to-https"
            }
          }
        }
      },
          
        // Properties : {
        //   DistributionConfig:{
        //     //CNAMEs: ['gallery.meudominio.com.br'],
        //     Enabled: true,
        //     DefaultCacheBehavior: {
        //       AllowedMethods: ['GET'],
        //       TargetOriginId: `${cdns.Gallery.key}1`,
        //       ViewerProtocolPolicy: 'redirect-to-https'
        //     },
        //     Origins:[{
        //       Id: `${cdns.Gallery.key}Ori1`,
        //       ConnectionAttempts: 1,
        //       ConnectionTimeout: 1,
        //       DomainName: `${cdns.Gallery.target.name}.s3-website.sa-east-1.amazonaws.com`,
        //       S3OriginConfig: {
        //         OriginAccessIdentity : {Ref: 'DefaultOAI'}
        //       },
        //       //OriginAccessControlId: {"Ref": 'DefaultOAC'},
        //     }]
        //   }
        // }
      //},
      [cdns.Gallery.target.key + 'Policy']: {
            Type: "AWS::S3::BucketPolicy",
            Properties: {
                Bucket: cdns.Gallery.target.name,
                PolicyDocument: {
                    "Version": "2012-10-17",
                    "Statement": [{
                      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
                      "Effect": "Allow",
                      "Principal": {
                          "Service": "cloudfront.amazonaws.com"
                      },
                      "Action": ["s3:GetObject"],
                      "Resource": `arn:aws:s3:::${cdns.Gallery.target.name}/*`,
                      "Condition": {
                          "StringEquals": {
                              "AWS:SourceArn":  {"Fn::Sub":'arn:aws:cloudfront::${AWS::AccountId}:distribution/${' + cdns.Gallery.key + '}'}// {"Fn::GetAtt": [cdns.Gallery.key, 'Arn']}
                          }
                      }
                  }]
                }
            }
        }
    
    }
  }
};

module.exports = serverlessConfiguration;