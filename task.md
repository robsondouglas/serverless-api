# Tarefas do Projeto: Agendamentos com Lambda, DynamoDB e EventBridge Scheduler

## Objetivo
Implementar o cadastro, consulta, alteração e remoção de agendamentos, com suporte a:
- consulta unitária por id do agendamento;
- listagem por id do local;
- listagem por id do participante;
- listagem por id do responsável;
- sincronização com EventBridge Scheduler;
- atualização/remoção refletida tanto no repositório de dados quanto no agendamento externo do EventBridge.

## Decisão de arquitetura
- Usar DynamoDB como base operacional do agendamento.
- Usar EventBridge Scheduler para disparar a execução do evento agendado.
- Usar S3 + Parquet apenas como camada analítica/histórica, se necessário, e não como fonte de verdade do agendamento.

## Tarefas

### 1. Definir o modelo de dados no DynamoDB
- [ ] Criar a tabela principal `Agendamento` com chave primária por `agendamentoId`.
- [ ] Adicionar GSI para consultas por `localId`.
- [ ] Adicionar GSI para consultas por `responsavelId`.
- [ ] Definir campos obrigatórios: `agendamentoId`, `titulo`, `localId`, `responsavelId`, `status`, `dataInicio`, `dataFim`, `scheduleName`, `createdAt`, `updatedAt`.
- [ ] Definir campos opcionais: `descricao`, `participantes`, `payload`, `timezone`, `metadata`.
- [ ] Validar regras de negócio para datas, responsáveis e participantes.

### 2. Modelar relacionamento de participantes
- [ ] Criar tabela `AgendamentoParticipante` ou armazenar participantes como lista aninhada, conforme volume e necessidade.
- [ ] Definir chave primária e estrutura para consulta por `participanteId`.
- [ ] Implementar consulta de agendamentos por participante.

### 3. Implementar CRUD em Lambda
- [ ] Implementar Lambda `CreateAgendamento`.
- [ ] Implementar Lambda `GetAgendamentoById`.
- [ ] Implementar Lambda `ListAgendamentosByLocal`.
- [ ] Implementar Lambda `ListAgendamentosByResponsavel`.
- [ ] Implementar Lambda `ListAgendamentosByParticipante`.
- [ ] Implementar Lambda `UpdateAgendamento`.
- [ ] Implementar Lambda `DeleteAgendamento`.
- [ ] Validar retorno de erros e casos de não encontrado.
- [ ] Registrar logs estruturados com `requestId`, `agendamentoId`, `status` e erros.

### 4. Integrar com EventBridge Scheduler
- [ ] Definir nome do schedule com base no id do agendamento ou identificador estável.
- [ ] Criar schedule no EventBridge ao criar o agendamento.
- [ ] Atualizar o schedule ao alterar data/hora ou payload do evento.
- [ ] Remover o schedule ao excluir o agendamento.
- [ ] Garantir que o schedule tenha target para a Lambda já existente de início do evento.
- [ ] Validar timezone e expressão cron para a data programada.

### 5. Sincronização e consistência entre DynamoDB e EventBridge
- [ ] Definir estratégia para garantir consistência entre a persistência em DynamoDB e o schedule no EventBridge.
- [ ] Implementar compensação em caso de falha de criação/alteração/remoção do schedule.
- [ ] Adicionar campo `syncStatus` ou similar para controlar sincronização com EventBridge.
- [ ] Tratar cenários de retry e idempotência.
- [ ] Definir como o sistema reage a falhas temporárias de AWS API.

### 6. Implementar consultas e regras de listagem
- [ ] Implementar busca por local usando GSI.
- [ ] Implementar busca por responsável usando GSI.
- [ ] Implementar busca por participante usando tabela de relacionamento ou GSI.
- [ ] Definir paginação (`Limit`, `LastEvaluatedKey`) para listagens.
- [ ] Definir ordenação por `dataInicio` ou `createdAt`.

### 7. Implementar camada de governança e segurança
- [ ] Definir permissões IAM para acesso ao DynamoDB e EventBridge Scheduler.
- [ ] Configurar autenticação/autorização para as Lambdas.
- [ ] Restringir acesso por papel e escopo de recursos.
- [ ] Definir política para logs, monitoramento e alertas.

### 8. Adicionar monitoramento e observabilidade
- [ ] Configurar CloudWatch Logs para todas as Lambdas.
- [ ] Configurar métricas de invocação, duração e falhas.
- [ ] Criar alarmes para falhas na criação/alteração de schedules.
- [ ] Registrar eventos de auditoria para criação, alteração e exclusão de agendamentos.

### 9. Definir integração com S3 e Parquet (opcional)
- [ ] Definir se o S3 será usado somente para histórico/analytics.
- [ ] Planejar exportação periódica de dados do DynamoDB para arquivos Parquet em S3.
- [ ] Configurar Athena/Glue para consultas analíticas, se necessário.
- [ ] Garantir que o S3 não seja usado como fonte de verdade para operações CRUD em tempo real.

### 10. Testes e validações
- [ ] Criar testes unitários para regras de negócio.
- [ ] Criar testes de integração para CRUD no DynamoDB.
- [ ] Criar testes para criação/atualização/remoção de schedules no EventBridge.
- [ ] Validar cenários de erro e reprocessamento.
- [ ] Validar comportamento de listagem por local, responsável e participante.

### 11. Documentação e operação
- [ ] Registrar exemplos de payload de criação e atualização.
- [ ] Documentar endpoints/rotas e respostas esperadas.
- [ ] Documentar a estratégia de sincronização entre DynamoDB e EventBridge.
- [ ] Registrar regras de manutenção do agendamento e do schedule.
- [ ] Documentar quando usar S3 + Parquet em vez de DynamoDB para consultas analíticas.

## Recomendação final
A arquitetura mais adequada para este projeto é:
- DynamoDB como banco operacional do agendamento;
- EventBridge Scheduler como mecanismo de execução do evento;
- Lambda como base para operações e processamento;
- S3 + Parquet como armazenamento analítico opcional, não como mecanismo transacional principal.

## Entregável mínimo
- Tabelas DynamoDB criadas e populadas.
- Lambdas para CRUD implementadas.
- GSI para consultas por local e responsável.
- Mecanismo para sincronizar agendamento e EventBridge.
- Testes e documentação básica.

## Critérios de aceite
- [ ] Criação de agendamento persiste corretamente no DynamoDB.
- [ ] Consulta por id, local, participante e responsável funciona.
- [ ] Alteração de evento sincroniza com EventBridge.
- [ ] Remoção de evento remove o dado local e o schedule.
- [ ] Falhas de sincronização são detectadas e tratadas.
- [ ] O projeto fica pronto para evoluir com analytics em S3/Parquet sem conflitar com o banco operacional.
