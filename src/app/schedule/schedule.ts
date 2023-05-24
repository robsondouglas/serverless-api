import { AttributeValue, QueryCommand } from "@aws-sdk/client-dynamodb";
import { IData, IFilter, IPK } from "./models";
import { MESSAGES } from "../../libs/messages";
import { Base } from "../base";

export class Schedule extends Base<IPK, IData>{
    constructor(){
        super(process.env.tblSchedule);
    }
    protected pk2db = (pk:IPK):Record<string, AttributeValue> => ({
        AlertTime:   {N:  (Math.floor(pk.AlertTime.valueOf()/60000)*60000).toString()},
        IdOwner:     {S:  pk.IdOwner}
    })

    protected mdl2db = (mdl:IData):Record<string, AttributeValue>=>({
        ...this.pk2db(mdl),
        Message:  {S: mdl.Message},
        Title:    {S: mdl.Title},
    });
   
    protected db2mdl = (itm:any):IData=>({
        AlertTime:  Number.parseInt(itm.AlertTime.N),
        IdOwner:  itm.IdOwner.S,
        Message:  itm.Message.S,
        Title:    itm.Title.S
    });

    get(pk:IPK){
        return super._get(pk)
    }

    async post(items:IData[]){        
        for(const itm of items)
        {
            if(!itm.AlertTime)
            { throw new Error(MESSAGES.SCHEDULE.REQUIREDS.POST.ALERTTIME) }
            
            if(!itm.IdOwner)
            { throw new Error(MESSAGES.SCHEDULE.REQUIREDS.POST.OWNER) }
            
            if(!itm.Title)
            { throw new Error(MESSAGES.SCHEDULE.REQUIREDS.POST.TITLE) }

            if(!itm.Message)
            { throw new Error(MESSAGES.SCHEDULE.REQUIREDS.POST.MESSAGE) }

            await super._post(itm);
        }
    }

    async del (pk:IPK){
        await super._del(pk)
    }

    async list(filter: IFilter){
        const {Items} = await this.ddb().send(new QueryCommand({
            TableName: this.tblName,
            KeyConditionExpression: 'AlertTime=:v1',
            ExpressionAttributeValues: {
                ":v1": {N: (Math.floor(filter.AlertTime.valueOf()/60000)*60000).toString()}, 
            }
        }));

        return Items.map(m=>this.db2mdl(m));
    }
}