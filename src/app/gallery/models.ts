export interface IPK{ 
    IdOwner:string, 
    IdPicture: string   
}

export interface IData extends IPK{
    DateAdd: Date,
    Title: string
}

export interface IFIlter{ 
    IdOwner:string
}

export interface IFIlterAll{ 
    PageNumber:number
}