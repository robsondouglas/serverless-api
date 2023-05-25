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
    
    async deleteTask(key:ITaskPK[]){
        const task = new Task();
        await task.del(key);
    }

    async enqueueSchedules(){
        const schd = new Schedule();
        const alerts = await schd.list({AlertTime: new Date().valueOf()});
        console.log(alerts);
        for(const alert of alerts)
        {  
            console.log(alert)
            await enqueue( sqsSchedule, alert );
            await schd.del(alert);
        }
    }

    async runSchedules(item:IScheduleData){
        
            const sub = new Subscription();
            const ls = await sub.list({ IdOwner: item.IdOwner, Channel: 'PUSH-CHROME', IdTopic: 'TASK' })
            for(const s of ls)
            { await sendChromeNotification(JSON.parse(s.Subscription), item.Title, item.Message) }    
        
    }

    async addImage(items:IGalleryData[]){        
         const glr = new Gallery();
         console.log('imagens', items)
         await glr.post( items )
         await Promise.all(items.map( item => moveFile(item.IdPicture, `original/${item.IdPicture}`) ))
         
    }

    listImages(filter: IGalleryFilter){
        const glr = new Gallery();
        return glr.list(filter); 
    }

    async processImage(path:string){
        const h = [150, 900];   //thumb, full
        const w = [ 200, 1200]  //thumb, full
        
        try{
            const f = await downloadFile(path);
            console.log('Download concluído')
            const arq = path.split('/')[1];
            
            await uploadFile(`thumbs/${arq}`, await resizeImage(f, h[0], w[0]));
            await uploadFile(`photos/${arq}`, await resizeImage(f, h[1], w[1]));
        }
        catch(ex){
            console.log('Falha ao processar a imagem', ex)
            throw ex;
        }
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