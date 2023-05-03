export const flatDate = (d) => new Date(d.toDateString())
export const addTime  = (d, h, m?) => {
    const _d = new Date(d);
    if(h)
    {_d.setHours( _d.getHours() + h );}

    if(m)
    {_d.setMinutes( _d.getMinutes() + m );}
    
    return _d;
}