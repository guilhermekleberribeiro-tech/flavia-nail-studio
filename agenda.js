/* ═══════════ Flávia Nail Studio — lógica compartilhada ═══════════
   Usado pelas duas páginas (index.html e agendar.html).
   Não precisa editar nada aqui — a configuração fica em config.js
   ═══════════════════════════════════════════════════════════════ */

/* ---------- armazenamento local (nunca quebra a página) ---------- */
const DB = {
  ler(chave){ try{ return JSON.parse(localStorage.getItem(chave) || "[]"); }catch(e){ return []; } },
  gravar(chave, valor){ try{ localStorage.setItem(chave, JSON.stringify(valor)); }catch(e){} }
};
const CHAVE_AG = "flavia_agendamentos";
const CHAVE_BL = "flavia_bloqueios";

/* ---------- logo reutilizável ---------- */
function montarLogos(){
  const svgEsmalte = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.6 2.2a1 1 0 0 0-1.4 0l-1.9 1.9 3.6 3.6 1.9-1.9a1 1 0 0 0 0-1.4l-2.2-2.2zM11.2 5.1 3.5 12.8a2 2 0 0 0-.5.9l-1 3.7a.6.6 0 0 0 .7.7l3.7-1a2 2 0 0 0 .9-.5l7.7-7.7-3.8-3.8zM3 20.5h18a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2z"/></svg>`;
  document.querySelectorAll("[data-logo]").forEach(el => {
    el.classList.add("logo");
    el.innerHTML = `
      <span class="logo-marca">${svgEsmalte}</span>
      <span class="logo-texto">
        <span class="logo-nome">Flávia <span class="coracao">♥</span></span>
        <span class="logo-slogan">${CONFIG.slogan}</span>
      </span>`;
  });
}

/* ---------- utilidades ---------- */
function formatarFone(n){
  if(n.startsWith("55") && n.length >= 12) return "+55 (" + n.slice(2,4) + ") " + n.slice(4,-4) + "-" + n.slice(-4);
  if(n.startsWith("351")) return "+351 " + n.slice(3,6) + " " + n.slice(6,9) + " " + n.slice(9);
  return "+" + n;
}
function dataBR(iso){ return iso.split("-").reverse().join("/"); }

function linkZapDireto(texto){
  return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texto || "Olá! Vim pelo site e gostaria de agendar um horário 💅");
}

function montarTextoAgendamento(d){
  return `Olá! Gostaria de agendar um horário 💅

*Nome:* ${d.nome}
*WhatsApp:* ${d.fone}
*Serviço:* ${d.servico}
*Data:* ${dataBR(d.data)}
*Horário:* ${d.hora}` + (d.obs ? `\n*Observação:* ${d.obs}` : "") + `

Enviado pelo site do ${CONFIG.nomeEstudio}`;
}

/* ---------- grade de horários ---------- */
function horariosOcupados(data){
  return [
    ...DB.ler(CHAVE_AG).filter(a => a.data === data).map(a => a.hora),
    ...DB.ler(CHAVE_BL).filter(b => b.data === data).map(b => b.hora)
  ];
}

function montarGrade(idData, idGrade, aoEscolher){
  const data = document.getElementById(idData).value;
  const grade = document.getElementById(idGrade);
  if(!data){ grade.innerHTML = '<span class="dica">Escolha uma data para ver os horários livres.</span>'; return null; }

  const dia = new Date(data + "T12:00:00").getDay();
  if(CONFIG.diasFechados.includes(dia)){
    grade.innerHTML = '<span style="grid-column:1/-1;color:#B4123C;font-size:.86rem">Não atendemos nesse dia. Escolha outra data 💗</span>';
    return null;
  }

  const ocupados = horariosOcupados(data);
  const agora = new Date();
  const hoje = agora.toISOString().split("T")[0];

  grade.innerHTML = CONFIG.horarios.map(h => {
    const passou = (data === hoje) && (h <= agora.toTimeString().slice(0,5));
    const bloq = ocupados.includes(h) || passou;
    return `<div class="hora ${bloq?'ocupada':''}" ${bloq?'':`data-hora="${h}"`}>${h}</div>`;
  }).join("");

  grade.querySelectorAll(".hora[data-hora]").forEach(el => {
    el.addEventListener("click", () => {
      grade.querySelectorAll(".hora").forEach(x => x.classList.remove("ativa"));
      el.classList.add("ativa");
      aoEscolher(el.dataset.hora);
    });
  });
  return true;
}

