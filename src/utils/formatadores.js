export function formatarMoeda(valor) {
  const numero = limpiApenasNumeros(valor) / 100;
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function limparMoedaParaNumero(valorMoeda) {
  if (!valorMoeda) return 0;
  const limpo = String(valorMoeda).replace(/[^\d]/g, '');
  return Number(limpo) / 100;
}

export function formatarMinutosParaHoras(minutosTotais) {
  const min = Number(minutosTotais);
  if (!min || isNaN(min)) return '0min';
  const horas = Math.floor(min / 60);
  const minutosRestantes = min % 60;
  if (horas === 0) return `${minutosRestantes}min`;
  if (minutosRestantes === 0) return `${horas}h`;
  return `${horas}h${minutosRestantes < 10 ? '0' : ''}${minutosRestantes}`;
}

function limpiApenasNumeros(texto) {
  return String(texto).replace(/\D/g, '');
}