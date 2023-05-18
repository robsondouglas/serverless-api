export type Topic = 'TASK' | 'ALBUM';
export interface IPK{ 
    IdTopic: Topic,
    IdOwner:string,         
}

export interface IData extends IPK{
    Subscription:string,
    DateRef: number
}

export interface IFIlter{ 
    IdTopic: Topic 
}