# Especificação do Projeto: Agendamentos com Lambda, DynamoDB e EventBridge Scheduler

## 1. Visão geral
Este projeto tem como objetivo implementar um serviço para cadastro, consulta, atualização e remoção de agendamentos, com suporte a consultas por:
- id do agendamento;
- id do local;
- id do participante;
- id do responsável.

O sistema deve ser desenvolvido preferencialmente em AWS Lambda, com persistência em DynamoDB e gestão temporal por EventBridge Scheduler.

A arquitetura principal será:
- DynamoDB como fonte de verdade operacional;
- EventBridge Scheduler para agendar a execução do evento;
- Lambda para operações de CRUD e processamento do início do evento;
- S3 + Parquet como camada opcional para armazenamento analítico/histórico.

## 2. Requisitos funcionais

### 2.1 Cadastro de agendamento
O sistema deve permitir criar um agendamento com os seguintes dados mínimos:
- agendamentoId
- titulo
- localId
- responsavelId
- dataInicio
- dataFim
- status
- timezone
- payload

Campos opcionais:
- descricao
- participantes
- metadata
- observacoes

Ao criar o agendamento, o sistema deve:
- persistir o item no DynamoDB;
- criar o schedule no EventBridge Scheduler;
- registrar o `scheduleName` e os metadados no item;
- validar campos obrigatórios e regras de negócio.

### 2.2 Consulta unitária
O sistema deve permitir consultar um agendamento específico por id.

### 2.3 Listagem por local
O sistema deve permitir listar todos os agendamentos relacionados a um `localId`.

### 2.4 Listagem por responsável
O sistema deve permitir listar todos os agendamentos relacionados a um `responsavelId`.

### 2.5 Listagem por participante
O sistema deve permitir listar todos os agendamentos em que um `participanteId` aparece.

### 2.6 Atualização de agendamento
O sistema deve permitir atualizar:
- titulo;
- local;
- responsável;
- data/hora;
- payload;
- status;
- participantes;
- timezone.

Ao atualizar um agendamento, o sistema deve:
- atualizar o item no DynamoDB;
- sincronizar o schedule do EventBridge quando a data ou payload mudarem;
- manter a referência ao schedule atual no item.

### 2.7 Remoção de agendamento
O sistema deve permitir excluir um agendamento.

Ao remover, o sistema deve:
- excluir o item do DynamoDB;
- excluir o schedule correspondente no EventBridge;
- remover os registros auxiliares, se houver relacionamento por participante.

### 2.8 Disparo do evento agendado
O EventBridge Scheduler deve disparar uma Lambda existente para iniciar o evento agendado.

A Lambda de início deve receber um payload contendo:
- agendamentoId
- status
- dataInicio
- payload
- localId
- responsavelId

## 3. Requisitos não funcionais

### 3.1 Disponibilidade
O sistema deve ser tolerante a falhas temporárias de chamadas de API da AWS.

### 3.2 Consistência
Deve existir um mecanismo para garantir sincronização entre "DynamoDB" e "EventBridge Scheduler".

### 3.3 Idempotência
Operações de criação, atualização e exclusão devem ser idempotentes sempre que possível, principalmente para garantir reprocessamento de falhas.

### 3.4 Observabilidade
Todas as Lambdas e integrações devem registrar:
- requestId;
- agendamentoId;
- operação executada;
- status;
- detalhes do erro, quando houver.

### 3.5 Segurança
- permissões IAM mínimos;
- autenticação/autorização em camada de API;
- logs com controle restrito;
- secret management para payloads sensíveis, se necessário.

## 4. Arquitetura sugerida

### 4.1 Banco operacional
Usar DynamoDB como banco transacional do agendamento.

Tabela principal: `Agendamento`

Atributos:
- `PK`: `AGENDAMENTO#<agendamentoId>`
- `SK`: `METADATA`
- `agendamentoId`
- `titulo`
- `localId`
- `responsavelId`
- `status`
- `dataInicio`
- `dataFim`
- `timezone`
- `scheduleName`
- `payload`
- `createdAt`
- `updatedAt`
- `deletedAt` (opcional)

Índices secundários:
- GSI1: `localId` -> `agendamentoId`
- GSI2: `responsavelId` -> `agendamentoId`

### 4.2 Relacionamento com participantes
Existem duas opções:

Opção A: lista embutida no item principal
- simples para poucos participantes;
- menos escalável para consultas complexas.

Opção B: tabela separada `AgendamentoParticipante`
- `PK`: `PARTICIPANTE#<participanteId>`
- `SK`: `AGENDAMENTO#<agendamentoId>`
- `agendamentoId`
- `participanteId`
- `status`
- `createdAt`

Essa opção é recomendada para consultas por participante.

### 4.3 EventBridge Scheduler
Para cada agendamento com data programada, criar um schedule no EventBridge.

Estrutura sugerida:
- `scheduleName`: `agendamento-<agendamentoId>`
- `target`: Lambda de início do evento
- `cron` ou `rate` conforme o caso
- `timezone`: timezone do evento

