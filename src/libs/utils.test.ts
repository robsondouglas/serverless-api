import axios from "axios";
import { flatDate, addTime, clusterDate, requestUpload, moveFile, requestDownload } from "./utils";

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

    it('REQUEST UPLOAD', async()=>{
        await expect(requestUpload()).resolves.not.toThrowError();
        const {url} = await requestUpload();
        await expect(axios.put(url, {data: 'TESTE'})).resolves.not.toThrowError();
    })

    it('MOVE', async()=>{
        const {url, id} = await requestUpload();
        await axios.put(url, 'TESTE');

        await expect(moveFile(id, `teste/${id}`)).resolves.not.toThrowError();
    })

    it('REQUEST DOWNLOAD', async()=>{
        const {url, id} = await requestUpload();
        await axios.put(url, 'TESTE');
        await moveFile(id, `teste/${id}`);
        expect(requestDownload(`teste/${id}`)).resolves.not.toThrowError();
        const {url : download} = await requestDownload(`teste/${id}`); 
        await expect(axios.get(download)).resolves.toMatchObject({data: 'TESTE'});
    })

});        
