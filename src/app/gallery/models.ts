export interface IPK{ 
    IdOwner:string, 
    IdPicture: string   
}

export interface IData extends IPK{
    DateAdd: Date,
    Title: string,
    Url:string
}

export interface IFIlter{ 
    IdOwner:string
}