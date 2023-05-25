import { randomUUID } from "crypto";
import { Gallery } from "./gallery";
import { IData } from "./models";
import { addTime } from "../../libs/utils";
import { MESSAGES } from "../../libs/messages";

describe('APP/GALLERY', ()=>{
    const gallery = new Gallery();
    const mockData = (owner:string, dateAdd:Date, title:string) : IData => ({
        IdOwner: owner,
        IdPicture: randomUUID(),
        DateAdd:   dateAdd,   
        Title:   title,
    });
    
    it("POST", async()=>{
        const itm = mockData(randomUUID(), addTime(new Date(), 1), 'TESTE');
        
        await expect(gallery.post([ {...itm, IdOwner: null} ])).rejects.toThrow(MESSAGES.GALLERY.REQUIREDS.POST.OWNER);
        await expect(gallery.post([ {...itm, DateAdd: null} ])).rejects.toThrow(MESSAGES.GALLERY.REQUIREDS.POST.DATEADD);
        await expect(gallery.post([ {...itm, Title: null} ])).rejects.toThrow(MESSAGES.GALLERY.REQUIREDS.POST.TITLE);
        
        await expect(gallery.post([ itm ])).resolves.not.toThrow();
    })

    it('GET', async()=>{
        const itm = mockData(randomUUID(), addTime(new Date(), 1), 'TESTE');
        await gallery.post([ itm ]);

        expect(gallery.get({IdOwner: randomUUID(), IdPicture: itm.IdPicture})).resolves.toBeNull();
        expect(gallery.get({IdOwner: itm.IdOwner, IdPicture: randomUUID()})).resolves.toBeNull();

        expect(gallery.get({IdOwner: itm.IdOwner, IdPicture: itm.IdPicture})).resolves.toMatchObject(itm);
    });

    it('DELETE', async()=>{
        const itm = mockData(randomUUID(), addTime(new Date(), 1), 'TESTE');
        await gallery.post([ itm ]);
        const {IdOwner, IdPicture} = itm;
        await expect(gallery.get({IdOwner, IdPicture})).resolves.not.toBeNull();
        await expect(gallery.del({IdOwner, IdPicture})).resolves.not.toThrow();
        await expect(gallery.get({IdOwner, IdPicture})).resolves.toBeNull();
    })
    
    it('PUT', async()=>{
        const itm = mockData(randomUUID(), addTime(new Date(), 1), 'TESTE');
        await gallery.post([ itm ]);        
        await expect(gallery.put({...itm, Title: 'TESTE 2'})).resolves.not.toThrow();
        await expect(gallery.get({IdOwner: itm.IdOwner, IdPicture: itm.IdPicture})).resolves.toMatchObject({Title: 'TESTE 2'});        
    });
    
    it('LIST', async()=>{
        const owner = randomUUID();
        const [_y, _m, _d] = [2023, 5, 1];
        const itms = [
            mockData(owner, new Date(_y, _m, _d, 10), 'TESTE1'),
            mockData(owner, new Date(_y, _m, _d, 11), 'TESTE2'),
            mockData(owner, new Date(_y, _m, _d + 1, 12), 'TESTE3')
        ];
        await gallery.post(itms);
        const ls = await gallery.list({IdOwner: owner})
        expect(ls).toHaveLength( 3 );

        //CHECK SORT 
        expect(ls[0]).toMatchObject(itms[2]);
        expect(ls[1]).toMatchObject(itms[1]);
        expect(ls[2]).toMatchObject(itms[0]);

    });
});