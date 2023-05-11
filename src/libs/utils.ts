import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export const flatDate = (d) => new Date(d.toDateString())
export const addTime  = (d, h, m?) => {
    const _d = new Date(d);
    if(h)
    {_d.setHours( _d.getHours() + h );}

    if(m)
    {_d.setMinutes( _d.getMinutes() + m );}
    
    return _d;
}

export const clusterDate = (d:Date) => {
    const day   = flatDate(d).valueOf();
    const week = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay() ).valueOf()
    const month  = new Date(d.getFullYear(), d.getMonth(), 1).valueOf();

    return { day, week, month };
}

export const week = (d:Date) => {
    const ini:Date = new Date(d.getFullYear(), 0,1);
    const days = (d.valueOf() - ini.valueOf())/1000/60/60/24 + 1;
    return Math.ceil((ini.getDay()+days)/7);
}

const bktTmp  = process.env.bktTmp;
const bktPriv  = process.env.bktPriv;

export const requestUpload = async() => {
    const s3 = new S3Client({ region: "sa-east-1" });

    const id = randomUUID();
    const cmd = new PutObjectCommand({Bucket: bktTmp, Key: id });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 15 * 60 });
    
    return { id, url };
}

export const moveFile = async(origin:string, destin:string) =>{
    const s3 = new S3Client({ region: "sa-east-1" });
    const cmdCp = new CopyObjectCommand({ CopySource: `${bktTmp}/${origin}`, Bucket: bktPriv, Key: destin });
    await s3.send(cmdCp);

    const cmdDel = new DeleteObjectCommand({ Bucket: bktTmp, Key: origin })
    await s3.send(cmdDel);
}   

export const requestDownload = async(fileName:string, expiresIn?:number) => {
    const s3 = new S3Client({ region: "sa-east-1" });

    const cmd = new GetObjectCommand({Bucket: bktPriv, Key: fileName });
    const url = await getSignedUrl(s3, cmd, { expiresIn });
    
    return { url };
}