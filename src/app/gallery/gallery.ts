import { AttributeValue, DeleteItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { IData, IFIlter, IPK } from "./models";
import { MESSAGES } from "../../libs/messages";

const ddb = new DynamoDBClient({ region: "local", endpoint: "http://localhost:8000"  });
const tblGallery = process.env.tblGallery;

export class Gallery{
    private pk2db = (pk:IPK) => ({
        IdOwner:   {S:      pk.IdOwner},
        IdPicture: {S:      pk.IdPicture },
    })

    private mdl2db = (mdl:IData):Record<string, AttributeValue>=>({
        ...this.pk2db(mdl),
        DateAdd:   {N:      mdl.DateAdd.valueOf().toString()},
        Title:     {S:      mdl.Title},
        Url:       {S:      mdl.Url}
    });

    private db2mdl = (itm:any)=>({
        IdOwner:    itm.IdOwner.S,
        IdPicture:  itm.IdPicture.S,
        DateAdd:    new Date( Number.parseInt(itm.DateAdd.N) ),
        Title:      itm.Title.S,
        Url:        itm.Url.S
    });

    async get(pk:IPK){
        const {Item} = await ddb.send( new GetItemCommand({
            TableName: tblGallery,
            Key: this.pk2db(pk)          
        }));
        
        return Item ? this.db2mdl(Item) : null;
    }

    async post(items:IData[]){        
        for(const itm of items)
        {
            if(!itm.IdOwner)
            { throw new Error(MESSAGES.GALLERY.REQUIREDS.POST.OWNER) }
            
            if(!itm.DateAdd)
            { throw new Error(MESSAGES.GALLERY.REQUIREDS.POST.DATEADD) }
            
            
            if(!itm.Title)
            { throw new Error(MESSAGES.GALLERY.REQUIREDS.POST.TITLE) }

            if(!itm.Url)
            { throw new Error(MESSAGES.GALLERY.REQUIREDS.POST.URL) }

            
            await ddb.send( new PutItemCommand({
                TableName: tblGallery,
                Item: this.mdl2db(itm)
            }));
        }
    }

    async del (pk:IPK){
        await ddb.send( new DeleteItemCommand({
            TableName: tblGallery,
            Key: this.pk2db(pk)                     
        }));
    }

    async put(item:IData){
        await ddb.send( new UpdateItemCommand({
            TableName: tblGallery,
            Key: this.pk2db(item),
            UpdateExpression: "SET Title = :V1",
            ExpressionAttributeValues: {":V1": {S: item.Title}}
        }));
    }

    async list(filter: IFIlter){
        const {Items} = await ddb.send(new QueryCommand({
            TableName: tblGallery,
            KeyConditionExpression: 'IdOwner=:v1',
            ExpressionAttributeValues: {
                ":v1": {S: filter.IdOwner}, 
            },
            IndexName: `${tblGallery}_IDX_DATE`,
            ScanIndexForward : false
        }));

        return Items.map(m=>this.db2mdl(m));
    }
}