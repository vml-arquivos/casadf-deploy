#!/bin/bash

# ============================================
# Script de Verificação Pré-Deploy
# CasaDF CRM v2.1.0
# ============================================

set -e

echo "🔍 Iniciando verificação pré-deploy..."
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar sucesso
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        exit 1
    fi
}

# Função para avisos
warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Verificar se o arquivo .env existe
echo "📋 Verificando arquivo .env..."
if [ -f ".env" ]; then
    check_success "Arquivo .env encontrado"
else
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo "Execute: cp .env.example .env"
    exit 1
fi

# 2. Verificar variáveis críticas
echo ""
echo "🔐 Verificando variáveis de ambiente críticas..."

check_var() {
    local var_name=$1
    local var_value=$(grep "^${var_name}=" .env | cut -d '=' -f2-)
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ ${var_name} não configurado${NC}"
        return 1
    fi
    
    # Verificar se não é valor padrão perigoso
    if [[ "$var_name" == "DB_PASSWORD" && "$var_value" == "supersecretpassword" ]]; then
        warn "${var_name} está usando senha padrão! ALTERE antes de produção!"
    elif [[ "$var_name" == "JWT_SECRET" && "$var_value" == "b3xTnStM9fhETM8ETpdTpu/loSRzz1seJqETfqKuYus=" ]]; then
        warn "${var_name} está usando chave padrão! ALTERE antes de produção!"
    else
        check_success "${var_name} configurado"
    fi
}

check_var "DB_USER"
check_var "DB_PASSWORD"
check_var "DB_NAME"
check_var "DATABASE_URL"
check_var "JWT_SECRET"
check_var "ALLOWED_ORIGINS"

# 3. Verificar arquivos críticos
echo ""
echo "📁 Verificando arquivos críticos..."

files=(
    "package.json"
    "Dockerfile"
    "docker-compose.yml"
    "server/index.ts"
    "server/routers.ts"
    "server/db.ts"
    "server/migrate.ts"
    "drizzle/schema.ts"
    "drizzle/migrations/0001_initial.sql"
    "client/src/main.tsx"
    "client/src/App.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        check_success "$file existe"
    else
        echo -e "${RED}❌ $file não encontrado!${NC}"
        exit 1
    fi
done

# 4. Verificar sintaxe YAML
echo ""
echo "🔧 Verificando sintaxe do docker-compose.yml..."
python3 -c "import yaml; yaml.safe_load(open('docker-compose.yml'))" 2>/dev/null
check_success "docker-compose.yml válido"

# 5. Verificar package.json
echo ""
echo "📦 Verificando package.json..."
node -e "require('./package.json')" 2>/dev/null
check_success "package.json válido"

# 6. Verificar scripts npm
echo ""
echo "🔨 Verificando scripts npm..."
scripts=("dev" "build" "start" "db:migrate")
for script in "${scripts[@]}"; do
    if grep -q "\"$script\":" package.json; then
        check_success "Script '$script' encontrado"
    else
        echo -e "${RED}❌ Script '$script' não encontrado!${NC}"
        exit 1
    fi
done

# 7. Verificar portas
echo ""
echo "🌐 Verificando configuração de portas..."
PORT=$(grep "^PORT=" .env | cut -d '=' -f2)
if [ -z "$PORT" ]; then
    PORT=5000
fi
echo "Porta configurada: $PORT"
check_success "Porta configurada"

# 8. Verificar migrations
echo ""
echo "🗄️  Verificando migrations..."
migration_count=$(ls -1 drizzle/migrations/*.sql 2>/dev/null | wc -l)
if [ $migration_count -gt 0 ]; then
    echo "Migrations encontradas: $migration_count"
    check_success "Migrations disponíveis"
else
    echo -e "${RED}❌ Nenhuma migration encontrada!${NC}"
    exit 1
fi

# 9. Verificar tabelas na migration
echo ""
echo "📊 Verificando tabelas na migration..."
tables=(
    "users"
    "owners"
    "properties"
    "property_images"
    "leads"
    "blog_posts"
    "blog_categories"
    "reviews"
    "financial_movements"
    "bank_rates"
    "analytics_events"
    "campaign_sources"
    "n8n_chat_histories"
    "n8n_fila_mensagens"
    "n8n_status_atendimento"
)

for table in "${tables[@]}"; do
    if grep -q "CREATE TABLE.*${table}" drizzle/migrations/0001_initial.sql; then
        check_success "Tabela '$table' na migration"
    else
        echo -e "${RED}❌ Tabela '$table' não encontrada na migration!${NC}"
        exit 1
    fi
done

# 10. Resumo final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ VERIFICAÇÃO PRÉ-DEPLOY CONCLUÍDA!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Próximos passos:"
echo "1. Revise as variáveis de ambiente no arquivo .env"
echo "2. ALTERE senhas e chaves padrão se ainda não fez"
echo "3. Execute: docker-compose build"
echo "4. Execute: docker-compose up -d"
echo "5. Execute: docker-compose exec app npm run db:migrate"
echo ""
echo "🎯 Sistema pronto para deploy!"
