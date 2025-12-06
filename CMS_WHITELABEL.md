# 🎨 Sistema CMS White-Label - CasaDF CRM

## 📋 Visão Geral

O **CasaDF CRM** agora possui um **sistema CMS (Content Management System) completo** que permite personalização total do site institucional através do painel administrativo.

**Transforme o sistema em sua própria marca** sem precisar mexer em código!

---

## ✨ Funcionalidades

### 🎨 Personalização Visual

- **Logo e Favicon** - Upload de logo (claro e escuro) e favicon
- **Paleta de Cores** - Personalize 5 cores principais do site
- **Tipografia** - Escolha fontes para corpo e títulos
- **CSS Customizado** - Adicione estilos próprios

### 📝 Gestão de Conteúdo

- **Páginas Customizáveis** - Crie e edite páginas ilimitadas
- **Blocos Reutilizáveis** - Componentes de conteúdo reutilizáveis
- **Depoimentos** - Gerenciar avaliações de clientes
- **FAQs** - Perguntas frequentes por categoria
- **Banners** - Banners promocionais com agendamento

### 🏢 Informações da Empresa

- **Dados Básicos** - Nome, slogan, descrição
- **Contatos** - Telefone, WhatsApp, email, endereço
- **Redes Sociais** - Links para todas as redes

### 🔍 SEO e Analytics

- **Meta Tags** - Título, descrição, keywords
- **Google Analytics** - Integração automática
- **Google Tag Manager** - GTM configurável
- **Facebook Pixel** - Tracking de conversões

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

| Tabela | Descrição | Registros |
|--------|-----------|-----------|
| `site_settings` | Configurações gerais | 1 (singleton) |
| `site_pages` | Páginas customizáveis | Ilimitado |
| `site_blocks` | Blocos de conteúdo | Ilimitado |
| `site_menus` | Menus customizáveis | Ilimitado |
| `site_testimonials` | Depoimentos | Ilimitado |
| `site_faqs` | Perguntas frequentes | Ilimitado |
| `site_banners` | Banners promocionais | Ilimitado |

---

## 🎨 Personalização de Cores

### Cores Disponíveis

1. **Cor Primária** - Botões, links, destaques
2. **Cor Secundária** - Elementos secundários
3. **Cor de Destaque** - CTAs, promoções
4. **Cor de Fundo** - Background do site
5. **Cor do Texto** - Texto principal

### Como Funciona

As cores são aplicadas como **CSS Variables** dinamicamente:

```css
:root {
  --color-primary: #2563eb;
  --color-secondary: #7c3aed;
  --color-accent: #f59e0b;
  --color-background: #ffffff;
  --color-text: #1f2937;
}
```

Qualquer mudança no painel admin atualiza essas variáveis **em tempo real**.

---

## 📄 Sistema de Páginas

### Páginas do Sistema

Páginas que **não podem ser deletadas**:

- **Home** (`/`) - Página inicial
- **Imóveis** (`/imoveis`) - Listagem de imóveis
- **Contato** (`/contato`) - Formulário de contato

### Páginas Customizáveis

Você pode criar páginas ilimitadas:

- **Quem Somos** (`/quem-somos`)
- **Serviços** (`/servicos`)
- **Parceiros** (`/parceiros`)
- **Política de Privacidade** (`/privacidade`)
- **Termos de Uso** (`/termos`)
- Qualquer outra página!

### Estrutura de Conteúdo

Cada página possui **blocos de conteúdo** em formato JSON:

```json
{
  "blocks": [
    {
      "type": "hero",
      "title": "Bem-vindo",
      "subtitle": "Encontre o imóvel dos seus sonhos",
      "cta": "Ver Imóveis"
    },
    {
      "type": "text",
      "content": "Somos especialistas em..."
    },
    {
      "type": "property_list",
      "title": "Imóveis em Destaque"
    }
  ]
}
```

---

## 🔧 Configuração Inicial

### 1. Aplicar Migration

```bash
cd casadf-deploy
docker-compose exec app npm run db:migrate
```

Isso criará todas as 7 tabelas do CMS.

### 2. Acessar Painel Admin

```
http://seudominio.com.br/admin/site-settings
```

### 3. Configurar Identidade

1. **Nome da Empresa**
2. **Slogan**
3. **Logo** (URL da imagem)
4. **Favicon** (URL do ícone)

### 4. Personalizar Cores

Escolha as 5 cores principais do seu site.

### 5. Adicionar Contatos

- Telefone
- WhatsApp
- Email
- Endereço completo

### 6. Configurar Redes Sociais

