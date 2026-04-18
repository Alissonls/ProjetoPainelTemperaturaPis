---
tags: [devops, git, github, versionamento]
tipo: devops
relacionado: ["[[Como Rodar o Projeto]]", "[[Estrutura de Pastas]]"]
criado: 2026-04-17
---

# 🐙 Git e GitHub

## Repositório

```
https://github.com/Alissonls/ProjetoPainelTemperaturaPis
```

Branch principal: `main`

## Configuração Inicial (já feita)

```bash
git init
git add .
git commit -m "feat: sistema completo PoolControl - painel temperatura piscina"
git remote add origin https://github.com/Alissonls/ProjetoPainelTemperaturaPis.git
git branch -M main
git push -u origin main
```

## Fluxo de Trabalho

### Salvar alterações

```bash
git add .
git commit -m "descrição clara da mudança"
git push
```

### Boas mensagens de commit

```
feat: adiciona novo usuário técnico
fix: corrige horário exibido no painel
style: melhora fonte do display de temperatura
docs: atualiza README com IP de rede
refactor: extrai componente TemperatureDisplay
```

## .gitignore (principais exclusões)

```gitignore
node_modules/        # dependências (npm install recria)
server/dev.db        # banco de dados local
.env                 # credenciais e segredos
client/dist/         # build gerado
```

> [!caution] Nunca commite o dev.db
> O banco de dados contém dados reais dos registros. Faça backup manual copiando o arquivo.

## Clonar em Nova Máquina

```bash
git clone https://github.com/Alissonls/ProjetoPainelTemperaturaPis.git
cd ProjetoPainelTemperaturaPis
cd server && npm install && npx prisma db push && node seed.js
cd ../client && npm install && npm run dev
```

## Notas Relacionadas

- [[Como Rodar o Projeto]] — passo a passo completo
- [[Estrutura de Pastas]] — o que está no repositório
