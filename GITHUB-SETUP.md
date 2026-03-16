# GitHub do Projeto

Este arquivo deixa o projeto pronto para um fluxo simples de GitHub.

## Estrutura recomendada

- Branch principal: `main`
- Branches curtas por tarefa
- Commits pequenos e objetivos

## Nomes de branch sugeridos

- `feat/home-layout`
- `feat/coach-tai-base`
- `fix/profile-page`
- `chore/github-setup`

## Padrão de commit

Use mensagens como:

```text
feat(home): atualizar layout da tela inicial
feat(coach): adicionar endpoint mock do coach tai
fix(profile): salvar dados no localStorage
chore(cursor): adicionar agentes e skills do projeto
```

## Passo a passo inicial

1. Criar o repositório no GitHub.
2. Inicializar git localmente.
3. Conectar o remoto.
4. Fazer o primeiro commit.
5. Enviar para `main`.

## Comandos base

```bash
git init
git branch -M main
git add .
git commit -m "chore(project): preparar estrutura inicial"
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```

## Fluxo diário recomendado

1. Criar uma branch:

```bash
git checkout -b feat/nome-da-tarefa
```

2. Fazer mudanças pequenas e testar.

3. Commitar:

```bash
git add .
git commit -m "feat(area): resumo da mudanca"
```

4. Enviar para o GitHub:

```bash
git push -u origin HEAD
```

5. Abrir PR para `main`.

## Checklist antes de subir

- O app abre sem erro
- `npm run build` passa
- A funcionalidade foi testada
- Não há arquivos sensíveis no commit

## Integração futura

Quando você quiser, o próximo passo natural é:

- conectar deploy na Vercel
- ativar PRs no GitHub
- usar o agente `github-organizer` para branches, commits e PRs

