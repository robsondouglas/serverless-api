import { randomUUID } from "crypto";
import { IData } from "./models";
import { Task } from "./task"
import { addTime } from "../../libs/utils";
import { MESSAGES } from "../../libs/messages";

describe('APP/TASK', ()=>{
    const task = new Task();
    const mockData = (owner:string, start:Date, title:string) : IData => ({
        IdOwner: owner,
        IdTask: randomUUID(),
        StartTime: start.valueOf(),   
        EndTime:   addTime(start, 0, 30).valueOf(),
        GroupId:   1,
        IsAllDay:  false,
        Subject:   title
    });
    
        
    it('POST',async()=>{
        const itm = mockData(randomUUID(), addTime(new Date(), 1), 'TESTE');
        
        expect(task.post([ {...itm, IdOwner: null} ])).rejects.toThrow(MESSAGES.TASK.REQUIREDS.POST.OWNER);
        expect(task.post([ {...itm, StartTime: null} ])).rejects.toThrow(MESSAGES.TASK.REQUIREDS.POST.STARTTIME);
        expect(task.post([ {...itm, EndTime: null} ])).rejects.toThrow(MESSAGES.TASK.REQUIREDS.POST.ENDTIME);
        expect(task.post([ {...itm, Subject: null} ])).rejects.toThrow(MESSAGES.TASK.REQUIREDS.POST.SUBJECT);        
        expect(task.post([ {...itm, StartTime: addTime(itm.StartTime, -1).valueOf()} ])).rejects.toThrow(MESSAGES.TASK.RULES.POST.MINIMAL_START);
        expect(task.post([ {...itm, EndTime: addTime(itm.StartTime, -1).valueOf()} ])).rejects.toThrow(MESSAGES.TASK.RULES.POST.START_END);        

        expect(task.post([ itm ])).resolves.not.toThrow();
    });

    it('GET', async()=>{
        const itm = mockData(randomUUID(), addTime(new Date(), 1), 'TESTE');
        await task.post([ itm ]);

        expect(task.get({IdOwner: randomUUID(), IdTask: itm.IdTask})).resolves.toBeNull();
        expect(task.get({IdOwner: itm.IdOwner, IdTask: randomUUID()})).resolves.toBeNull();

        expect(task.get({IdOwner: itm.IdOwner, IdTask: itm.IdTask})).resolves.toMatchObject(itm);
    });

    it('DELETE', async()=>{
        const itm = mockData(randomUUID(), addTime(new Date(), 1), 'TESTE');
        await task.post([ itm ]);
        const {IdOwner, IdTask} = itm;
        await expect(task.get({IdOwner, IdTask})).resolves.not.toBeNull();
        await expect(task.del([{IdOwner, IdTask}])).resolves.not.toThrow();
        await expect(task.get({IdOwner, IdTask})).resolves.toBeNull();
        await expect(task.list({IdOwner, Scene: 'MONTH', DateRef: new Date().valueOf()})).resolves.toHaveLength(0);
        await expect(task.list({IdOwner, Scene: 'WEEK', DateRef: new Date().valueOf()})).resolves.toHaveLength(0);
        await expect(task.list({IdOwner, Scene: 'DAY', DateRef: new Date().valueOf()})).resolves.toHaveLength(0);
    })
    
    it('PUT', async()=>{
        const itm = mockData(randomUUID(), addTime(new Date(), 1), 'TESTE');
        await task.post([ itm ]);        
        await expect(task.put([ {...itm, Subject: 'TESTE 2'} ])).resolves.not.toThrow();
        await expect(task.get({IdOwner: itm.IdOwner, IdTask: itm.IdTask})).resolves.toMatchObject({Subject: 'TESTE 2'});        
    });
    
    it('LIST', async()=>{
        const owner = randomUUID();
        const [_y, _m, _d] = [2023, 5, 1];
        const itms = [
            mockData(owner, new Date(_y, _m, _d, 10), 'TESTE'),
            mockData(owner, new Date(_y, _m, _d, 11), 'TESTE'),
            mockData(owner, new Date(_y, _m, _d+1, 12), 'TESTE'),
            
            mockData(owner, new Date(_y, _m, _d+4, 10), 'TESTE'),
            mockData(owner, new Date(_y, _m, _d+4, 11), 'TESTE'),
            mockData(owner, new Date(_y, _m, _d+4, 12), 'TESTE'),

            mockData(owner, new Date(_y, _m+1, _d, 10), 'TESTE'),
            mockData(owner, new Date(_y, _m+1, _d, 11), 'TESTE'),
            mockData(owner, new Date(_y, _m+1, _d+1, 12), 'TESTE'),
            
            mockData(owner, new Date(_y, _m+1, _d+4, 10), 'TESTE'),
            mockData(owner, new Date(_y, _m+1, _d+4, 11), 'TESTE'),
            mockData(owner, new Date(_y, _m+1, _d+4, 12), 'TESTE'),

        ];
        await task.post(itms);
        
        await expect(task.list({IdOwner: owner, Scene: 'MONTH', DateRef: new Date(_y, _m, _d).valueOf()})).resolves.toHaveLength( 6 );
        await expect(task.list({IdOwner: owner, Scene: 'WEEK',  DateRef: new Date(_y, _m, _d).valueOf()})).resolves.toHaveLength( 3 );
        await expect(task.list({IdOwner: owner, Scene: 'DAY',   DateRef: new Date(_y, _m, _d).valueOf()})).resolves.toHaveLength( 2 );
        
        await expect(task.list({IdOwner: owner, Scene: 'MONTH', DateRef: new Date(_y, _m+1, _d).valueOf()})).resolves.toHaveLength( 6 );
        await expect(task.list({IdOwner: owner, Scene: 'WEEK',  DateRef: new Date(_y, _m+1, _d).valueOf()})).resolves.toHaveLength( 2 );
        await expect(task.list({IdOwner: owner, Scene: 'DAY',   DateRef: new Date(_y, _m+1, _d).valueOf()})).resolves.toHaveLength( 2 );
        

    });

})