//import {DeleteItemCommand, DeleteItemCommandInput, DynamoDBClient, GetItemCommand, GetItemCommandInput, PutItemCommand, PutItemCommandInput, QueryCommand, QueryCommandInput} from '@aws-sdk/client-dynamodb';
import { TextEncoder } from 'util';
import { IData as ITaskData, IPK as ITaskPK, IFIlter as ITaskFilter } from './task/models';
import { Task } from './task/task';
import { IData as IGalleryData, IPK as IGalleryPK, IFIlter as IGalleryFilter } from './gallery/models'
import { Gallery } from './gallery/gallery';

import {
    ApiGatewayManagementApiClient,
    PostToConnectionCommand,
  } from "@aws-sdk/client-apigatewaymanagementapi";
import { moveFile } from 'src/libs/utils';
import { Schedule } from './schedule/schedule';

const client = new ApiGatewayManagementApiClient({ endpoint: 'http://localhost:3001' });

export class App{
    
    async addTask(itm:ITaskData[]){
        const task = new Task();
        await task.post(itm);
        
        const enc = new TextEncoder();
        const cmd = new PostToConnectionCommand({ ConnectionId: undefined, Data: enc.encode(JSON.stringify(itm)) });
        await client.send(cmd);        
    }

    async getTask(pk:ITaskPK){
        const task = new Task();
        await task.get(pk);
    }

    async listTasks(filter: ITaskFilter){
        const task = new Task();
        await task.list(filter);
    }
    
    async deleteTask(key:ITaskPK){
        const task = new Task();
        await task.del(key);
    }

    async runScheduleds(){
        const schd = new Schedule();
        await schd.list({AlertTime: new Date()});
    }

    async addImage(items:IGalleryData[]){        
         const glr = new Gallery();
         glr.post( items )
         for(const item of items)
         { await moveFile(item.IdPicture, `photo/${item.IdPicture}`); }
    }

    async listImages(filter: IGalleryFilter){
        const glr = new Gallery();
        glr.list(filter); 
    }
    
    async deleteImage(key: IGalleryPK){
        const glr = new Gallery();
        glr.del(key);
    }
}