Adicione os links das suas redes sociais.

### 7. Configurar SEO

- Meta título
- Meta descrição
- Palavras-chave
- Google Analytics ID (opcional)

---

## 📡 API (tRPC)

### Rotas Públicas

Qualquer pessoa pode acessar:

```typescript
// Obter configurações do site
trpc.cms.getSettings.useQuery()

// Listar páginas ativas
trpc.cms.listPages.useQuery({ activeOnly: true })

// Obter página por slug
trpc.cms.getPageBySlug.useQuery({ slug: 'quem-somos' })

// Listar blocos
trpc.cms.listBlocks.useQuery()

// Listar depoimentos
trpc.cms.listTestimonials.useQuery({ featuredOnly: true })

// Listar FAQs
trpc.cms.listFaqs.useQuery({ category: 'compra' })

// Listar banners
trpc.cms.listBanners.useQuery({ position: 'home' })
```

### Rotas Protegidas (Admin)

Apenas administradores podem acessar:

```typescript
// Atualizar configurações
trpc.cms.updateSettings.useMutation()

// Criar página
trpc.cms.createPage.useMutation()

// Atualizar página
trpc.cms.updatePage.useMutation()

// Deletar página
trpc.cms.deletePage.useMutation()

// Criar depoimento
trpc.cms.createTestimonial.useMutation()

// Criar FAQ
trpc.cms.createFaq.useMutation()

// Criar banner
trpc.cms.createBanner.useMutation()
```

---

## 🎯 Casos de Uso

### 1. Imobiliária em Brasília

```
Nome: Imóveis DF Premium
Slogan: Seu lar em Brasília
Cores: Azul (#0047AB), Amarelo (#FFD700)
Logo: logo-imoveis-df.png
```

### 2. Consultoria em São Paulo

```
Nome: SP Imóveis Consultoria
Slogan: Negócios imobiliários inteligentes
Cores: Cinza (#4A5568), Verde (#10B981)
Logo: logo-sp-imoveis.png
```

### 3. Corretora no Rio

```
Nome: Rio Properties
Slogan: O melhor do mercado carioca
Cores: Laranja (#F97316), Azul (#0EA5E9)
Logo: logo-rio-properties.png
```

---

## 🔒 Segurança

### Permissões

- **Público** - Pode ver configurações e conteúdo ativo
- **Admin** - Pode editar tudo

### Validação

Todos os inputs são validados com **Zod**:

