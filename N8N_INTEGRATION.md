# 🤖 Guia de Integração N8N - CasaDF CRM

## 📋 Visão Geral

Este guia explica como integrar o **N8N** com o sistema **CasaDF CRM** para automação completa de atendimento via WhatsApp, gestão de leads e agendamento de visitas.

---

## 🎯 Workflows Disponíveis

Os seguintes workflows foram analisados e o sistema está preparado para recebê-los:

1. **Lívia 3.0 - Atendente IA** - Atendimento automatizado via WhatsApp
2. **Google Calendar** - Integração com agenda
3. **Escalar Humano** - Transferência para atendimento humano
4. **Enviar Agendamento** - Confirmação de visitas
5. **Salvar no Banco** - Persistência de dados
6. **Buscar Histórico** - Recuperação de conversas anteriores

---

## 🗄️ Tabelas do Banco de Dados

O sistema possui as seguintes tabelas para integração com N8N:

### Tabelas Principais

| Tabela | Descrição | Uso |
|--------|-----------|-----|
| `casadf_message_buffer` | Buffer de mensagens WhatsApp | Fila de processamento |
| `casadf_chat_history` | Histórico completo de conversas | Logs de atendimento |
| `casadf_clients` | Clientes/leads capturados | CRM principal |
| `casadf_client_interests` | Interesses dos clientes | Matching de imóveis |
| `casadf_visits` | Agendamentos de visitas | Calendário |
| `casadf_ai_context` | Contexto da IA Lívia | Memória da IA |

### Tabelas Existentes (já no sistema)

| Tabela | Descrição |
|--------|-----------|
| `leads` | Leads do CRM |
| `properties` | Imóveis disponíveis |
| `users` | Usuários do sistema |
| `n8n_chat_histories` | Histórico N8N legado |
| `n8n_fila_mensagens` | Fila de mensagens legado |
| `n8n_status_atendimento` | Status de atendimento |

---

## 🔌 Configuração do N8N

### 1. Criar Credencial PostgreSQL

No N8N, crie uma nova credencial do tipo **PostgreSQL**:

```
Nome: CasaDF CRM Database
Host: IP_DA_VPS (ou localhost se N8N estiver no mesmo servidor)
Port: 5432
Database: casadf_crm
User: casadf_admin
Password: [MESMA SENHA DO .env]
SSL: Disable (conexão local) ou Enable (conexão remota)
```

**⚠️ Importante:** Use as mesmas credenciais configuradas no arquivo `.env` do sistema.

### 2. Testar Conexão

Execute uma query simples para testar:

```sql
SELECT COUNT(*) FROM casadf_clients;
```

Se retornar um número (mesmo que 0), a conexão está funcionando!

---

## 📡 Endpoints de Webhook

O sistema expõe os seguintes endpoints para os workflows do N8N:

### Base URL

```
http://SEU_DOMINIO:5000/api/webhooks
```

ou em produção:

```
https://SEU_DOMINIO/api/webhooks
```

### 1. Ingestão de Leads

**Endpoint:** `POST /api/webhooks/leads/ingest`

**Descrição:** Cria ou atualiza um lead no CRM a partir de dados capturados pela IA.

**Payload:**

```json
{
  "name": "João Silva",
  "phone": "5561999887766",
  "email": "joao@email.com",
  "qualification": "quente",
  "stage": "contato_inicial",
  "client_type": "comprador",
  "budget_min": 300000,
  "budget_max": 500000,
  "neighborhoods": "Asa Sul, Lago Sul",
  "property_id": 123,
  "message_log": "Cliente interessado em apartamento de 3 quartos",
  "interest_profile": {
    "tipo": "apartamento",
    "quartos": 3,
    "vaga": 2
  }
}
```

**Resposta:**

```json
{
  "success": true
}
```

---

### 2. Salvar Cliente

**Endpoint:** `POST /api/webhooks/clients/save`

**Descrição:** Salva ou atualiza um cliente na tabela `casadf_clients`.

**Payload:**

```json
{
  "name": "Maria Santos",
  "phone": "5561988776655",
  "email": "maria@email.com",
  "origin": "whatsapp",
  "status": "novo",
  "notes": "Primeira conversa via WhatsApp"
}
```

**Resposta:**

```json
{
  "success": true,
  "client_id": 42
}
```

---

### 3. Salvar Interesse do Cliente

