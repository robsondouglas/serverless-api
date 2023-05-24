import { AttributeValue, QueryCommand } from "@aws-sdk/client-dynamodb";
import { Base } from "../base";
import { IData, IFIlter, IPK } from "./models";
import { randomUUID } from "crypto";
export class Subscription extends Base<IPK, IData>{
    
    constructor(){
        super(process.env.tblSubscribe);
    }
    
    protected pk2db = (pk:IPK) => ({
        IdTopic:        {S: pk.IdTopic},
        IdSubscription: {S: `${pk.Channel}|${pk.IdOwner}|${ randomUUID() }`}
    })

    protected mdl2db = (mdl:IData):Record<string, AttributeValue>=>({
        ...this.pk2db(mdl),
        DateRef:        {N:   mdl.DateRef.toString()},
        Subscription:   {S:   mdl.Subscription},
    });

    protected db2mdl = (itm:any):IData=>{
        const [Channel, IdOwner, IdSubscription] = itm.IdSubscription.S.split('|'); 
        return {
            IdTopic:        itm.IdTopic.S,
            IdOwner,
            Channel,  
            IdSubscription,
            DateRef:        Number.parseInt(itm.DateRef.N),
            Subscription:   itm.Subscription.S
        }
    };

    async get(pk:IPK){
        return super._get(pk)
    }

    async post(items:IData[]){        
        for(const itm of items)
        { await super._post(itm); }
    }

    async del (pk:IPK){
        await super._del(pk);
    }

    async list(filter: IFIlter){
        const {Items} = await this.ddb().send(new QueryCommand({
            TableName: this.tblName,
            KeyConditionExpression: 'IdTopic=:v1',
            ExpressionAttributeValues: {
                ":v1": {S: filter.IdTopic}, 
            }
        }));

        return Items.map(m=>this.db2mdl(m));
    }
}