function limitesDeData(idData){
  const el = document.getElementById(idData);
  const hoje = new Date();
  const fim = new Date(); fim.setDate(fim.getDate() + (CONFIG.diasDeAntecedencia || 60));
  el.min = hoje.toISOString().split("T")[0];
  el.max = fim.toISOString().split("T")[0];
}

/* ═══════════════════════════════════════════════════════════════
   ENVIO DO AGENDAMENTO

   Dois modos, escolhidos automaticamente:

   A) CONFIG.apiUrl preenchido  → modo automático.
      Manda os dados para o seu Worker, que avisa a Flávia e envia
      a confirmação para a cliente pela WhatsApp Cloud API.
      A cliente não precisa fazer mais nada.

   B) CONFIG.apiUrl vazio  → modo manual (o de sempre).
      Abre o WhatsApp com a mensagem pronta para a cliente enviar.

   Se o modo automático falhar (Worker fora do ar, sem internet),
   cai sozinho no modo manual — a cliente nunca fica sem opção.
   ═══════════════════════════════════════════════════════════════ */

async function enviarAgendamento(dados){
  // guarda localmente para o painel e para bloquear o horário
  const lista = DB.ler(CHAVE_AG);
  lista.push({...dados, criado: new Date().toISOString()});
  DB.gravar(CHAVE_AG, lista);

  const texto = montarTextoAgendamento(dados);

  if(!CONFIG.apiUrl){
    window.open(linkZapDireto(texto), "_blank");
    return { modo: "manual" };
  }

  try{
    const resposta = await fetch(CONFIG.apiUrl + "/agendar", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        nome: dados.nome,
        telefone: dados.fone,
        servico: dados.servico,
        data: dataBR(dados.data),
        hora: dados.hora,
        observacao: dados.obs || "—"
      })
    });

    const r = await resposta.json().catch(() => ({}));
    if(!resposta.ok || !r.ok) throw new Error(r.erro || ("HTTP " + resposta.status));

    return { modo: "automatico", clienteNotificada: r.clienteNotificada !== false };

  }catch(erro){
    // rede caiu ou Worker com problema: não perde o agendamento
    console.warn("Envio automático falhou, usando WhatsApp manual:", erro.message);
    window.open(linkZapDireto(texto), "_blank");
    return { modo: "manual", falhou: true };
  }
}

/* ═══════════════════════════════════════════════════════════════
   PAINEL DA PROFISSIONAL
   ═══════════════════════════════════════════════════════════════ */

function abrirPainel(e){ if(e) e.preventDefault(); document.getElementById("modalPainel").classList.add("aberto"); }
function fecharPainel(){ document.getElementById("modalPainel").classList.remove("aberto"); }

function entrarPainel(){
  const av = document.getElementById("avisoLogin");
  if(document.getElementById("senha").value === CONFIG.senhaPainel){
    document.getElementById("telaLogin").style.display = "none";
    document.getElementById("telaPainel").style.display = "block";
    av.className = "aviso";
    renderPainel();
  }else{
    av.textContent = "Senha incorreta.";
    av.className = "aviso erro";
  }
}
function sairPainel(){
  document.getElementById("telaPainel").style.display = "none";
  document.getElementById("telaLogin").style.display = "block";
  document.getElementById("senha").value = "";
}
function trocarAba(id, btn){
  document.querySelectorAll(".aba").forEach(b => b.classList.remove("ativa"));
  document.querySelectorAll(".painel-aba").forEach(p => p.classList.remove("ativa"));
  btn.classList.add("ativa");
  document.getElementById("aba-" + id).classList.add("ativa");
}