**Endpoint:** `POST /api/webhooks/clients/interests`

**Descrição:** Registra os interesses do cliente em tipos de imóveis.

**Payload:**

```json
{
  "client_id": 42,
  "phone": "5561988776655",
  "property_type": "apartamento",
  "interest_type": "compra",
  "budget_min": 400000,
  "budget_max": 600000,
  "preferred_neighborhoods": "Asa Norte, Lago Norte",
  "bedrooms": 3,
  "notes": "Prefere andar alto com vista"
}
```

**Resposta:**

```json
{
  "success": true
}
```

---

### 4. Agendar Visita

**Endpoint:** `POST /api/webhooks/visits/schedule`

**Descrição:** Agenda uma visita a um imóvel.

**Payload:**

```json
{
  "client_id": 42,
  "phone": "5561988776655",
  "client_name": "Maria Santos",
  "property_id": 123,
  "visit_date": "2025-12-15",
  "visit_time": "14:30:00",
  "notes": "Cliente prefere visita no período da tarde"
}
```

**Resposta:**

```json
{
  "success": true,
  "visit_id": 15
}
```

---

### 5. Buffer de Mensagens

**Endpoint:** `POST /api/webhooks/messages/buffer`

**Descrição:** Salva mensagens no buffer temporário para processamento.

**Payload:**

```json
{
  "phone": "5561999887766",
  "message_id": "msg_abc123xyz",
  "message_text": "Olá, gostaria de informações sobre apartamentos",
  "message_type": "text"
}
```

**Resposta:**

```json
{
  "success": true
}
```

---

### 6. Contexto da IA

**Endpoint:** `POST /api/webhooks/ai/context`

**Descrição:** Salva o contexto e memória da IA Lívia.

**Payload:**

```json
{
  "session_id": "5561999887766",
  "phone": "5561999887766",
  "message": {
    "type": "user",
    "content": "Quero um apartamento de 3 quartos",
    "timestamp": "2025-12-06T10:30:00Z"
  },
  "context_type": "conversation",
  "metadata": {
    "intent": "buscar_imovel",
    "confidence": 0.95
  }
}
```

**Resposta:**

```json
{
  "success": true
}
```

---

### 7. Buscar Imóveis

**Endpoint:** `POST /api/webhooks/properties/search`

**Descrição:** Busca imóveis disponíveis com filtros (para a IA usar).

**Payload:**

```json
{
  "property_type": "apartamento",
  "transaction_type": "venda",
  "min_price": 300000,
  "max_price": 500000,
  "bedrooms": 3,
  "neighborhood": "Asa Sul",
  "limit": 5
}
```

**Resposta:**

```json
{
  "success": true,
  "properties": [
    {
      "id": 123,
      "title": "Apartamento 3 quartos Asa Sul",
      "property_type": "apartamento",
      "transaction_type": "venda",
      "sale_price": "450000.00",
      "rent_price": null,
      "neighborhood": "Asa Sul",
      "city": "Brasília",
      "bedrooms": 3,
      "bathrooms": 2,
      "total_area": "85.00",
      "status": "disponivel"
    }
  ]
}
```

---

### 8. Health Check

**Endpoint:** `GET /api/webhooks/health`

**Descrição:** Verifica se o serviço de webhooks está funcionando.

**Resposta:**

```json
{
  "status": "ok",
  "service": "n8n-webhooks",
  "timestamp": "2025-12-06T10:30:00.000Z"
}
```

---

## 🔄 Fluxo de Integração

### Fluxo Típico de Atendimento

```
1. Cliente envia mensagem no WhatsApp
   ↓
2. N8N recebe webhook do WhatsApp
   ↓
3. N8N salva mensagem no buffer (casadf_message_buffer)
   ↓
4. IA Lívia processa a mensagem
   ↓
5. N8N salva contexto (casadf_ai_context)
   ↓
6. N8N busca imóveis (POST /api/webhooks/properties/search)
   ↓
7. IA responde ao cliente
   ↓
8. N8N salva cliente (POST /api/webhooks/clients/save)
   ↓
9. N8N salva interesse (POST /api/webhooks/clients/interests)
   ↓
10. N8N agenda visita (POST /api/webhooks/visits/schedule)
    ↓
11. N8N envia confirmação via WhatsApp
```

---

## 📊 Estrutura das Tabelas

### casadf_clients

