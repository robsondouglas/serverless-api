import { flatDate, addTime } from "./utils";

describe('UTILS', ()=>{
    it('FLATDATE',()=>{
        var d = new Date(2023, 4, 2, 10, 30);
        expect(flatDate(d)).toMatchObject(new Date(2023, 4, 2))
    })

    it('ADDTIME', ()=>{
        var d = new Date(2023, 4, 2);
        expect(addTime(d, 10, 30)).toMatchObject(new Date(2023, 4, 2, 10, 30));
        expect(addTime(d, 10)).toMatchObject(new Date(2023, 4, 2, 10));
    })
});        
