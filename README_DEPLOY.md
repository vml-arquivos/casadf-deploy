# 🚀 Guia de Deploy - CasaDF CRM

Sistema completo de consultoria imobiliária com CRM integrado, automação via WhatsApp e gestão de imóveis.

## 📋 Pré-requisitos

- **VPS Google Cloud Compute Engine** (ou qualquer VPS com Ubuntu 22.04+)
- **Docker** e **Docker Compose** instalados
- **PostgreSQL 16** (via Docker)
- **Domínio configurado** (opcional, mas recomendado)
- **Acesso SSH** à VPS

---

## 🔧 Passo 1: Preparar o Servidor

### 1.1 Conectar à VPS via SSH

```bash
ssh usuario@IP_DA_VPS
```

### 1.2 Instalar Docker e Docker Compose

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose -y

# Verificar instalação
docker --version
docker-compose --version
```

### 1.3 Instalar Git

```bash
sudo apt install git -y
```

---

## 📦 Passo 2: Clonar o Repositório

```bash
# Navegar para o diretório home
cd ~

# Clonar repositório
git clone https://github.com/vml-arquivos/casadf-deploy.git

# Entrar no diretório
cd casadf-deploy
```

---

## ⚙️ Passo 3: Configurar Variáveis de Ambiente

### 3.1 Criar arquivo .env

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env
nano .env
```

### 3.2 Configurar variáveis essenciais

```env
# Banco de Dados PostgreSQL
DB_USER=casadf_admin
DB_PASSWORD=SUA_SENHA_FORTE_AQUI
DB_NAME=casadf_crm

# JWT Secret (gerar com: openssl rand -base64 32)
JWT_SECRET=SUA_CHAVE_JWT_AQUI

# CORS
ALLOWED_ORIGINS=https://seudominio.com.br

# N8N (se usar automação)
N8N_WEBHOOK_URL=https://n8n.seudominio.com.br/webhook
```

**⚠️ IMPORTANTE:** Nunca use senhas fracas ou padrões em produção!

---

## 🏗️ Passo 4: Build e Deploy

### 4.1 Build da aplicação

```bash
# Build dos containers
docker-compose build
```

### 4.2 Subir os serviços

```bash
# Subir em modo detached (background)
docker-compose up -d
```

### 4.3 Verificar status

```bash
# Ver logs
docker-compose logs -f

# Ver containers rodando
docker ps
```

---

## 🗄️ Passo 5: Configurar Banco de Dados

### 5.1 Aplicar migrations

```bash
# Executar migrations dentro do container
docker-compose exec app npm run db:migrate
```

### 5.2 Popular dados iniciais (opcional)

```bash
# Seed do banco de dados
docker-compose exec app npm run db:seed
```

---

## 🌐 Passo 6: Configurar Domínio e SSL (Opcional)

### 6.1 Instalar Nginx

```bash
sudo apt install nginx -y
```

### 6.2 Configurar proxy reverso

Criar arquivo de configuração:

```bash
sudo nano /etc/nginx/sites-available/casadf
```

Adicionar configuração:

```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ativar configuração:

```bash
sudo ln -s /etc/nginx/sites-available/casadf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6.3 Instalar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br

# Renovação automática já está configurada
```

---

## 🔍 Passo 7: Verificar Funcionamento

### 7.1 Testar aplicação

```bash
# Verificar se a aplicação está respondendo
curl http://localhost:5000/health
```

### 7.2 Acessar via navegador

- **Site público:** `http://seudominio.com.br`
- **CRM Admin:** `http://seudominio.com.br/admin`

### 7.3 Credenciais padrão (se seed foi executado)

- **Email:** admin@casadf.com.br
- **Senha:** admin123

**⚠️ ALTERE A SENHA IMEDIATAMENTE APÓS O PRIMEIRO LOGIN!**

---

## 📊 Comandos Úteis

### Gerenciar containers

```bash
# Parar containers
docker-compose stop

# Iniciar containers
docker-compose start

# Reiniciar containers
docker-compose restart

# Ver logs
docker-compose logs -f app

# Entrar no container
docker-compose exec app sh
```

### Atualizar aplicação

```bash
# Fazer pull das atualizações
git pull origin main

# Rebuild e restart
docker-compose down
docker-compose build
docker-compose up -d

# Aplicar migrations
docker-compose exec app npm run db:migrate
```

### Backup do banco de dados

```bash
# Criar backup
docker-compose exec db pg_dump -U casadf_admin casadf_crm > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker-compose exec -T db psql -U casadf_admin casadf_crm < backup_20250101.sql
```

---

## 🔒 Segurança

### Checklist de segurança

- [ ] Alterar senha do banco de dados
- [ ] Gerar nova chave JWT
- [ ] Configurar firewall (UFW)
- [ ] Habilitar SSL/HTTPS
- [ ] Configurar backups automáticos
- [ ] Alterar senha do admin após primeiro login
- [ ] Revisar permissões de arquivos
- [ ] Configurar monitoramento

### Configurar firewall

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ver status
sudo ufw status
```

---

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs app

# Verificar configuração
docker-compose config
```

### Erro de conexão com banco

```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps db

# Ver logs do banco
docker-compose logs db

# Testar conexão
docker-compose exec app psql -h db -U casadf_admin -d casadf_crm
```

### Aplicação não responde

```bash
# Verificar portas em uso
sudo netstat -tulpn | grep 5000

# Reiniciar containers
docker-compose restart

# Verificar recursos do servidor
htop
df -h
```

---

## 📞 Suporte

Para suporte técnico ou dúvidas:

- **Email:** suporte@casadf.com.br
- **Documentação completa:** Ver arquivos `DEPLOY.md` e `API_DOCUMENTATION.md`

---

## 📝 Notas Importantes

1. **Backup Regular:** Configure backups automáticos do banco de dados
2. **Monitoramento:** Use ferramentas como Grafana/Prometheus para monitorar a aplicação
3. **Logs:** Mantenha logs organizados e faça rotação regular
4. **Atualizações:** Mantenha o sistema e dependências sempre atualizados
5. **Segurança:** Revise periodicamente as configurações de segurança

---

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Cadastrar imóveis no CRM
2. ✅ Configurar integração com N8N
3. ✅ Personalizar layout e cores
4. ✅ Configurar WhatsApp Business
5. ✅ Adicionar conteúdo ao blog
6. ✅ Testar simulador de financiamento
7. ✅ Configurar analytics

---

**Desenvolvido com ❤️ para CasaDF Consultoria Imobiliária**
