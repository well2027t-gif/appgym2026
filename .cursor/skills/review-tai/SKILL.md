---
name: review-tai
description: Revisa mudanças com foco em bugs, regressões, incoerências visuais e riscos de UX. Use quando o usuário pedir review, conferência, validação ou checagem final de uma implementação.
---
# Review TAI

## Objetivo

Encontrar problemas reais antes da publicação.

## Instruções

1. Priorize bugs e regressões.
2. Depois avalie consistência visual e UX mobile.
3. Considere navegação, estado, storage e resposta do backend.
4. Verifique se o layout continua funcional em telas pequenas.
5. Só depois cite melhorias opcionais.

## Formato da resposta

- Liste primeiro os achados mais graves.
- Cite arquivos afetados.
- Se não houver problemas, diga isso claramente.

## Riscos comuns neste projeto

- Alterações na `Home` quebrarem o layout mobile.
- Fluxos que dependem de `localStorage` ficarem inconsistentes.
- Rotas do `wouter` perderem navegação esperada.
- Mudanças visuais removerem funcionalidades por acidente.

