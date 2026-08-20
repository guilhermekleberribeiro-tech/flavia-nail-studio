/* ═══════════════════════════════════════════════════════════════
   CONFIGURAÇÃO DO SITE — este é o ÚNICO arquivo que você precisa
   editar no dia a dia. Salvou aqui, muda no site inteiro.
   ═══════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* ---------- 1. CONTATO ---------- */

  // WhatsApp da Flávia, com código do país e SÓ NÚMEROS.
  // Brasil:   55 + DDD + número   →  "5511999999999"
  // Portugal: 351 + número        →  "351910305226"
  whatsapp: "351910305226",

  nomeEstudio: "Flávia Nail Studio",
  slogan: "Cuidado, beleza e carinho em cada detalhe",
  instagram: "https://instagram.com/SEU_INSTAGRAM",
  endereco: "Rua Exemplo, 123 · Centro · Sua Cidade – UF",

  // Senha do painel. Atenção: o repositório é público, então esta
  // senha só serve para evitar curiosos — não é segurança de verdade.
  senhaPainel: "flavia2026",


  /* ---------- 2. ENVIO AUTOMÁTICO (WhatsApp Cloud API) ---------- */

  // Cole aqui o endereço do seu Worker depois de publicá-lo.
  // Ex.: "https://agenda-flavia.SEU-USUARIO.workers.dev"
  //
  // Enquanto estiver VAZIO, o site funciona no modo antigo:
  // abre o WhatsApp com a mensagem pronta para a cliente enviar.
  // Assim que você colar o endereço, passa a enviar sozinho.
  apiUrl: "",


  /* ---------- 3. HORÁRIOS ---------- */

  horarios: ["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00"],

  // Dias sem atendimento — 0=domingo, 1=segunda, ... 6=sábado
  diasFechados: [0, 1],

  // Quantos dias à frente a cliente pode agendar
  diasDeAntecedencia: 60,


  /* ---------- 4. SERVIÇOS ---------- */
  /* Para trocar uma foto: substitua o endereço em "foto".
     Pode ser um link, ou um arquivo seu na pasta: "fotos/minha-foto.jpg" */

  servicos: [
    {
      nome: "Manicure",
      desc: "Cutilagem caprichada, lixamento e esmaltação com acabamento perfeito.",
      preco: "R$ 45,00",
      obs: "aprox. 45 min",
      foto: "https://images.unsplash.com/photo-1612887390768-fb02affea7a6?auto=format&fit=crop&w=700&q=80"
    },
    {
      nome: "Pedicure",
      desc: "Cuidado completo dos pés, com esfoliação e hidratação.",
      preco: "R$ 55,00",
      obs: "aprox. 50 min",
      foto: "https://images.unsplash.com/photo-1664643411326-6c589531be3c?auto=format&fit=crop&w=700&q=80"
    },
    {
      nome: "Mão + Pé",
      desc: "O combo mais pedido: manicure e pedicure no mesmo atendimento.",
      preco: "R$ 85,00",
      obs: "aprox. 1h30",
      foto: "https://images.unsplash.com/photo-1529982412356-901cc3a363cf?auto=format&fit=crop&w=700&q=80"
    },
    {
      nome: "Alongamento em Gel",
      desc: "Unhas alongadas, resistentes e naturais, no formato que você quiser.",
      preco: "R$ 160,00",
      obs: "aprox. 2h",
      foto: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=700&q=80"
    },
    {
      nome: "Nail Art",
      desc: "Desenhos, pedrarias e encapsuladas para deixar sua unha única.",
      preco: "a partir de R$ 15,00",
      obs: "por unha",
      foto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=700&q=80"
    },
    {
      nome: "Plástica dos Pés",
      desc: "Novidade! Remove asperezas e devolve maciez e aparência renovada.",
      preco: "R$ 110,00",
      obs: "promoção de lançamento",
      foto: "https://images.unsplash.com/photo-1519419451778-14599a49ec41?auto=format&fit=crop&w=700&q=80",
      destaque: true
    }
  ],


  /* ---------- 5. FOTOS DAS SEÇÕES ---------- */

  fotos: {
    hero:     "https://images.unsplash.com/photo-1610992015762-45dca7fa3a85?auto=format&fit=crop&w=900&q=80",
    sobre:    "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=80",
    plastica: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=900&q=80",
    galeria: [
      { url:"https://images.unsplash.com/photo-1630843599725-32ead7671867?auto=format&fit=crop&w=700&q=80", legenda:"Francesinha clássica" },
      { url:"https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?auto=format&fit=crop&w=700&q=80", legenda:"Nail art colorida" },
      { url:"https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=700&q=80", legenda:"Plástica dos Pés" },
      { url:"https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=700&q=80", legenda:"Esmaltação nude" }
    ]
  }
};
