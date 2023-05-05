export const flatDate = (d) => new Date(d.toDateString())
export const addTime  = (d, h, m?) => {
    const _d = new Date(d);
    if(h)
    {_d.setHours( _d.getHours() + h );}

    if(m)
    {_d.setMinutes( _d.getMinutes() + m );}
    
    return _d;
}

export const clusterDate = (d:Date) => {
    const day   = flatDate(d).valueOf();
    const week = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay() ).valueOf()
    const month  = new Date(d.getFullYear(), d.getMonth(), 1).valueOf();

    return { day, week, month };
}

export const week = (d:Date) => {
    const ini:Date = new Date(d.getFullYear(), 0,1);
    const days = (d.valueOf() - ini.valueOf())/1000/60/60/24 + 1;
    return Math.ceil((ini.getDay()+days)/7);
}