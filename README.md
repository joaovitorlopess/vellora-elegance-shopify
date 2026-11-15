# Vellora Elegance – Tema Shopify

Código do tema da loja **Vellora Elegance** (`r7apsd-he.myshopify.com`).

## Estrutura

| Caminho | Conteúdo |
|---|---|
| raiz (`assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`) | Tema de trabalho **"Vellora – Dev (ref. Lelis)"** (ID `193500381218`, não publicado), duplicado de `vellora-elegance-tema-v1-3-fotos` |
| `backups/tema-ao-vivo-vellora-elegance-shopify/` | Backup somente leitura do tema publicado (ID `193097957410`) em 15/11/2026 |

`backups/` está no `.shopifyignore` e nunca é enviado para a loja.

## Temas na loja

| Tema | ID | Papel |
|---|---|---|
| vellora-elegance-shopify | 193097957410 | **Publicado (ao vivo)** – não editar |
| vellora-elegance-tema-v1-3-fotos | 193471807522 | Original da cópia de trabalho – não editar |
| Vellora – Dev (ref. Lelis) | 193500381218 | **Cópia de trabalho** |

## Fluxo de trabalho

Todas as alterações são feitas apenas no tema de trabalho (`193500381218`). Nada é publicado sem aprovação explícita.

```bash
# baixar o estado atual da cópia de trabalho
shopify theme pull --store r7apsd-he.myshopify.com --theme 193500381218

# enviar alterações para a cópia de trabalho (nunca para o tema ao vivo)
shopify theme push --store r7apsd-he.myshopify.com --theme 193500381218

# pré-visualização local
shopify theme dev --store r7apsd-he.myshopify.com --theme 193500381218
```

Pré-visualização na loja: https://r7apsd-he.myshopify.com?preview_theme_id=193500381218
