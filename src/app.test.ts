import { randomUUID } from "crypto";
import { App } from "./app";
import { addTime, flatDate } from "./libs/utils";
import axios from "axios";

describe('APP', ()=>{
    const app = new App();

    const mockData = (d:Date, grps:number, owner) => ({
        IdOwner: owner,
        Day: d,
        Tasks: Array.from({length: grps}).map((_, idx)=>(
            {
                IdTask: randomUUID(),
                StartTime: addTime(d, 9+idx),
                EndTime:   addTime(d, 9+idx, 30),
                GroupId:   idx+1,
                IsAllDay:  false,
                Subject:   `TESTE ${idx}`  
            }
        ))
    });
      
    
    it('ADD_TASK_BATCH', async()=>{
        const mock = mockData(flatDate(new Date()), 3, randomUUID());
        expect(app.addTaskBatch(mock)).resolves.not.toThrow();
    });

    it('ADD_TASK', async()=>{
        const d = flatDate(new Date())
        const owner = randomUUID();
        await app.addTask({
            IdOwner:   owner,
            IdTask:    randomUUID(),
            StartTime: addTime(d, 9),
            EndTime:   addTime(d, 9, 30),
            GroupId:   1,
            IsAllDay:  false,
            Subject:   `TESTE 1`  
        })

        await app.addTask({
            IdOwner:   owner,
            IdTask:    randomUUID(),
            StartTime: addTime(d, 12),
            EndTime:   addTime(d, 13, 30),
            GroupId:   1,
            IsAllDay:  false,
            Subject:   `TESTE 2`  
        });

        const res = await app.getTask({IdOwner: owner, Day: d});

        expect(res.Tasks).toHaveLength(2);

    })

    it('GET_TASK', async()=>{
        const mock = mockData(flatDate(new Date()), 3, randomUUID());
        await app.addTaskBatch(mock);
        const res = await app.getTask({IdOwner: mock.IdOwner, Day: mock.Day});
        
        expect(res).toMatchObject(mock);
        //expect().resolves.toMatchObject(expected);
    });

    it('LIST_TASK', async()=>{
        const owners = [randomUUID(), randomUUID()];
        const mocks = [
            mockData(flatDate(new Date(2023, 4, 2)), 3, owners[0]),
            mockData(flatDate(new Date(2023, 4, 2)), 4, owners[1]),
            mockData(flatDate(new Date(2023, 4, 3)), 5, owners[0]),
            mockData(flatDate(new Date(2023, 4, 3)), 6, owners[1]),
            
            mockData(flatDate(new Date(2023, 4, 9)), 2, owners[0]),
            mockData(flatDate(new Date(2023, 4, 9)), 2, owners[1]),
        ]

        await Promise.all( mocks.map(m=>app.addTaskBatch(m)));

        const ls = await app.listTasks({IdOwner:owners[0], minDate: new Date(2023, 4, 2), maxDate:new Date(2023, 4, 3)})

        expect(ls).toHaveLength(2);
    });

    it('REQUEST_UPLOAD_IMG', async()=>{
        const url = await app.requestPostImage()
        console.log(url)
        expect(1).toBe(1);
    })

    it('ADD_IMG', async()=>{
        const {id, url} = await app.requestPostImage();
        
        await axios.post(url, {data: 'TESTE'}, { headers: { 'Content-Type': 'text/txt'}});

        console.log(id)        

        expect(1).toBe(1);
    })



});        
