import { DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand, DeleteItemCommand} from '@aws-sdk/client-dynamodb';
import { IData, IFIlter, IPK } from './models';
import { clusterDate } from '../../libs/utils';
import { MESSAGES } from '../../libs/messages';

const ddb = new DynamoDBClient({ region: "local", endpoint: "http://localhost:8000"  });
const tblTask = process.env.tblTask;

export class Task{

    private mdl2db = (mdl:any)=>({
        IdOwner:   {S:      mdl.IdOwner},
        IdTask:    {S:      mdl.IdTask },
        StartTime: {N:      mdl.StartTime.valueOf().toString()},
        EndTime:   {N:      mdl.EndTime.valueOf().toString()},
        GroupId:   {N:      mdl.GroupId.toString()},
        IsAllDay:  {BOOL:   mdl.IsAllDay},
        Subject:   {S:      mdl.Subject}
    });

    private db2mdl = (itm:any)=>({
        IdOwner:   itm.IdOwner.S,
        IdTask:    itm.IdTask.S,
        StartTime: new Date( Number.parseInt(itm.StartTime.N) ),
        EndTime:   new Date( Number.parseInt(itm.EndTime.N) ),
        GroupId:   Number.parseInt(itm.GroupId.N),
        IsAllDay:  itm.IsAllDay.BOOL,
        Subject:   itm.Subject.S
    });

    private loadScenes = (d:Date, id:string) => {
        const {day, week, month} = clusterDate(d);
        return [
            `D|${day}|${id}`,
            `W|${week}|${id}`,
            `M|${month}|${id}`,
            id
        ];
    }
    
    async get(key:IPK){
        const {Item} = await ddb.send( new GetItemCommand({
            TableName: tblTask,
            Key: {  
                IdOwner:  {S: key.IdOwner},
                IdTask:   {S: key.IdTask}
            }             
        }));
        
        return Item ? this.db2mdl(Item) : null;
    }

    async post(items:IData[]){        
        for(const itm of items)
        {
            if(!itm.IdOwner)
            { throw new Error(MESSAGES.TASK.REQUIREDS.POST.OWNER) }
            
            if(!itm.StartTime)
            { throw new Error(MESSAGES.TASK.REQUIREDS.POST.STARTTIME) }
            
            if(!itm.EndTime)
            { throw new Error(MESSAGES.TASK.REQUIREDS.POST.ENDTIME) }

            if(!itm.Subject)
            { throw new Error(MESSAGES.TASK.REQUIREDS.POST.SUBJECT) }

            if(itm.StartTime.valueOf() <= (new Date()).valueOf())
            { throw new Error(MESSAGES.TASK.RULES.POST.MINIMAL_START) }
            
            if(itm.StartTime.valueOf() >= itm.EndTime.valueOf())
            { throw new Error(MESSAGES.TASK.RULES.POST.START_END) }
            

            const scenes = this.loadScenes(itm.StartTime, itm.IdOwner);
            
            for(const scene of scenes){
                await ddb.send( new PutItemCommand({
                    TableName: tblTask,
                    Item: this.mdl2db({...itm, IdOwner: scene})
                }));
            }
            
        }
    }

    async del (key:IPK){
        const itm = await this.get(key);
        
        if(itm){
            const scenes = this.loadScenes(itm.StartTime, itm.IdOwner);
                
            for(const scene of scenes){
                await ddb.send( new DeleteItemCommand({
                    TableName: tblTask,
                    Key: {  
                        IdOwner:  {S: scene},
                        IdTask:   {S: key.IdTask}
                    }
                }));
            }       
        }
    }

    async put(items:IData[]){        
        //REMOVENDO A VERSÃO ANTERIOR            
        for(const itm of items)
        { await this.del(itm); }

        //CARREGANDO A NOVA VERSÃO
        await this.post(items)
    }

    async list(filter: IFIlter){
        const [DAY, WEEK, MONTH] = this.loadScenes(filter.DateRef, filter.IdOwner);
        const scene = {DAY, WEEK, MONTH}; 
        
        const {Items} = await ddb.send(new QueryCommand({
            TableName: tblTask,
            KeyConditionExpression: 'IdOwner=:v1',
            ExpressionAttributeValues: {
                ":v1": {S: scene[filter.Scene]}, 
            },
        }));

        return Items.map(m=>this.db2mdl(m));
    }
}