- URLs devem ser válidas
- Cores devem estar no formato hexadecimal (#RRGGBB)
- Slugs devem conter apenas letras minúsculas, números e hífens
- Ratings devem estar entre 1 e 5

### Proteção XSS

- CSS e JavaScript customizados são injetados com cuidado
- Conteúdo HTML é escapado automaticamente pelo React

---

## 📊 Exemplos de Uso

### Exemplo 1: Mudar Cores

```typescript
import { useSiteConfig } from '@/hooks/use-site-settings';

function MyButton() {
  const { primaryColor } = useSiteConfig();
  
  return (
    <button style={{ backgroundColor: primaryColor }}>
      Clique aqui
    </button>
  );
}
```

### Exemplo 2: Usar Logo

```typescript
import { useSiteConfig } from '@/hooks/use-site-settings';

function Header() {
  const { logoUrl, companyName } = useSiteConfig();
  
  return (
    <header>
      <img src={logoUrl} alt={companyName} />
    </header>
  );
}
```

### Exemplo 3: Exibir Contatos

```typescript
import { useSiteConfig } from '@/hooks/use-site-settings';

function Footer() {
  const { phone, email, address } = useSiteConfig();
  
  return (
    <footer>
      <p>Telefone: {phone}</p>
      <p>Email: {email}</p>
      <p>Endereço: {address}</p>
    </footer>
  );
}
```

---

## 🚀 Deploy

### Checklist

- [x] Migration aplicada
- [x] Configurações básicas preenchidas
- [x] Logo e favicon configurados
- [x] Cores personalizadas
- [x] Contatos adicionados
- [x] Redes sociais configuradas
- [x] SEO configurado
- [x] Páginas customizadas criadas
- [x] Depoimentos adicionados
- [x] FAQs criadas

---

## 📚 Estrutura de Arquivos

### Backend

```
server/
├── routers/
│   └── cms.ts              # Rotas tRPC do CMS
└── api/
    └── webhooks/
        └── n8n.ts          # Webhooks (não relacionado ao CMS)

drizzle/
└── migrations/
    └── 0003_cms_whitelabel.sql  # Migration do CMS
```

### Frontend

```
client/src/
├── hooks/
│   └── use-site-settings.ts    # Hook para configurações
├── components/
│   └── ThemeProvider.tsx       # Provider de tema dinâmico
└── pages/
    └── admin/
        └── SiteSettings.tsx    # Página de configurações
```

---

## 🎓 Tutorial Completo

### Passo 1: Configurar Identidade

1. Acesse `/admin/site-settings`
2. Aba **Identidade**
3. Preencha:
   - Nome da empresa
   - Slogan
   - Descrição
   - URL do logo
   - URL do favicon

### Passo 2: Personalizar Cores

1. Aba **Cores**
2. Escolha as 5 cores principais
3. Use o seletor de cores ou digite o código hex
4. Veja a prévia em tempo real

### Passo 3: Adicionar Contatos

1. Aba **Contato**
2. Preencha:
   - Telefone
   - WhatsApp (com código do país)
   - Email
   - Endereço completo
   - Cidade, Estado, CEP

### Passo 4: Configurar Redes Sociais

1. Aba **Redes Sociais**
2. Adicione os links completos:
   - Facebook
   - Instagram
   - LinkedIn
   - YouTube
   - Twitter/X

### Passo 5: Otimizar SEO

1. Aba **SEO**
2. Configure:
   - Meta título (máx 60 caracteres)
   - Meta descrição (máx 160 caracteres)
   - Palavras-chave (separadas por vírgula)
3. Adicione IDs de tracking (opcional):
   - Google Analytics
   - Google Tag Manager
   - Facebook Pixel

### Passo 6: Avançado (Opcional)

1. Aba **Avançado**
2. Adicione CSS customizado para estilos únicos
3. Adicione JavaScript customizado (use com cuidado!)

### Passo 7: Salvar

1. Clique em **Salvar Configurações**
2. Aguarde confirmação
3. Recarregue a página para ver as mudanças

---

## 🐛 Troubleshooting

### Cores não aplicam

**Problema:** Mudei as cores mas não vejo diferença.

**Solução:**
1. Limpe o cache do navegador (Ctrl+Shift+R)
2. Verifique se o código hex está correto (#RRGGBB)
3. Verifique o console do navegador por erros

### Logo não aparece

**Problema:** Adicionei URL do logo mas não aparece.

**Solução:**
1. Verifique se a URL está acessível publicamente
2. Verifique se é uma URL válida (https://...)
3. Teste a URL diretamente no navegador
4. Verifique permissões CORS se a imagem estiver em outro domínio

### Mudanças não salvam

**Problema:** Clico em salvar mas as mudanças não persistem.

**Solução:**
1. Verifique se você está logado como admin
2. Verifique o console do navegador por erros
3. Verifique os logs do servidor: `docker-compose logs -f app`
4. Verifique se a migration foi aplicada

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique a documentação completa
2. Consulte os logs: `docker-compose logs -f app`
3. Teste as rotas tRPC no console do navegador
4. Verifique se as migrations foram aplicadas

---

## ✅ Checklist de White-Label

### Identidade Visual

- [ ] Logo principal configurado
- [ ] Logo modo escuro configurado (opcional)
- [ ] Favicon configurado
- [ ] Nome da empresa atualizado
- [ ] Slogan personalizado
- [ ] Descrição da empresa escrita

### Cores

- [ ] Cor primária escolhida
- [ ] Cor secundária escolhida
- [ ] Cor de destaque escolhida
- [ ] Cor de fundo configurada
- [ ] Cor do texto configurada

### Contatos

- [ ] Telefone adicionado
- [ ] WhatsApp configurado
- [ ] Email profissional configurado
- [ ] Endereço completo preenchido
- [ ] Cidade e estado corretos

### Redes Sociais

- [ ] Facebook configurado
- [ ] Instagram configurado
- [ ] LinkedIn configurado (opcional)
- [ ] YouTube configurado (opcional)
- [ ] Twitter/X configurado (opcional)

### SEO

- [ ] Meta título otimizado
- [ ] Meta descrição escrita
- [ ] Palavras-chave definidas
- [ ] Google Analytics configurado (opcional)

### Conteúdo

- [ ] Página "Quem Somos" criada
- [ ] Depoimentos adicionados
- [ ] FAQs criadas
- [ ] Banners configurados (opcional)

---

**Desenvolvido com ❤️ para CasaDF Consultoria Imobiliária**  
**Versão:** 2.1.0  
**Data:** 06 de Dezembro de 2025

**🎉 Seu sistema white-label está pronto para ser comercializado!**
