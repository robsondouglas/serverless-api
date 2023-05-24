import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { GetQueueUrlCommand, SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { MESSAGES } from "./messages";
import * as wp from 'web-push';
import axios from "axios";
import Sharp from 'sharp';

const region = 'sa-east-1'
const chromeCredentials = {
    subject: 'mailto: <robson_douglas@hotmail.com>',
    publicKey: 'BCo-Or7a3w1BC8nfoVw9zmHrW00o-l9SobZEY7fhH8q_gKiGtvuFAh9zxTR96y7DKYCbGGwvg7mivHdU5ftaGxk',
    privateKey: 'xGX0TYZm9qyNbvSJuuTa5ccPf6gmZxXCXqtBW3VVFpw'
};

const fbCredentials = {
    token: 'EAALsud3i0s8BAD45BLfZAxtVCkUFPqmZAq9NDrAuREMlSuYdzTZCOxO2PhA6KWca17mnH1LGlDsugk6zGThHxHzkAhQGbFUqnjCdM3b6G3rgd5tiuZCLB9XWFB07VcS7AOJtnNd0bMZB0YNoFFUXyn0NRzXSADXwjZBAca1HdPDX590Xovm0XU00kwJikq3oK1QkFDhgwW9wFC0wZBSfNhC' 
}

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

const bktTmp  = process.env.bktTemp;
const bktPriv  = process.env.bktPriv;

export const requestUpload = async() => {
    const s3 = new S3Client({ region });

    const id = randomUUID();
    const cmd = new PutObjectCommand({Bucket: bktTmp, Key: id });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 5 * 60 });
    
    return { id, url };
}

export const moveFile = async(origin:string, destin:string) =>{
    const s3 = new S3Client({ region });
    const cmdCp = new CopyObjectCommand({ CopySource: `${bktTmp}/${origin}`, Bucket: bktPriv, Key: destin });
    await s3.send(cmdCp);

    await s3.send(new DeleteObjectCommand({ Bucket: bktTmp, Key: origin }));
}   

export const requestDownload = async(fileName:string, expiresIn?:number) => {
    const s3 = new S3Client({ region });

    const cmd = new GetObjectCommand({Bucket: bktPriv, Key: fileName });
    const url = await getSignedUrl(s3, cmd, { expiresIn });
    
    return { url };
}

export const downloadFile = async (fileName:string) => {
    try{
        const s3 = new S3Client({ region });
        console.log('Downloading...', bktPriv, fileName)
        const cmd = new GetObjectCommand({Bucket: bktPriv, Key: fileName })
        return (await s3.send( cmd )).Body.transformToByteArray();
    }
    catch(ex){
        console.log('Falha ao baixar arquivo', ex);
        throw ex;
    }
    
}

export const uploadFile = async (fileName:string, file:Blob) => {
    const s3 = new S3Client({ region });
    const cmd = new PutObjectCommand({Bucket: bktPriv, Key: fileName, Body: file });
    await s3.send( cmd );
}

export const enqueue = async(QueueName:string, data:any)=>{
    const cli = new SQSClient({ region })
    
    await cli.send(new GetQueueUrlCommand({ QueueName }))
    .then( ({QueueUrl}) => cli.send(new SendMessageCommand({ QueueUrl, MessageBody: JSON.stringify(data) })) )
    .catch( (_)=>{ throw new Error(MESSAGES.UTILS.QUEUE_NOT_FOUND) } )
    
}

export const sendSMS = async (PhoneNumber:string, Message:string) =>{
    const cli = new SNSClient({region});
    await cli.send(new PublishCommand({ PhoneNumber, Message }));
}

export const sendWhatsApp = async(PhoneNumber:string, Message:string) => {
    const url =  'https://graph.facebook.com/v15.0/'
    await axios.post(url, { "messaging_product": "whatsapp", "to": PhoneNumber, "type": "template", "template": { "name": Message, "language": { "code": "en_US" } }}, { 
        headers: {'Authorization': `Bearer ${fbCredentials.token}`}
    })
}

export const sendEmail = async(EmailAddress:string, Title: string, Message:string) => {
    console.log(EmailAddress, Title, Message);
}

export const sendChromeNotification = async(subscription:any, title:string, text:string) =>{
    console.log(subscription, title, '-', text)
    wp.setVapidDetails( 
        chromeCredentials.subject,
        chromeCredentials.publicKey,
        chromeCredentials.privateKey
    );

    await wp.sendNotification(subscription, JSON.stringify({title, text}))       
}

export const resizeImage = async(image:Blob, maxWidth:number, maxHeight:number)=>
{
    console.log('Resizing..')
    const img = await Sharp(image);
    const metadata = await img.metadata(); 
        console.log(`Original - Width: ${metadata.width} | Height: ${metadata.height}`)
        
        if( metadata.width > metadata.height )
        {  
            return await img.resize(maxWidth, maxWidth/metadata.width * metadata.height)
            .toFormat('png')
            .toBuffer();
        }
        else
        {
            return await img.resize(maxHeight/metadata.height * metadata.width, maxHeight)
            .toFormat('png')
            .toBuffer();
        }
}
