
export interface IPK{ 
    IdOwner:string, 
    IdTask: string,     
}

export interface IData extends IPK{
    Subject: string,
    StartTime: number,
    EndTime: number,
    GroupId: number,
    IsAllDay: boolean
}

export interface IFIlter{ 
    IdOwner:string, 
    DateRef:number, 
    Scene:'DAY'|'WEEK'|'MONTH' 
}