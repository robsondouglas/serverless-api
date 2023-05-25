export const MESSAGES = {
    TASK: {
        REQUIREDS: {
            POST:{
                OWNER: 'Não é possível definir um compromisso sem um proprietário',
                STARTTIME: 'Não é possível definir um compromisso sem uma data de início',
                ENDTIME: 'Não é possível definir um compromisso sem uma data de término',
                SUBJECT: 'Não é possível definir um compromisso sem um assunto',
            }
        },
        RULES: {
            POST:{
                MINIMAL_START: 'Não é possível definir um compromisso no passado',
                START_END: 'Não é possível o término anterior ao início'
            }
        }
    },
    GALLERY:{
        REQUIREDS:{
            POST:{
                OWNER: 'Não é possível incluir uma imagem sem um proprietário',
                DATEADD: 'Não é possível incluir uma imagem sem uma data de cadastro',
                TITLE: 'Não é possível incluir uma imagem sem um título',
                URL: 'Não é possível incluir uma imagem sem URL',
            }
        }       
    },
    SCHEDULE:{
        REQUIREDS:{
            POST:{
                OWNER: 'Não é possível incluir um alerta sem um proprietário',
                ALERTTIME: 'Não é possível incluir um alerta sem uma data',
                MESSAGE: 'Não é possível incluir um alerta sem um mensagem',
                TITLE: 'Não é possível incluir um alerta sem título',
            }
        }       
    },
    UTILS:{
        QUEUE_NOT_FOUND: 'A fila informada não existe',
        RESIZE_IMAGE_NOFILE: 'Não é possível redimensionar uma imagem nula',
        RESIZE_IMAGE_FAIL: 'Falha ao redimensionar imagem',
        
    }
}