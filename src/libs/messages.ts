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
            }
        }
        
    }
}