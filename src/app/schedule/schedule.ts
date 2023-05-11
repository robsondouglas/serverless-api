import { AttributeValue, DeleteItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { IData, IFilter, IPK } from "./models";
import { MESSAGES } from "../../libs/messages";

const ddb = new DynamoDBClient({ region: "local", endpoint: "http://localhost:8000"  });
const tblSchedule = process.env.tblSchedule;

export class Schedule{
    private pk2db = (pk:IPK):Record<string, AttributeValue> => ({
        AlertTime:   {N:  (Math.floor(pk.AlertTime.valueOf()/60000)*60000).toString()},
        IdOwner:     {S:  pk.IdOwner}        
    })

    private mdl2db = (mdl:IData):Record<string, AttributeValue>=>({
        ...this.pk2db(mdl),
        Message:     {S: mdl.Message},
        Channels:    {L: mdl.Channels.map(m=> ({M: { Name: {S: m.Name}, Contacts: {SS: m.Contacts} }}) )},
    });
   
    private db2mdl = (itm:any):IData=>({
        AlertTime:  new Date(Number.parseInt(itm.AlertTime.N)),
        IdOwner:    itm.IdOwner.S,
        Message:    itm.Message.S,
        Channels:   itm.Channels.L.map( ({M:m})=> ({ Name: m.Name.S, Contacts: m.Contacts.SS }) )
    });


    async get(pk:IPK){
        const {Item} = await ddb.send( new GetItemCommand({
            TableName: tblSchedule,
            Key: this.pk2db(pk)          
        }));
        
        return Item ? this.db2mdl(Item) : null;
    }

    async post(items:IData[]){        
        for(const itm of items)
        {
            if(!itm.AlertTime)
            { throw new Error(MESSAGES.SCHEDULE.REQUIREDS.POST.ALERTTIME) }
            
            if(!itm.IdOwner)
            { throw new Error(MESSAGES.SCHEDULE.REQUIREDS.POST.OWNER) }
            
        
            if(!itm.Message)
            { throw new Error(MESSAGES.SCHEDULE.REQUIREDS.POST.MESSAGE) }

            if(!itm.Channels || itm.Channels.length === 0)
            { throw new Error(MESSAGES.SCHEDULE.REQUIREDS.POST.CHANNELS) }

            await ddb.send( new PutItemCommand({
                TableName: tblSchedule,
                Item: this.mdl2db(itm)
            }));
        }
    }

    async del (pk:IPK){
        await ddb.send( new DeleteItemCommand({
            TableName: tblSchedule,
            Key: this.pk2db(pk)
        }));
    }

    async list(filter: IFilter){
        const {Items} = await ddb.send(new QueryCommand({
            TableName: tblSchedule,
            KeyConditionExpression: 'AlertTime=:v1',
            ExpressionAttributeValues: {
                ":v1": {N: (Math.floor(filter.AlertTime.valueOf()/60000)*60000).toString()}, 
            }
        }));

        return Items.map(m=>this.db2mdl(m));
    }
}