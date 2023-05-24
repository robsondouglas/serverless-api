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
import { downloadFile, enqueue, moveFile, resizeImage, sendChromeNotification, uploadFile } from '../libs/utils';
import { Schedule } from './schedule/schedule';
import { Subscription } from './subscription/subscription';

const sqsSchedule = process.env.sqsSchedule;

export class App{
    
    async addTask(items:ITaskData[]){
        const task = new Task();
        await task.post(items);
        
        const sch = new Schedule();

        sch.post(items.map(m=>({ AlertTime: m.StartTime - 60000,  IdOwner: m.IdOwner, Title: 'LEMBRETE DE REUNIÃO', Message: `Reunião ${m.Subject} em breve`  })))
        
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
        const res: Promise<void>[]= []
        for(const item of items)
        {
            const sub = new Subscription();
                const s = await sub.get({ IdOwner: item.IdOwner, Channel: 'PUSH-CHROME', IdTopic: 'TASK' })
                if(s)
                { await sendChromeNotification(JSON.parse(s.Subscription), item.Title, item.Message) }    
        }

        await Promise.all(res);
    }

    async addImage(items:IGalleryData[]){        
         const glr = new Gallery();
         
         glr.post( items )
         for(const item of items)
         {  await moveFile(item.IdPicture, `original/${item.IdPicture}`); }
    }

    listImages(filter: IGalleryFilter){
        const glr = new Gallery();
        return glr.list(filter); 
    }

    async processImage(path:string){
        const h = [150, 900];   //thumb, full
        const w = [ 200, 1200]  //thumb, full
        
        const f = await downloadFile(path);
        const arq = path.split('/')[1];
    
        await resizeImage(f, h[0], w[0]).then( f => uploadFile(`thumbs/${arq}`, f) ),
        await resizeImage(f, h[1], w[1]).then( f => uploadFile(`photos/${arq}`, f) )
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