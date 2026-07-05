export function getContratosPorEmenda(store, emendaId) {
  return store.contratos.filter((contrato) => contrato.emenda_id === emendaId);
}

export function getAtasPorContrato(store, contratoId) {
  return store.atas.filter((ata) => ata.contrato_id === contratoId);
}

export function getExecucoesPorContrato(store, contratoId) {
  return store.execucoes.filter((execucao) => execucao.contrato_id === contratoId);
}
