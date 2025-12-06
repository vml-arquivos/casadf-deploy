-- Migration: Tabelas para Integração N8N
-- Data: 06 de Dezembro de 2025
-- Descrição: Tabelas adicionais necessárias para os workflows do N8N
-- incluindo buffer de mensagens, clientes, interesses e contexto da IA

-- ============================================
-- TABELA: casadf_message_buffer
-- Descrição: Buffer temporário de mensagens do WhatsApp
-- ============================================
CREATE TABLE IF NOT EXISTS casadf_message_buffer (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  message_id TEXT NOT NULL UNIQUE,
  message_text TEXT,
  message_type TEXT DEFAULT 'text',
  timestamp TIMESTAMP DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_buffer_phone ON casadf_message_buffer(phone);
CREATE INDEX IF NOT EXISTS idx_message_buffer_processed ON casadf_message_buffer(processed);
CREATE INDEX IF NOT EXISTS idx_message_buffer_timestamp ON casadf_message_buffer(timestamp);

-- ============================================
-- TABELA: casadf_chat_history
-- Descrição: Histórico completo de conversas do WhatsApp
-- ============================================
CREATE TABLE IF NOT EXISTS casadf_chat_history (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user' ou 'assistant'
  message JSONB NOT NULL,
  source TEXT DEFAULT 'whatsapp',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_history_session ON casadf_chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_phone ON casadf_chat_history(phone);
CREATE INDEX IF NOT EXISTS idx_chat_history_created ON casadf_chat_history(created_at);

-- ============================================
-- TABELA: casadf_clients
-- Descrição: Clientes/leads capturados via WhatsApp e outros canais
-- ============================================
CREATE TABLE IF NOT EXISTS casadf_clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  origin TEXT DEFAULT 'whatsapp', -- 'whatsapp', 'site', 'manual'
  status TEXT DEFAULT 'novo', -- 'novo', 'qualificado', 'convertido'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_phone ON casadf_clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_status ON casadf_clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_origin ON casadf_clients(origin);

-- ============================================
-- TABELA: casadf_client_interests
-- Descrição: Interesses dos clientes em tipos de imóveis
-- ============================================
CREATE TABLE IF NOT EXISTS casadf_client_interests (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES casadf_clients(id) ON DELETE CASCADE,
  property_type TEXT, -- 'casa', 'apartamento', 'cobertura', 'terreno'
  interest_type TEXT, -- 'compra', 'aluguel', 'financiamento'
  budget_min NUMERIC(12,2),
  budget_max NUMERIC(12,2),
  preferred_neighborhoods TEXT,
  bedrooms INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_interests_client ON casadf_client_interests(client_id);
CREATE INDEX IF NOT EXISTS idx_client_interests_type ON casadf_client_interests(property_type);

-- ============================================
-- TABELA: casadf_visits
-- Descrição: Agendamentos de visitas a imóveis
-- ============================================
CREATE TABLE IF NOT EXISTS casadf_visits (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES casadf_clients(id) ON DELETE SET NULL,
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  client_name TEXT NOT NULL,
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  status TEXT DEFAULT 'agendada', -- 'agendada', 'confirmada', 'realizada', 'cancelada'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_client ON casadf_visits(client_id);
CREATE INDEX IF NOT EXISTS idx_visits_property ON casadf_visits(property_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON casadf_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_status ON casadf_visits(status);

-- ============================================
-- TABELA: casadf_ai_context
-- Descrição: Contexto e memória da IA (Lívia 3.0)
-- ============================================
CREATE TABLE IF NOT EXISTS casadf_ai_context (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  message JSONB NOT NULL, -- { type: 'user'|'ai', content: '...', timestamp: '...' }
  context_type TEXT DEFAULT 'conversation', -- 'conversation', 'summary', 'intent'
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_context_session ON casadf_ai_context(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_context_phone ON casadf_ai_context(phone);
CREATE INDEX IF NOT EXISTS idx_ai_context_created ON casadf_ai_context(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_context_type ON casadf_ai_context(context_type);

-- ============================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_casadf_clients_updated_at BEFORE UPDATE ON casadf_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_casadf_visits_updated_at BEFORE UPDATE ON casadf_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTÁRIOS DAS TABELAS
-- ============================================
COMMENT ON TABLE casadf_message_buffer IS 'Buffer temporário de mensagens do WhatsApp para processamento';
COMMENT ON TABLE casadf_chat_history IS 'Histórico completo de conversas do WhatsApp';
COMMENT ON TABLE casadf_clients IS 'Clientes e leads capturados via WhatsApp e outros canais';
COMMENT ON TABLE casadf_client_interests IS 'Interesses dos clientes em tipos de imóveis';
COMMENT ON TABLE casadf_visits IS 'Agendamentos de visitas a imóveis';
COMMENT ON TABLE casadf_ai_context IS 'Contexto e memória da IA Lívia 3.0';

-- ============================================
-- FIM DA MIGRATION
-- ============================================
