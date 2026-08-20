# Guia: ligar o envio automático no WhatsApp

Este guia liga o modo em que **o próprio sistema** manda o agendamento para a Flávia
e a confirmação para a cliente, sem ninguém precisar apertar "enviar".

Enquanto você não terminar, **o site continua funcionando** no modo manual (abre o
WhatsApp com a mensagem pronta). Nada quebra no meio do caminho.

---

## Antes de começar: o que isso custa

A Meta cobra **por mensagem entregue**, por categoria. As nossas duas mensagens são
da categoria **utilidade** (*utility*), a mais barata:

| Mensagem | Categoria | Custo aproximado no Brasil |
|---|---|---|
| Aviso para a Flávia | utilidade | ~R$ 0,04 – 0,05 |
| Confirmação para a cliente | utilidade | ~R$ 0,04 – 0,05 |
| **Total por agendamento** | | **~R$ 0,10** |

Ou seja: **100 agendamentos por mês ≈ R$ 10**.

Dois detalhes que ajudam no bolso:

- Se a cliente responder, abre uma **janela de serviço de 24 horas** em que toda
  conversa é **gratuita**. Só as mensagens que *você* inicia é que são cobradas.
- Desde julho de 2025 a cobrança é por mensagem, não mais por conversa — então não
  adianta "agrupar" mensagens para economizar.

---

## ⚠️ O ponto de atenção mais importante

O número que você usar na Cloud API **não pode estar em uso** no WhatsApp comum nem
no WhatsApp Business (aplicativo). Ao cadastrar, ele **sai do aplicativo**.

Você tem duas saídas:

- **Recomendado:** usar um **número novo** (um chip pré-pago barato, ou um número
  virtual) só para o sistema. A Flávia continua com o WhatsApp dela normal no
  celular, e recebe os avisos nele.
- Migrar o número atual da Flávia — ela perde o app e passa a atender só por
  ferramenta externa. **Não recomendo** para um estúdio pequeno.

O `OWNER_PHONE` (onde a Flávia *recebe*) pode ser o WhatsApp normal dela. Só o
número **remetente** precisa ser dedicado.

---

## Parte 1 — Cadastro na Meta (você faz, ~30 min + espera)

1. Acesse **developers.facebook.com** e entre com uma conta do Facebook.
2. **Meus Apps → Criar app → tipo "Empresa"**.
3. No painel do app, adicione o produto **WhatsApp**.
4. Crie ou selecione uma **Conta do WhatsApp Business (WABA)**.
5. Em **Configuração da API**, clique em **Adicionar número de telefone** e cadastre
   o número dedicado. Confirme o código por SMS ou ligação.
6. Anote o **Identificação do número de telefone** (*Phone number ID*) — é um número
   longo. Você vai precisar dele.

> A Meta pede **verificação do negócio** (documento da empresa) para liberar volume
> maior. No começo, sem verificar, você já consegue enviar para poucos números de
> teste — o suficiente para testar tudo antes de valer.

### Gerar o token permanente

O token que aparece na tela inicial expira em 24 horas. Para o sistema funcionar
sempre, gere um permanente:

1. **business.facebook.com** → **Configurações do negócio** → **Usuários → Usuários do sistema**.
2. **Adicionar** → nome: `agenda-flavia` → função **Administrador**.
3. **Adicionar ativos** → sua WABA → permissão de **controle total**.
4. **Gerar novo token** → escolha o app → marque `whatsapp_business_messaging`
   e `whatsapp_business_management` → **Gerar**.
5. **Copie e guarde esse token agora** — ele não aparece de novo.

---

## Parte 2 — Criar os dois modelos de mensagem

Em **WhatsApp Manager → Modelos de mensagem → Criar modelo**.
Os dois são categoria **Utilidade**, idioma **Português (BR)**.

### Modelo 1 — `novo_agendamento` (vai para a Flávia)

Nome exato: `novo_agendamento`

Corpo:

```
Novo agendamento pelo site 💅

Cliente: {{1}}
Serviço: {{2}}
Data: {{3}}
Horário: {{4}}
WhatsApp: {{5}}
Observação: {{6}}
```

Exemplos para preencher na aprovação: `Maria Silva`, `Manicure`, `26/08/2026`,
`09:00`, `+55 (11) 98888-7777`, `Prefiro cor nude`

