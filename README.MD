# APRESENTAÇÃO SOBRE SERVERLESS

## AMBIENTE LOCAL
 - DEVCONTAINER (https://code.visualstudio.com/docs/devcontainers/containers)
 - UTILIZE CREDENCIAIS VÁLIDAS DO AWS CLI (aws configure) E UM GRUPO DE USUÁRIOS DO COGNITO
 - PARA EXECUTAR OS TESTES, SERÁ NECESSÁRIO INICIAR O BD PRIMIEIRAMENTE (yarn dbinit)
 - PARA RODAR O AMBIENTE LOCAL BASTA EXECUTAR yarn start

## CREDENCIAIS
 - CRIE UMA VAPIDKEY PARA RECEBER AS NOTIFICAÇÕES NO BROWSER - https://vapidkeys.com/
 - NA AWS, CRIE UMA CONTA PROGRAMÁTICA ADMIN E UTILIZE O COMANDO LOCAL aws configure PARA DEFINIR AS CREDENCIAIS DE ACESSO 

 ## TESTES
  - UNITÁRIO: Inicie o BD com o comando yarn dbinit. Em outro terminal use yarn jest arquivo_de_teste.test.ts 
  - INTEGRADO: Use o comando yarn start e a API será executada localmente, mas é necessário que tenha o ambiente provisionado na cloud, pois alguns recursos não podem ser emulados localmente  

  