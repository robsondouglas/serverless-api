import { randomUUID } from "crypto";
import { Schedule } from "./schedule";
import { IData } from "./models";
import { addTime } from "../../libs/utils";
import { MESSAGES } from "../../libs/messages";

describe('APP/SCHEDULE', ()=>{
    const schedule = new Schedule();
    const mockData = (IdOwner:string, AlertTime:number, Title:string, Message: string) : IData => ({
        IdOwner,
        AlertTime,
        Title,
        Message
    });
    
    it("POST", async()=>{
        const itm = mockData(randomUUID(), addTime(new Date(), 1).valueOf(), 'TESTE', 'Teste de inclusão');
        
        await expect(schedule.post([ {...itm, IdOwner: null} ])).rejects.toThrow(MESSAGES.SCHEDULE.REQUIREDS.POST.OWNER);
        await expect(schedule.post([ {...itm, AlertTime: null} ])).rejects.toThrow(MESSAGES.SCHEDULE.REQUIREDS.POST.ALERTTIME);
        await expect(schedule.post([ {...itm, Message: null} ])).rejects.toThrow(MESSAGES.SCHEDULE.REQUIREDS.POST.MESSAGE);
        await expect(schedule.post([ {...itm, Title: null} ])).rejects.toThrow(MESSAGES.SCHEDULE.REQUIREDS.POST.TITLE);
        
        await expect(schedule.post([ itm ])).resolves.not.toThrow();
    })

    it('GET', async()=>{
        const d = new Date()
        const itm = mockData(randomUUID(), new Date(Math.floor(d.valueOf()/60000)*60000).valueOf(), 'TESTE', 'Teste de leitura');
        await schedule.post([ itm ]);

        await expect(schedule.get({IdOwner: randomUUID(), AlertTime: itm.AlertTime})).resolves.toBeNull();
        await expect(schedule.get({IdOwner: itm.IdOwner, AlertTime: new Date(2022,0,1).valueOf()})).resolves.toBeNull();

        await expect(schedule.get({IdOwner: itm.IdOwner, AlertTime: itm.AlertTime})).resolves.toMatchObject(itm);
    });

    it('DELETE', async()=>{
        const itm = mockData(randomUUID(), new Date().valueOf(), 'TESTE', 'Teste de exclusão');
        await schedule.post([ itm ]);
        const {IdOwner, AlertTime} = itm;
        await expect(schedule.get({IdOwner, AlertTime})).resolves.not.toBeNull();
        await expect(schedule.del({IdOwner, AlertTime})).resolves.not.toThrow();
        await expect(schedule.get({IdOwner, AlertTime})).resolves.toBeNull();
    })
    
    
    it('LIST', async()=>{
        const alert = new Date(2023, 4, 1, 10, Math.round(Math.random()*59) ).valueOf();

        const itms = [
            mockData(randomUUID(), alert, 'TESTE1', 'Teste de listagem'),
            mockData(randomUUID(), alert, 'TESTE2', 'Teste de listagem'),
            mockData(randomUUID(), alert, 'TESTE3', 'Teste de listagem')
        ];
        await schedule.post(itms);
        const ls = await schedule.list({AlertTime: alert})
        expect(ls).toHaveLength( 3 );

    });
});