### Modelo 2 — `confirmacao_agendamento` (vai para a cliente)

Nome exato: `confirmacao_agendamento`

Corpo:

```
Oi, {{1}}! Seu horário no Flávia Nail Studio está reservado ✨

Serviço: {{2}}
Data: {{3}}
Horário: {{4}}

Se precisar remarcar ou cancelar, é só responder esta mensagem.
Até lá! 💗
```

Exemplos: `Maria Silva`, `Manicure`, `26/08/2026`, `09:00`

> A aprovação costuma sair em minutos, mas pode levar até 24h. **Só siga para a
> Parte 3 quando os dois estiverem "Ativo / Aprovado".**
>
> Se algum for recusado, quase sempre é por ter sido classificado como *marketing*:
> tire qualquer palavra promocional e reenvie como *utilidade*.

---

## Parte 3 — Publicar o Worker (~10 min)

O Worker é o intermediário que guarda o token com segurança. O site é público —
se o token ficasse nele, qualquer um poderia usar sua conta.

**Cloudflare Workers é gratuito** até 100.000 requisições por dia.

1. Crie uma conta em **dash.cloudflare.com** (grátis, sem cartão).
2. No seu computador, com Node.js instalado, dentro da pasta `worker/`:

```bash
npx wrangler login
```

3. Abra o `wrangler.toml` e ajuste as três variáveis:

```toml
OWNER_PHONE    = "351910305226"   # WhatsApp onde a Flávia RECEBE os avisos
COUNTRY_CODE   = "351"            # país das clientes: "55" Brasil, "351" Portugal
ALLOWED_ORIGIN = "https://guilhermekleberribeiro-tech.github.io"
```

4. Guarde as duas chaves secretas (elas não vão para o arquivo):

```bash
npx wrangler secret put WHATSAPP_TOKEN
npx wrangler secret put PHONE_NUMBER_ID
```

5. Publique:

```bash
npx wrangler deploy
```

Ao final, ele mostra o endereço, algo como:
`https://agenda-flavia.SEU-USUARIO.workers.dev`

---

## Parte 4 — Ligar no site (1 min)

No GitHub, abra o arquivo **`config.js`**, clique no lápis e preencha:

```js
apiUrl: "https://agenda-flavia.SEU-USUARIO.workers.dev",
```

**Commit changes.** Em cerca de um minuto o site já está enviando sozinho.

Confira também, no mesmo arquivo:

```js
whatsapp: "351910305226",   // precisa bater com o OWNER_PHONE do Worker
```

---

## Como testar

1. Abra a página de agendamento e faça um agendamento de mentira com **o seu
   próprio número**.
2. Você deve receber **duas** mensagens: o aviso (no `OWNER_PHONE`) e a
   confirmação (no número que digitou no formulário).
3. Se só chegar uma, veja os logs: `npx wrangler tail`.

### Se algo der errado

| Sintoma | Causa mais provável |
|---|---|
| Abriu o WhatsApp com a mensagem pronta | O `apiUrl` está vazio ou o Worker não respondeu — é o modo de segurança agindo |
| `worker_sem_credenciais` | Faltou rodar `wrangler secret put` |
| `origem_nao_autorizada` | O `ALLOWED_ORIGIN` não bate com o endereço do site (cuidado com a barra no final) |
| `Template name does not exist` | O nome do modelo está diferente, ou ainda não foi aprovado |
| `Recipient phone number not in allowed list` | Conta ainda em modo de teste — adicione o número em *Configuração da API* ou conclua a verificação do negócio |

---

## O que continua igual

- O **painel da profissional** segue funcionando como antes, salvo no navegador.
  Com o envio automático ligado, o WhatsApp da Flávia vira o registro confiável.
- Se o Worker cair ou a internet falhar, o site **volta sozinho** para o modo
  manual. Nenhum agendamento se perde.

---

## Fontes

- [WhatsApp Business API Pricing in Brazil 2026 — Message Central](https://www.messagecentral.com/blog/whatsapp-business-api-pricing-brazil)
- [WhatsApp Business API Pricing in 2026: categorias e o que mudou — Blueticks](https://blueticks.co/blog/whatsapp-business-api-pricing-2026)
