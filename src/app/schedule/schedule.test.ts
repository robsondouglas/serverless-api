import { randomUUID } from "crypto";
import { Schedule } from "./schedule";
import { IData } from "./models";
import { addTime } from "../../libs/utils";
import { MESSAGES } from "../../libs/messages";

describe('APP/SCHEDULE', ()=>{
    const schedule = new Schedule();
    const mockData = (owner:string, alertTime:Date, title:string) : IData => ({
        IdOwner: owner,
        AlertTime: alertTime,
        Message:   title,
        Channels: [{ Name: 'SMS', Contacts: ['TESTE'] }]
    });
    
    it("POST", async()=>{
        const itm = mockData(randomUUID(), addTime(new Date(), 1), 'TESTE');
        
        await expect(schedule.post([ {...itm, IdOwner: null} ])).rejects.toThrow(MESSAGES.SCHEDULE.REQUIREDS.POST.OWNER);
        await expect(schedule.post([ {...itm, AlertTime: null} ])).rejects.toThrow(MESSAGES.SCHEDULE.REQUIREDS.POST.ALERTTIME);
        await expect(schedule.post([ {...itm, Message: null} ])).rejects.toThrow(MESSAGES.SCHEDULE.REQUIREDS.POST.MESSAGE);
        await expect(schedule.post([ {...itm, Channels: null} ])).rejects.toThrow(MESSAGES.SCHEDULE.REQUIREDS.POST.CHANNELS);
        await expect(schedule.post([ {...itm, Channels: []} ])).rejects.toThrow(MESSAGES.SCHEDULE.REQUIREDS.POST.CHANNELS);
        
        await expect(schedule.post([ itm ])).resolves.not.toThrow();
    })

    it('GET', async()=>{
        const itm = mockData(randomUUID(), addTime(new Date(), 1), 'TESTE');
        await schedule.post([ itm ]);

        expect(schedule.get({IdOwner: randomUUID(), AlertTime: itm.AlertTime})).resolves.toBeNull();
        expect(schedule.get({IdOwner: itm.IdOwner, AlertTime: new Date(2022,0,1)})).resolves.toBeNull();

        expect(schedule.get({IdOwner: itm.IdOwner, AlertTime: itm.AlertTime})).resolves.toMatchObject(itm);
    });

    it('DELETE', async()=>{
        const itm = mockData(randomUUID(), new Date(), 'TESTE');
        await schedule.post([ itm ]);
        const {IdOwner, AlertTime} = itm;
        await expect(schedule.get({IdOwner, AlertTime})).resolves.not.toBeNull();
        await expect(schedule.del({IdOwner, AlertTime})).resolves.not.toThrow();
        await expect(schedule.get({IdOwner, AlertTime})).resolves.toBeNull();
    })
    
    
    it('LIST', async()=>{
        const alert = new Date();
        
        const itms = [
            mockData(randomUUID(), new Date(), 'TESTE1'),
            mockData(randomUUID(), new Date(), 'TESTE2'),
            mockData(randomUUID(), new Date(), 'TESTE3')
        ];
        await schedule.post(itms);
        const ls = await schedule.list({AlertTime: alert})
        expect(ls).toHaveLength( 3 );

    });
});