-- Migration: Sistema CMS White-Label
-- Data: 06 de Dezembro de 2025
-- Descrição: Tabelas para personalização completa do site institucional
-- Permite customização de cores, logos, textos, páginas e layouts

-- ============================================
-- TABELA: site_settings
-- Descrição: Configurações gerais do site
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  -- Identidade da Empresa
  company_name TEXT NOT NULL DEFAULT 'CasaDF Consultoria Imobiliária',
  company_slogan TEXT DEFAULT 'Seu sonho, nossa missão',
  company_description TEXT,
  
  -- Logo e Favicon
  logo_url TEXT,
  logo_dark_url TEXT, -- Logo para modo escuro
  favicon_url TEXT,
  
  -- Cores do Tema
  primary_color TEXT DEFAULT '#2563eb', -- Azul
  secondary_color TEXT DEFAULT '#7c3aed', -- Roxo
  accent_color TEXT DEFAULT '#f59e0b', -- Laranja
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#1f2937',
  
  -- Tipografia
  font_family TEXT DEFAULT 'Inter, sans-serif',
  heading_font TEXT DEFAULT 'Inter, sans-serif',
  font_size_base TEXT DEFAULT '16px',
  
  -- Contatos
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Redes Sociais
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  youtube_url TEXT,
  twitter_url TEXT,
  
  -- Horário de Funcionamento
  business_hours JSONB DEFAULT '{"seg-sex": "9h-18h", "sab": "9h-13h", "dom": "Fechado"}',
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  google_analytics_id TEXT,
  google_tag_manager_id TEXT,
  facebook_pixel_id TEXT,
  
  -- Configurações Avançadas
  custom_css TEXT,
  custom_js TEXT,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  
  -- Controle
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir configuração padrão
INSERT INTO site_settings (id, company_name, company_slogan) 
VALUES (1, 'CasaDF Consultoria Imobiliária', 'Seu sonho, nossa missão')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABELA: site_pages
-- Descrição: Páginas customizáveis do site
-- ============================================
CREATE TABLE IF NOT EXISTS site_pages (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE, -- URL da página (ex: 'quem-somos', 'contato')
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB NOT NULL, -- Conteúdo em blocos (JSON)
  meta_title TEXT,
  meta_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE, -- Páginas do sistema não podem ser deletadas
  order_index INTEGER DEFAULT 0,
  show_in_menu BOOLEAN DEFAULT TRUE,
  menu_label TEXT,
  icon TEXT, -- Ícone para o menu (ex: 'home', 'info', 'phone')
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_pages_slug ON site_pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_active ON site_pages(is_active);
CREATE INDEX IF NOT EXISTS idx_pages_order ON site_pages(order_index);

-- Inserir páginas padrão
INSERT INTO site_pages (slug, title, subtitle, content, is_system, order_index, menu_label, icon) VALUES
('home', 'Início', 'Encontre o imóvel dos seus sonhos', 
 '{"blocks": [{"type": "hero", "title": "Encontre o imóvel dos seus sonhos", "subtitle": "Mais de 1000 imóveis disponíveis em Brasília e região", "cta": "Ver Imóveis"}]}',
 TRUE, 1, 'Início', 'home'),
 
('imoveis', 'Imóveis', 'Nosso portfólio completo', 
 '{"blocks": [{"type": "property_list", "title": "Imóveis Disponíveis"}]}',
 TRUE, 2, 'Imóveis', 'building'),
 
('quem-somos', 'Quem Somos', 'Conheça nossa história', 
 '{"blocks": [{"type": "text", "content": "Somos uma consultoria imobiliária especializada em Brasília e região, com mais de 10 anos de experiência no mercado."}]}',
 FALSE, 3, 'Quem Somos', 'info'),
 
('contato', 'Contato', 'Fale conosco', 
 '{"blocks": [{"type": "contact_form", "title": "Entre em contato"}]}',
 TRUE, 4, 'Contato', 'phone')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- TABELA: site_blocks
-- Descrição: Blocos de conteúdo reutilizáveis
-- ============================================
CREATE TABLE IF NOT EXISTS site_blocks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- Nome do bloco (ex: 'footer', 'header', 'cta-home')
  type TEXT NOT NULL, -- Tipo (text, image, video, cta, form, etc)
  content JSONB NOT NULL, -- Conteúdo do bloco
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir blocos padrão
INSERT INTO site_blocks (name, type, content) VALUES
('hero-home', 'hero', 
 '{"title": "Encontre o imóvel dos seus sonhos", "subtitle": "Mais de 1000 imóveis disponíveis", "image": "/hero.jpg", "cta": {"text": "Ver Imóveis", "link": "/imoveis"}}'),
 
('cta-simulador', 'cta', 
 '{"title": "Simule seu financiamento", "description": "Calcule as parcelas do seu imóvel em segundos", "button": {"text": "Simular Agora", "link": "/simulador"}}'),
 
('footer-info', 'text', 
 '{"content": "CasaDF Consultoria Imobiliária - Todos os direitos reservados"}')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- TABELA: site_menus
-- Descrição: Menus customizáveis
-- ============================================
CREATE TABLE IF NOT EXISTS site_menus (
  id SERIAL PRIMARY KEY,
  location TEXT NOT NULL, -- 'header', 'footer', 'sidebar'
  label TEXT NOT NULL,
  url TEXT,
  page_id INTEGER REFERENCES site_pages(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES site_menus(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  open_new_tab BOOLEAN DEFAULT FALSE,
  icon TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menus_location ON site_menus(location);
CREATE INDEX IF NOT EXISTS idx_menus_order ON site_menus(order_index);

-- ============================================
-- TABELA: site_testimonials
-- Descrição: Depoimentos de clientes
-- ============================================
CREATE TABLE IF NOT EXISTS site_testimonials (
  id SERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_role TEXT, -- Ex: 'Comprador', 'Locatário'
  client_photo TEXT,
  testimonial TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON site_testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON site_testimonials(is_active);

-- ============================================
-- TABELA: site_faqs
-- Descrição: Perguntas frequentes
-- ============================================
CREATE TABLE IF NOT EXISTS site_faqs (
  id SERIAL PRIMARY KEY,
  category TEXT DEFAULT 'geral', -- 'geral', 'compra', 'venda', 'aluguel', 'financiamento'
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON site_faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON site_faqs(is_active);

-- Inserir FAQs padrão
INSERT INTO site_faqs (category, question, answer, order_index) VALUES
('geral', 'Como funciona a consultoria?', 'Nossa consultoria oferece suporte completo na compra, venda ou aluguel de imóveis, desde a busca até a documentação.', 1),
('compra', 'Quais documentos preciso para comprar um imóvel?', 'Você precisará de RG, CPF, comprovante de renda e residência. Nossa equipe auxilia em todo o processo.', 2),
('financiamento', 'Como simular um financiamento?', 'Use nosso simulador online para calcular as parcelas. É rápido, gratuito e sem compromisso.', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- TABELA: site_banners
-- Descrição: Banners promocionais
-- ============================================
CREATE TABLE IF NOT EXISTS site_banners (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  position TEXT DEFAULT 'home', -- 'home', 'imoveis', 'all'
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banners_position ON site_banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_active ON site_banners(is_active);

-- ============================================
-- TRIGGERS: Atualizar updated_at
-- ============================================
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_pages_updated_at BEFORE UPDATE ON site_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_blocks_updated_at BEFORE UPDATE ON site_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTÁRIOS DAS TABELAS
-- ============================================
COMMENT ON TABLE site_settings IS 'Configurações gerais do site (logo, cores, contatos, SEO)';
COMMENT ON TABLE site_pages IS 'Páginas customizáveis do site institucional';
COMMENT ON TABLE site_blocks IS 'Blocos de conteúdo reutilizáveis';
COMMENT ON TABLE site_menus IS 'Menus customizáveis (header, footer, sidebar)';
COMMENT ON TABLE site_testimonials IS 'Depoimentos de clientes';
COMMENT ON TABLE site_faqs IS 'Perguntas frequentes';
COMMENT ON TABLE site_banners IS 'Banners promocionais';

-- ============================================
-- FIM DA MIGRATION
-- ============================================
