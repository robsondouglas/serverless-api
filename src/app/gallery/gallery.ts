import { AttributeValue, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { IData, IFIlter, IPK } from "./models";
import { MESSAGES } from "../../libs/messages";
import { Base } from "../base";


export class Gallery extends Base<IPK, IData>{
    
    constructor(){
        super(process.env.tblGallery);
    }
    
    protected pk2db = (pk:IPK) => ({
        IdOwner:   {S:      pk.IdOwner},
        IdPicture: {S:      pk.IdPicture },
    })

    protected mdl2db = (mdl:IData):Record<string, AttributeValue>=>({
        ...this.pk2db(mdl),
        DateAdd:   {N:      (new Date()).valueOf().toString()},
        Title:     {S:      mdl.Title}
    });

    protected db2mdl = (itm:any)=>({
        IdOwner:    itm.IdOwner.S,
        IdPicture:  itm.IdPicture.S,
        DateAdd:    new Date( Number.parseInt(itm.DateAdd.N) ),
        Title:      itm.Title.S
    });

    async get(pk:IPK){
        return super._get(pk)
    }

    async post(items:IData[]){        
        for(const itm of items)
        {
            if(!itm.IdOwner)
            { throw new Error(MESSAGES.GALLERY.REQUIREDS.POST.OWNER) }
            
            
            if(!itm.Title)
            { throw new Error(MESSAGES.GALLERY.REQUIREDS.POST.TITLE) }
            

            await super._post(itm);
        }
    }

    async del (pk:IPK){
        await super._del(pk);
    }

    async put(item:IData){
        await this.ddb().send( new UpdateItemCommand({
            TableName: this.tblName,
            Key: this.pk2db(item),
            UpdateExpression: "SET Title = :V1",
            ExpressionAttributeValues: {":V1": {S: item.Title}}
        }));
    }

    async list(filter: IFIlter){
        const {Items} = await this.ddb().send(new QueryCommand({
            TableName: this.tblName,
            KeyConditionExpression: 'IdOwner=:v1',
            ExpressionAttributeValues: {
                ":v1": {S: filter.IdOwner}, 
            },
            IndexName: `${this.tblName}_IDX_DATE`,
            ScanIndexForward : false
        }));

        return Items.map(m=>this.db2mdl(m));
    }
}