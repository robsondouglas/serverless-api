import {execSQS} from './handler'
describe('HANDLER', ()=>{
    it('SQS', async()=>{
        execSQS({
            "Records": [
                {
                    "messageId": "d051ba27-1de8-4b54-87fb-a40673a27759",
                    "receiptHandle": "AQEBJK5zZ++z8IKL1lf9wDI4g6qd/zN6TRBmCU7Wfg2wvGjeoGB1m+fzoTiBY9mefsU3qEC79x1LHluoV8EWkJNJJE8rjg5CsB7N5otFiGaErMtATC2kjzNgm/5VgczkC6WX+B7CA8X1giw9330sHCRBGu/x28ealo1MYXktdyDHXvjJ8uUauQ94GJXvj36rqaYs9Rj9LR2MAzADvoU3rZEzkRU99yrXb6MHM2t/OgJowIEMJwbpMwcnzW1WB6I6XTeFerqjHAh7uQayU+I5rDlbdLaJGPV+XzY8tBM7craqVbBetJlZCI7R9jt2o3IkKuM80hLW31D+k125QfyeLtUHHznP+gux9220e0MqBOiPBvSwRhoKcqn9D3gsqE5JCm74gF5Ce6xwzddGTJRLZilK4g==",
                    "body": "{\"AlertTime\":1685022960000,\"IdOwner\":\"0165b018-1f9f-4eef-85b7-b6a0f7951320\",\"Message\":\"Reunião Add title em breve\",\"Title\":\"LEMBRETE DE REUNIÃO\"}",
                    "attributes": {
                        "ApproximateReceiveCount": "1",
                        "AWSTraceHeader": "Root=1-646f68f6-29168d517efd3a056d14b505;Parent=678c8388376f339d;Sampled=0;Lineage=575990a1:0",
                        "SentTimestamp": "1685022967069",
                        "SenderId": "AROA32YSLVLSKQWP6H4AA:taskmanager-DEV-enqueueSchedules",
                        "ApproximateFirstReceiveTimestamp": "1685022967084"
                    },
                    "messageAttributes": {},
                    "md5OfMessageAttributes": null,
                    "md5OfBody": "e10bfac040ceb0d9ae39a54ed87c1905",
                    "eventSource": "aws:sqs",
                    "eventSourceARN": "arn:aws:sqs:sa-east-1:813397945060:tskScheduleDEV",
                    "awsRegion": "sa-east-1"
                }
            ]
        }, (app, body)=>console.log(app, body));
        
        expect(1).toBe(1);
    })
    
})