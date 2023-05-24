export interface IPK{
    AlertTime: number,
    IdOwner: string,
}

export interface IData extends IPK{
    Title: string,
    Message: string
}

export interface IFilter{
    AlertTime: number    
}