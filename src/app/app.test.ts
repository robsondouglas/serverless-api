import { App } from "./app";

describe('APP', ()=>{
    const app = new App();
    it('RUN SCHEDULES', async()=>{
        
        const res = app.runSchedules([{ IdOwner: 'TESTE', AlertTime: new Date().valueOf(), Message: 'TESTE', Channels: [{Name:"PUSH_CHROME", Contacts:['TASK']}] }])
        await expect(res).resolves.not.toThrow();
    })

});