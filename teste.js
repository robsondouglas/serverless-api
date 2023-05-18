const wp = require("web-push");

wp.setVapidDetails( 
  'mailto: <robson_douglas@hotmail.com>',
  'BCo-Or7a3w1BC8nfoVw9zmHrW00o-l9SobZEY7fhH8q_gKiGtvuFAh9zxTR96y7DKYCbGGwvg7mivHdU5ftaGxk',
  'xGX0TYZm9qyNbvSJuuTa5ccPf6gmZxXCXqtBW3VVFpw'
);

wp.sendNotification({
  endpoint: 'https://fcm.googleapis.com/fcm/send/dHMLpZZHDGk:APA91bEwdPs2p0D149eeMmFp1vNfQOonAmuogqwmwGAqN_Gvun9xN2lAaSzP5UskGmr_I3Ghwu91NooNlQaC0JB1ZcPMssuxkqLJ9G7BaaY3b5s4EPo5u3wW3NOqJkzOp4wdGEI2X3QC',
  expirationTime: null,
  keys: {
    p256dh: 'BCsBzTubjPd3L8J4Ig5q_7stcAe761_3tLET7CVZJFduZMl2YfmtBale0G2LULWR8ZTkyedf3UUgDZrqMGvmvq0',
    auth: 'Ys83RJObr5HaHVinS1DLlA'
  }
}, JSON.stringify({title: 'TITULO', text: 'MENSAGEM'}))
.then(r => console.log('ok', r))
.catch(ex => console.log(ex))
 