import { App } from "./app";

describe('APP', ()=>{
    const app = new App();
    // it('RUN SCHEDULES', async()=>{
        
    //     const res = app.runSchedules([{ IdOwner: 'TESTE', AlertTime: new Date().valueOf(), Message: 'TESTE', Channels: [{Name:"PUSH_CHROME", Contacts:['TASK']}] }])
    //     await expect(res).resolves.not.toThrow();
    // })
    // it('PROCESS IMAGE', async()=>{
    //     await expect(app.processImage('original/carro.jpg')).resolves.not.toThrow();
    // })

    // it('ADD TASK', async()=>{
    //     const res = app.addTask([{"Subject":"Robson","StartTime":1684929600000,"EndTime":1684931400000,"IsAllDay":false,"GroupId":1, IdOwner: '123', IdTask: 'abc'}]) 
    //     expect(res).resolves.not.toThrow();
    // })

    // it('LIST IMAGES', async()=>{
    //     const res = app.listImages({IdOwner: ''}) 
    //     expect(res).resolves.toHaveLength(3);
    // })

    it('RUN SCHEDULES', async()=>{
        const res = app.runSchedules({
            "AlertTime": 1685022960000,
            "IdOwner": "0165b018-1f9f-4eef-85b7-b6a0f7951320",
            "Message": "Reunião Add title em breve",
            "Title": "LEMBRETE DE REUNIÃO"
          })

        await expect(res).resolves.not.toThrow()  
    })

});