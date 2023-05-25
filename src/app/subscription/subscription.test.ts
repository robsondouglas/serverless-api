import { Subscription } from "./subscription"

describe('SUBSCRIPTION', ()=>{
    const sub = new Subscription();
    it('ADD', async()=>{
        const res =  sub.post([{ IdOwner: '0165b018-1f9f-4eef-85b7-b6a0f7951320', IdTopic: 'TASK', Channel:'PUSH-CHROME', DateRef: new Date().valueOf() ,  Subscription: '{"endpoint":"https://fcm.googleapis.com/fcm/send/ftchnpKBQo0:APA91bGDWh8ahrXuJRyT7ScblC12REIZCqSQjA74PmO05O_Rf856g4y9GwmjztYYwP4HotRbHtcwVE2mreKuBkJzyDPrHF1Y3NsLNmMEQfOjPTkqSh7Krtk-iL2ovANrQhLuDBu2my5T","expirationTime":null,"keys":{"p256dh":"BMSkvDjyRmmwX2yoXEs0vbPlL34o_aqb_BRH4fUpgM0ntw-XyDaSN1IMY7v14uwfTRXkBQi6ypv2Qwc5QJo2cyM","auth":"Pp9kE6DkJfBar4IEI7lPNw"}}' }])
        await expect(res).resolves.not.toThrow();
    });

    it('DEL', async()=>{
        const res =  sub.del({ IdOwner: 'TESTE', IdTopic: 'TASK', Channel: 'PUSH-CHROME'})
        await expect(res).resolves.not.toThrow();
    });
    
})