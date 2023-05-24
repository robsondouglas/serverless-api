import { Subscription } from "./subscription"

describe('SUBSCRIPTION', ()=>{
    const sub = new Subscription();
    it('ADD', async()=>{
        const res =  sub.post([{ IdOwner: 'TESTE', IdTopic: 'TASK', Channel:'PUSH-CHROME', DateRef: new Date().valueOf() ,  Subscription: '{"endpoint":"https://fcm.googleapis.com/fcm/send/dHMLpZZHDGk:APA91bEwdPs2p0D149eeMmFp1vNfQOonAmuogqwmwGAqN_Gvun9xN2lAaSzP5UskGmr_I3Ghwu91NooNlQaC0JB1ZcPMssuxkqLJ9G7BaaY3b5s4EPo5u3wW3NOqJkzOp4wdGEI2X3QC","expirationTime":null,"keys":{"p256dh":"BCsBzTubjPd3L8J4Ig5q_7stcAe761_3tLET7CVZJFduZMl2YfmtBale0G2LULWR8ZTkyedf3UUgDZrqMGvmvq0","auth":"Ys83RJObr5HaHVinS1DLlA"}}' }])
        await expect(res).resolves.not.toThrow();
    });

    it('DEL', async()=>{
        const res =  sub.del({ IdOwner: 'TESTE', IdTopic: 'TASK', Channel: 'PUSH-CHROME'})
        await expect(res).resolves.not.toThrow();
    });
    
})