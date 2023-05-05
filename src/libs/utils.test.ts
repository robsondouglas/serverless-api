import { flatDate, addTime, clusterDate } from "./utils";

describe('UTILS', ()=>{
    it('FLATDATE',()=>{
        var d = new Date(2023, 4, 2, 10, 30);
        expect(flatDate(d)).toMatchObject(new Date(2023, 4, 2))
    })

    it('ADDTIME', ()=>{
        var d = new Date(2023, 4, 2);
        expect(addTime(d, 10, 30)).toMatchObject(new Date(2023, 4, 2, 10, 30));
        expect(addTime(d, 10)).toMatchObject(new Date(2023, 4, 2, 10));
    });

    it('CLUSTERDATE', ()=>{
        const d = clusterDate(new Date(1683305990399));        
        expect(d).toMatchObject({ day: 1683244800000, week: 1682812800000, month: 1682899200000 })
    })
});        
