import {  QueryCommand, AttributeValue} from '@aws-sdk/client-dynamodb';
import { IData, IFIlter, IPK } from './models';
import { clusterDate } from '../../libs/utils';
import { MESSAGES } from '../../libs/messages';
import { Base } from '../base';

export class Task extends Base<IPK, IData> {
    constructor(){
        super(process.env.tblTask)
    }

    protected pk2db(pk: IPK): Record<string, AttributeValue> {
        return {
            IdOwner:   {S:      pk.IdOwner},
            IdTask:    {S:      pk.IdTask },        
        }
    }
    protected mdl2db(mdl: IData): Record<string, AttributeValue> {
        return {
                ...this.pk2db(mdl),
                StartTime: {N:      mdl.StartTime.toString()},
                EndTime:   {N:      mdl.EndTime.toString()},
                GroupId:   {N:      mdl.GroupId.toString()},
                IsAllDay:  {BOOL:   mdl.IsAllDay},
                Subject:   {S:      mdl.Subject}
            }
    }
    protected db2mdl(itm: Record<string, AttributeValue>): IData {
        return {
            IdOwner:   itm.IdOwner.S,
            IdTask:    itm.IdTask.S,
            StartTime: Number.parseInt(itm.StartTime.N),
            EndTime:   Number.parseInt(itm.EndTime.N),
            GroupId:   Number.parseInt(itm.GroupId.N),
            IsAllDay:  itm.IsAllDay.BOOL,
            Subject:   itm.Subject.S
        }
    }


    private loadScenes = (d:number, id:string) => {
        const {day, week, month} = clusterDate(new Date(d));
        return [
            `D|${day}|${id}`,
            `W|${week}|${id}`,
            `M|${month}|${id}`,
            id
        ];
    }
    
    async get(pk:IPK){
        return super._get(pk)
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
                await super._post({...itm, IdOwner: scene});
            }
        }
    }

    async del (pks:IPK[]){

        for(const pk of pks)
        {
            const itm = await this.get(pk);
            
            if(itm){
                const scenes = this.loadScenes(itm.StartTime, itm.IdOwner);
                await Promise.all( scenes.map(scene=> super._del({ ...pk, IdOwner: scene })) );
            }
        }
    }

    async put(items:IData[]){
        //REMOVENDO A VERSÃO ANTERIOR            
        await this.del(  items );

        //CARREGANDO A NOVA VERSÃO
        await this.post(items)
    }

    async list(filter: IFIlter){
        const [DAY, WEEK, MONTH] = this.loadScenes(filter.DateRef, filter.IdOwner);
        const scene = {DAY, WEEK, MONTH}; 
        
        const {Items} = await this.ddb().send(new QueryCommand({
            TableName: this.tblName,
            KeyConditionExpression: 'IdOwner=:v1',
            ExpressionAttributeValues: {
                ":v1": {S: scene[filter.Scene]}, 
            },
        }));
        
        return Items.map(m=>this.db2mdl(m));
    }
}