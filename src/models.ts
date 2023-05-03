export interface IPK{ 
    IdOwner:string, 
    Day: Date 
}

export interface ITaskItem{
    IdTask?: string,
    Subject: string,
    StartTime: Date,
    EndTime: Date,
    GroupId: number,
    IsAllDay: boolean
}

export interface IRequestAdd extends ITaskItem{
    IdOwner?:string    
} 

export interface IRequestAddBatch extends IPK{
    Tasks: ITaskItem[]
}

export interface IResponseGet extends IPK{
    Tasks: ITaskItem[]
}