function agsOrdenados(){
  return DB.ler(CHAVE_AG).sort((a,b) => (a.data + a.hora).localeCompare(b.data + b.hora));
}

function renderPainel(){
  const ags = agsOrdenados();
  document.getElementById("corpoAgenda").innerHTML = ags.length ? ags.map((a,i) => `
    <tr>
      <td>${dataBR(a.data)}</td>
      <td><b>${a.hora}</b></td>
      <td>${a.nome}<br><a href="https://wa.me/${a.fone.replace(/\D/g,"")}" target="_blank" rel="noopener" style="color:var(--rosa);font-size:.77rem">${a.fone}</a></td>
      <td>${a.servico}${a.obs ? `<br><small style="color:var(--texto-suave)">${a.obs}</small>` : ""}</td>
      <td><button class="mini" data-excluir="${i}">excluir</button></td>
    </tr>`).join("") : `<tr><td colspan="5" class="vazio">Nenhum agendamento registrado neste aparelho.</td></tr>`;

  document.querySelectorAll("[data-excluir]").forEach(b =>
    b.addEventListener("click", () => excluirAg(+b.dataset.excluir)));

  const bls = DB.ler(CHAVE_BL);
  document.getElementById("corpoBloqueios").innerHTML = bls.length ? bls.map((b,i) => `
    <tr><td>${dataBR(b.data)}</td><td><b>${b.hora}</b></td>
    <td><button class="mini" data-liberar="${i}">liberar</button></td></tr>`).join("")
    : `<tr><td colspan="3" class="vazio">Nenhum horário bloqueado.</td></tr>`;

  document.querySelectorAll("[data-liberar]").forEach(b =>
    b.addEventListener("click", () => desbloquear(+b.dataset.liberar)));
}

function excluirAg(i){ const l = agsOrdenados(); l.splice(i,1); DB.gravar(CHAVE_AG,l); renderPainel(); atualizarGradeSeExistir(); }
function bloquear(){
  const data = document.getElementById("blData").value, hora = document.getElementById("blHora").value;
  if(!data) return;
  const l = DB.ler(CHAVE_BL);
  if(!l.some(b => b.data === data && b.hora === hora)) l.push({data,hora});
  DB.gravar(CHAVE_BL,l); renderPainel(); atualizarGradeSeExistir();
}
function desbloquear(i){ const l = DB.ler(CHAVE_BL); l.splice(i,1); DB.gravar(CHAVE_BL,l); renderPainel(); atualizarGradeSeExistir(); }
function limparTudo(){
  if(confirm("Apagar todos os agendamentos salvos neste aparelho?")){
    DB.gravar(CHAVE_AG,[]); renderPainel(); atualizarGradeSeExistir();
  }
}
function atualizarGradeSeExistir(){ if(typeof window.recarregarGrade === "function") window.recarregarGrade(); }

function exportarCSV(){
  const l = agsOrdenados();
  const csv = "Data;Hora;Cliente;WhatsApp;Servico;Observacao\n" +
    l.map(a => [a.data,a.hora,a.nome,a.fone,a.servico,(a.obs||"").replace(/;/g,",")].join(";")).join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], {type:"text/csv;charset=utf-8"}));
  const a = document.createElement("a");
  a.href = url; a.download = "agendamentos.csv"; a.click();
  URL.revokeObjectURL(url);
}