```sql
CREATE TABLE casadf_clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  origin TEXT DEFAULT 'whatsapp',
  status TEXT DEFAULT 'novo',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### casadf_client_interests

```sql
CREATE TABLE casadf_client_interests (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES casadf_clients(id),
  property_type TEXT,
  interest_type TEXT,
  budget_min NUMERIC(12,2),
  budget_max NUMERIC(12,2),
  preferred_neighborhoods TEXT,
  bedrooms INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### casadf_visits

```sql
CREATE TABLE casadf_visits (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES casadf_clients(id),
  property_id INTEGER REFERENCES properties(id),
  phone TEXT NOT NULL,
  client_name TEXT NOT NULL,
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  status TEXT DEFAULT 'agendada',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### casadf_ai_context

```sql
CREATE TABLE casadf_ai_context (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  message JSONB NOT NULL,
  context_type TEXT DEFAULT 'conversation',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🛠️ Configuração dos Workflows

### Workflow: Lívia 3.0 - Atendente

**Nós principais:**

1. **Webhook Trigger** - Recebe mensagens do WhatsApp
2. **Buscar Mensagens** - Query: `SELECT * FROM casadf_message_buffer WHERE phone = $1`
3. **Processar com IA** - Envia para LLM
4. **Salvar Cliente** - HTTP Request: `POST /api/webhooks/clients/save`
5. **Salvar Contexto** - HTTP Request: `POST /api/webhooks/ai/context`
6. **Responder WhatsApp** - Envia resposta

### Workflow: Salvar no Banco

**Nós principais:**

1. **Execute Workflow Trigger** - Recebe dados de outro workflow
2. **Salvar Cliente** - Upsert em `casadf_clients`
3. **Salvar Interesse** - Insert em `casadf_client_interests`
4. **Salvar Visita** - Insert em `casadf_visits`

### Workflow: Buscar Histórico

**Nós principais:**

1. **Execute Workflow Trigger** - Recebe `session_id`
2. **Buscar Mensagens** - Query: `SELECT * FROM casadf_ai_context WHERE session_id = $1 ORDER BY created_at DESC`
3. **Formatar Histórico** - JavaScript para formatar texto
4. **Retornar** - Retorna histórico formatado

---

## 🔐 Segurança

### Recomendações

1. **Use HTTPS** em produção
2. **Configure firewall** para permitir apenas IPs conhecidos
3. **Use tokens de autenticação** nos webhooks (adicione header `Authorization`)
4. **Monitore logs** de acesso aos webhooks
5. **Limite rate** de requisições

### Exemplo de Autenticação (opcional)

Adicione no N8N um header:

```
Authorization: Bearer SEU_TOKEN_SECRETO
```

E valide no servidor (adicione em `server/api/webhooks/n8n.ts`):

```typescript
router.use((req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== process.env.N8N_WEBHOOK_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

---

## 🧪 Testes

### Testar Webhook Manualmente

```bash
# Testar health check
curl http://localhost:5000/api/webhooks/health

# Testar salvar cliente
curl -X POST http://localhost:5000/api/webhooks/clients/save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Cliente",
    "phone": "5561999999999",
    "origin": "teste"
  }'

# Testar buscar imóveis
curl -X POST http://localhost:5000/api/webhooks/properties/search \
  -H "Content-Type: application/json" \
  -d '{
    "property_type": "apartamento",
    "bedrooms": 3,
    "limit": 5
  }'
```

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs: `docker-compose logs -f app`
2. Teste a conexão do banco: `docker-compose exec app psql -h db -U casadf_admin -d casadf_crm`
3. Verifique o health check: `curl http://localhost:5000/api/webhooks/health`

---

## 📝 Checklist de Integração

- [ ] Banco de dados PostgreSQL rodando
- [ ] Migrations aplicadas (`npm run db:migrate`)
- [ ] N8N instalado e configurado
- [ ] Credencial PostgreSQL criada no N8N
- [ ] Conexão testada com query simples
- [ ] Workflows importados no N8N
- [ ] Webhooks configurados com URLs corretas
- [ ] Testes manuais realizados
- [ ] WhatsApp conectado ao N8N
- [ ] IA Lívia configurada
- [ ] Logs monitorados

---

**Desenvolvido com ❤️ para CasaDF Consultoria Imobiliária**  
**Versão:** 2.1.0  
**Data:** 06 de Dezembro de 2025
