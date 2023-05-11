export interface IPK{
    AlertTime: Date,
    IdOwner: string,
}

export interface IData extends IPK{
    Message: string,
    Channels: { Name: string, Contacts: string[] }[]
}

export interface IFilter{
    AlertTime: Date    
}