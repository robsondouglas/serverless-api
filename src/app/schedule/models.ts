export interface IPK{
    AlertTime: number,
    IdOwner: string,
}

export interface IData extends IPK{
    Message: string,
    Title: string,
}

export interface IFilter{
    AlertTime: number    
}