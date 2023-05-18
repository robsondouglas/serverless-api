//import {DeleteItemCommand, DeleteItemCommandInput, DynamoDBClient, GetItemCommand, GetItemCommandInput, PutItemCommand, PutItemCommandInput, QueryCommand, QueryCommandInput} from '@aws-sdk/client-dynamodb';
import { IData as ITaskData, IPK as ITaskPK, IFIlter as ITaskFilter } from './task/models';
import { Task } from './task/task';
import { IData as IGalleryData, IPK as IGalleryPK, IFIlter as IGalleryFilter } from './gallery/models'
import { IData as ISubData, IPK as ISubPK } from './subscription/models'
import { Gallery } from './gallery/gallery';
import { IData as IScheduleData } from './schedule/models';
// import {
//     ApiGatewayManagementApiClient,
//   } from "@aws-sdk/client-apigatewaymanagementapi";
import { enqueue, moveFile, sendChromeNotification } from '../libs/utils';
import { Schedule } from './schedule/schedule';
import { Subscription } from './subscription/subscription';

//const client = new ApiGatewayManagementApiClient({ endpoint: 'http://localhost:3001' });
const sqsSchedule = process.env.sqsSchedule;

export class App{
    
    async addTask(items:ITaskData[]){
        const task = new Task();
        await task.post(items);
        
        const sch = new Schedule();

        sch.post(items.map(m=>({ AlertTime: m.StartTime - 60000, Channels: [{ Name: 'SMS', Contacts: ['5521972648981'] }], IdOwner: m.IdOwner, Message: `Reunião ${m.Subject} em 1 min.`  })))
        
        // const enc = new TextEncoder();
        // const cmd = new PostToConnectionCommand({ ConnectionId: undefined, Data: enc.encode(JSON.stringify(itm)) });
        // await client.send(cmd);        
    }

    getTask(pk:ITaskPK){
        const task = new Task();
        return task.get(pk);
    }

    listTasks(filter: ITaskFilter){
        const task = new Task();
        return task.list(filter);
    }
    
    async deleteTask(key:ITaskPK){
        const task = new Task();
        await task.del(key);
    }

    async enqueueSchedules(){
        const schd = new Schedule();
        const alerts = await schd.list({AlertTime: new Date().valueOf()});
        for(const alert of alerts)
        {  
            await enqueue( sqsSchedule, alert );
            await schd.del(alert);
        }
    }

    async runSchedules(items:IScheduleData[]){
        const handle = {
            // 'SMS': sendSMS,
            // 'WHATSAPP': sendWhatsApp,
            //'EMAIL': (IdOwner:string, contact:string, title:string, msg:string) => sendEmail( contact, title, msg ),
            'PUSH_CHROME': async(IdOwner:string, contact:string, title, msg)=> {
                const sub = new Subscription();
                const s = await sub.get({ IdOwner, IdTopic: contact === 'TASK' ? 'TASK' : 'ALBUM' })
                if(s)
                { await sendChromeNotification(JSON.parse(s.Subscription), title, msg) }
            }
        }
        
        const res: Promise<void>[]= []
        for(const item of items)
        {
            for(const channel of item.Channels)
            {
                for(const contact of channel.Contacts)
                { res.push(handle[channel.Name]?.(item.IdOwner, contact, 'LEMBRETE DE REUNIÃO', item.Message)) }
            }
        }

        await Promise.all(res);
    }

    async addImage(items:IGalleryData[]){        
         const glr = new Gallery();
         glr.post( items )
         for(const item of items)
         { await moveFile(item.IdPicture, `photo/${item.IdPicture}`); }
    }

    listImages(filter: IGalleryFilter){
        const glr = new Gallery();
        return glr.list(filter); 
    }
    
    async deleteImage(key: IGalleryPK){
        const glr = new Gallery();
        await glr.del(key);
    }

    async subscribe(itm:ISubData){
        const sub = new Subscription();
        await sub.post( [itm] );
    }

    async unsubscribe(pk:ISubPK){
        const sub = new Subscription();
        await sub.del( pk );
    }



}