Regras:
- quando a data é alterada, atualizar o schedule;
- quando o evento é removido, remover o schedule;
- se a criação do schedule falhar, a operação deve ser compensada ou sinalizada para retries.

### 4.4 Lambda de início do evento
Lambda existente para início do evento deve receber uma mensagem contendo:
- `agendamentoId`
- `localId`
- `responsavelId`
- `payload`
- `status`

Essa Lambda deve:
- validar o evento;
- atualizar o status para `EM_ANDAMENTO` ou similar;
- disparar as etapas subsequentes do fluxo de negócio.

## 5. Regras de negócio
- Um agendamento deve ter `dataInicio` menor ou igual a `dataFim`.
- `localId`, `responsavelId` e `titulo` são obrigatórios.
- O `responsavelId` deve existir e estar válido.
- O `status` deve ser limitado a valores predefinidos, por exemplo:
  - `AGENDADO`
  - `EM_ANDAMENTO`
  - `CONCLUIDO`
  - `CANCELADO`
  - `EXCLUIDO`
- Participantes podem ser únicos ou repetidos, conforme validação.
- A exclusão física do agendamento deve ser tratada com auditoria para facilitar rastreio.

## 6. APIs esperadas

### 6.1 POST /agendamentos
Cria um agendamento.

Request:
```json
{
  "titulo": "Reunião de Planejamento",
  "localId": "loc-001",
  "responsavelId": "resp-123",
  "dataInicio": "2026-11-10T09:00:00Z",
  "dataFim": "2026-11-10T10:00:00Z",
  "timezone": "America/Sao_Paulo",
  "status": "AGENDADO",
  "payload": {
    "tipo": "reuniao",
    "canal": "teams"
  },
  "participantes": ["user-1", "user-2"]
}
```

Response:
```json
{
  "agendamentoId": "a-123",
  "status": "AGENDADO",
  "scheduleName": "agendamento-a-123"
}
```

### 6.2 GET /agendamentos/{agendamentoId}
Retorna um agendamento específico.

### 6.3 GET /locais/{localId}/agendamentos
Lista agendamentos por local.

### 6.4 GET /responsaveis/{responsavelId}/agendamentos
Lista agendamentos por responsável.

### 6.5 GET /participantes/{participanteId}/agendamentos
Lista agendamentos por participante.

### 6.6 PUT /agendamentos/{agendamentoId}
Atualiza um agendamento existente.

### 6.7 DELETE /agendamentos/{agendamentoId}
Remove um agendamento e seu schedule.

## 7. Estrutura de persistência
### 7.1 DynamoDB - Tabela principal
```text
Agendamento
  PK: agendamentoId
  GSI1: localId
  GSI2: responsavelId
```

### 7.2 DynamoDB - Tabela de participantes
```text
AgendamentoParticipante
  PK: participanteId
  SK: agendamentoId
```

## 8. Estratégia de sincronização com EventBridge
A sincronização entre DynamoDB e EventBridge deve seguir um padrão robusto:

### 8.1 Fluxo recomendado
1. validação da operação;
2. persistência em DynamoDB;
3. criação/atualização/exclusão do schedule no EventBridge;
4. atualização do status de sincronização no item;
5. persistência de logs e auditoria.

### 8.2 Tratamento de falha
Se a criação do schedule falhar:
- a Lambda deve registrar erro;
- tentar retry com backoff;
- mensagens em fila ou Step Functions podem ser usados para orquestração.

### 8.3 Compensação
Em caso de erro crítico:
- remover o item recém-criado em DynamoDB, se o schedule não foi criado;
- ou marcar o item como `SYNC_PENDING` e reprocessar mais tarde.

## 9. S3 + Parquet
O uso de S3 com Parquet é recomendado apenas como camada analítica, não como base operacional.

Casos de uso válidos:
- exportação periódica de dados do DynamoDB;
- relatórios analíticos;
- consultas via Athena;
- dashboards e histórico.

Casos em que não deve ser usado como base principal:
- operações de CRUD em tempo real;
- consultas por chave com baixa latência;
- atualização e exclusão de eventos com sincronização imediata.

## 10. Monitoramento
Ativar:
- CloudWatch Logs;
- métricas de Lambda;
- métricas de EventBridge Scheduler;
- alarmes para falhas de sincronização;
- alertas para criação, atualização ou exclusão sem sucesso.

## 11. Critérios de aceitação
O projeto será considerado concluído quando:
- os agendamentos forem persistidos em DynamoDB;
- consultas por id, local, responsável e participante funcionarem;
- as Lambdas de CRUD estiverem implementadas;
- a sincronização com EventBridge estiver operacional;
- remoção e alteração refletirem no DynamoDB e no EventBridge;
- logs e monitoramento estiverem ativos;
- a documentação de operação estiver disponível.

## 12. Conclusão
Para este caso, a recomendação técnica é:
- usar DynamoDB como base operacional;
- usar Lambda para CRUD e processamento;
- usar EventBridge Scheduler para disparo do evento;
- usar S3 + Parquet apenas para histórico/analytics opcional.

Essa abordagem atende melhor aos requisitos de consulta, alteração, remoção e integração com programação temporal, sem os problemas de uso de S3 como banco transacional.