/* ---------- monta o painel (HTML injetado nas duas páginas) ---------- */
function montarPainel(){
  const alvo = document.getElementById("modalPainel");
  if(!alvo) return;
  alvo.innerHTML = `
    <div class="modal-box">
      <div class="modal-topo">
        <h3 class="serif" style="font-size:1.5rem">Painel da profissional</h3>
        <button class="fechar" aria-label="Fechar">×</button>
      </div>
      <div id="telaLogin">
        <p style="color:var(--texto-suave);font-size:.87rem;font-weight:300;margin-bottom:18px">Área reservada. Informe a senha para ver os agendamentos e bloquear horários.</p>
        <div class="campo"><label for="senha">Senha</label><input type="password" id="senha" placeholder="••••••"></div>
        <div class="aviso" id="avisoLogin"></div>
        <button class="btn" style="margin-top:18px" id="btnEntrar">Entrar</button>
      </div>
      <div id="telaPainel" style="display:none">
        <div class="abas">
          <button class="aba ativa" data-aba="ag">Agendamentos</button>
          <button class="aba" data-aba="bl">Bloquear horários</button>
        </div>
        <div class="painel-aba ativa" id="aba-ag">
          <table class="tabela"><thead><tr><th>Data</th><th>Hora</th><th>Cliente</th><th>Serviço</th><th></th></tr></thead>
          <tbody id="corpoAgenda"></tbody></table>
          <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn pequeno linha" id="btnCSV">⬇ Exportar CSV</button>
            <button class="btn pequeno linha" id="btnLimpar">🗑 Limpar tudo</button>
          </div>
        </div>
        <div class="painel-aba" id="aba-bl">
          <p style="color:var(--texto-suave);font-size:.87rem;font-weight:300;margin-bottom:16px">Marque um dia e horário em que não estará disponível. Ele deixa de aparecer para as clientes.</p>
          <div class="linha-campos">
            <div class="campo"><label>Data</label><input type="date" id="blData"></div>
            <div class="campo"><label>Horário</label><select id="blHora"></select></div>
          </div>
          <button class="btn pequeno" id="btnBloquear">Bloquear</button>
          <table class="tabela" style="margin-top:22px"><thead><tr><th>Data</th><th>Hora</th><th></th></tr></thead>
          <tbody id="corpoBloqueios"></tbody></table>
        </div>
        <button class="btn pequeno linha" style="margin-top:26px" id="btnSair">Sair</button>
      </div>
    </div>`;

  const selBl = document.getElementById("blHora");
  CONFIG.horarios.forEach(h => selBl.add(new Option(h,h)));

  alvo.querySelector(".fechar").addEventListener("click", fecharPainel);
  alvo.addEventListener("click", e => { if(e.target.id === "modalPainel") fecharPainel(); });
  document.getElementById("btnEntrar").addEventListener("click", entrarPainel);
  document.getElementById("senha").addEventListener("keydown", e => { if(e.key === "Enter") entrarPainel(); });
  document.getElementById("btnSair").addEventListener("click", sairPainel);
  document.getElementById("btnCSV").addEventListener("click", exportarCSV);
  document.getElementById("btnLimpar").addEventListener("click", limparTudo);
  document.getElementById("btnBloquear").addEventListener("click", bloquear);
  alvo.querySelectorAll(".aba").forEach(b => b.addEventListener("click", () => trocarAba(b.dataset.aba, b)));
  document.querySelectorAll("[data-abrir-painel]").forEach(el =>
    el.addEventListener("click", abrirPainel));
}

/* ---------- inicialização comum ---------- */
function iniciarComum(){
  montarLogos();
  montarPainel();
  document.querySelectorAll("[data-zap]").forEach(a => a.href = linkZapDireto());
  document.querySelectorAll("[data-ano]").forEach(el => el.textContent = new Date().getFullYear());
  document.querySelectorAll("[data-endereco]").forEach(el => el.textContent = CONFIG.endereco);
  document.querySelectorAll("[data-fone]").forEach(el => el.textContent = formatarFone(CONFIG.whatsapp));
  document.querySelectorAll("[data-instagram]").forEach(a => a.href = CONFIG.instagram);
}
