# 🚀 Guia Rápido de Deploy - CasaDF CRM

## ⚡ Deploy em 5 Minutos

### 1️⃣ Pré-requisitos

```bash
# Verificar se Docker está instalado
docker --version

# Verificar se Docker Compose está instalado
docker compose version
```

Se não estiver instalado:

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### 2️⃣ Clonar Repositório

```bash
git clone https://github.com/vml-arquivos/casadf-deploy.git
cd casadf-deploy
```

### 3️⃣ Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env
nano .env
```

**⚠️ ALTERE OBRIGATORIAMENTE:**

```env
# Senha do banco de dados (use uma senha forte!)
DB_PASSWORD=SUA_SENHA_FORTE_AQUI

# Chave JWT (gere com: openssl rand -base64 32)
JWT_SECRET=SUA_CHAVE_JWT_AQUI

# Domínios permitidos (seu domínio em produção)
ALLOWED_ORIGINS=https://seudominio.com.br
```

### 4️⃣ Verificar Sistema (Opcional)

```bash
# Executar verificação pré-deploy
./scripts/pre-deploy-check.sh
```

### 5️⃣ Deploy

```bash
# Build das imagens Docker
docker compose build

# Subir containers em background
docker compose up -d

# Aplicar migrations do banco de dados
docker compose exec app npm run db:migrate

# (Opcional) Popular banco com dados iniciais
docker compose exec app node -e "require('./server/seed.ts')"
```

### 6️⃣ Verificar Funcionamento

```bash
# Ver logs
docker compose logs -f app

# Ver status dos containers
docker compose ps

# Testar health check
curl http://localhost:5000/health
```

**Acessar aplicação:**
- Site: http://localhost:5000
- Admin: http://localhost:5000/admin
- API: http://localhost:5000/api/trpc

---

## 🔐 Credenciais Padrão

Após executar o seed:

- **Email:** admin@casadf.com.br
- **Senha:** admin123

**⚠️ ALTERE A SENHA IMEDIATAMENTE APÓS O PRIMEIRO LOGIN!**

---

## 🛠️ Comandos Úteis

### Gerenciar Containers

```bash
# Parar containers
docker compose stop

# Iniciar containers
docker compose start

# Reiniciar containers
docker compose restart

# Parar e remover containers
docker compose down

# Ver logs em tempo real
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f app
docker compose logs -f db
```

### Gerenciar Banco de Dados

```bash
# Entrar no container do banco
docker compose exec db psql -U casadf_admin -d casadf_crm

# Backup do banco
docker compose exec db pg_dump -U casadf_admin casadf_crm > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker compose exec -T db psql -U casadf_admin casadf_crm < backup_20250101.sql

# Ver tabelas
docker compose exec db psql -U casadf_admin -d casadf_crm -c "\dt"
```

### Gerenciar Aplicação

```bash
# Entrar no container da aplicação
docker compose exec app sh

# Executar migrations
docker compose exec app npm run db:migrate

# Executar seed
docker compose exec app node -e "require('./server/seed.ts')"

# Ver variáveis de ambiente
docker compose exec app env | grep -E "(DB_|JWT_|NODE_)"
```

### Atualizar Aplicação

```bash
# Fazer pull das atualizações
git pull origin main

# Rebuild e restart
docker compose down
docker compose build
docker compose up -d

# Aplicar novas migrations
docker compose exec app npm run db:migrate
```

---

## 🌐 Deploy em Produção com Domínio

### 1. Configurar Nginx

```bash
# Instalar Nginx
sudo apt install nginx -y

# Criar configuração
sudo nano /etc/nginx/sites-available/casadf
```

**Configuração Nginx:**

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

```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/casadf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. Configurar SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br

# Renovação automática já está configurada
```

### 3. Configurar Firewall

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
docker compose logs app

# Verificar configuração
docker compose config

# Verificar se a porta está em uso
sudo netstat -tulpn | grep 5000
```

### Erro de conexão com banco

```bash
# Verificar se o PostgreSQL está rodando
docker compose ps db

# Ver logs do banco
docker compose logs db

# Testar conexão
docker compose exec app node -e "require('./server/db').pool.query('SELECT 1').then(() => console.log('✅ Conexão OK')).catch(e => console.error('❌ Erro:', e))"
```

### Erro de permissão

```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar permissões
ls -la /var/run/docker.sock
```

### Aplicação não responde

```bash
# Verificar recursos do servidor
htop
df -h

# Reiniciar containers
docker compose restart

# Limpar cache do Docker
docker system prune -a
```

---

## 📊 Monitoramento

### Ver Recursos

```bash
# Ver uso de recursos dos containers
docker stats

# Ver espaço em disco
docker system df
```

### Logs

```bash
# Ver últimas 100 linhas
docker compose logs --tail=100 app

# Seguir logs em tempo real
docker compose logs -f app

# Filtrar logs por erro
docker compose logs app | grep -i error
```

---

## 🔒 Checklist de Segurança

Antes de colocar em produção:

- [ ] Alterar senha do banco de dados (DB_PASSWORD)
- [ ] Gerar nova chave JWT (JWT_SECRET)
- [ ] Configurar ALLOWED_ORIGINS com domínios reais
- [ ] Alterar senha do admin após primeiro login
- [ ] Configurar SSL/HTTPS
- [ ] Configurar firewall (UFW)
- [ ] Configurar backups automáticos
- [ ] Revisar permissões de arquivos
- [ ] Configurar monitoramento
- [ ] Testar todas as funcionalidades

---

## 📞 Suporte

- **Documentação completa:** README_DEPLOY.md
- **Relatório técnico:** RELATORIO_CORRECOES_2025.md
- **API:** API_DOCUMENTATION.md
- **Repositório:** https://github.com/vml-arquivos/casadf-deploy

---

**Desenvolvido com ❤️ para CasaDF Consultoria Imobiliária**  
**Versão:** 2.1.0
