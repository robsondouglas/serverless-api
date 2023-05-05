export interface IPK{ 
    IdOwner:string, 
    IdTask: string,     
}

export interface IData extends IPK{
    Subject: string,
    StartTime: Date,
    EndTime: Date,
    GroupId: number,
    IsAllDay: boolean
}

export interface IFIlter{ 
    IdOwner:string, 
    DateRef:Date, 
    Scene:'DAY'|'WEEK'|'MONTH' 
}