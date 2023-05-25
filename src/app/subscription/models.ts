export type Topic = 'TASK' | 'ALBUM';
export type Channel = 'PUSH-CHROME' | 'SMS' | 'WHATSAPP' | 'EMAIL';
export interface IPK{ 
    IdTopic: Topic,
    IdOwner:string,
    Channel: Channel,
    IdSubscription?:string         
}

export interface IData extends IPK{
    Subscription:string,
    DateRef: number
}

export interface IFIlter{ 
    IdTopic: Topic
    Channel: Channel,
    IdOwner: string 
}