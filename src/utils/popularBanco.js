import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';

const servicosIniciais = [
  { nome: 'Mão', preco: 45.00, tempo: 30 },
  { nome: 'Pé', preco: 55.00, tempo: 30 },
  { nome: 'Esfoliação', preco: 20.00, tempo: 15 },
  { nome: 'Francesinha', preco: 10.00, tempo: 15 },
  { nome: 'Plástica dos Pés', preco: 130.00, tempo: 60 },
  { nome: 'Esmaltação em Gel (Mão)', preco: 100.00, tempo: 45 },
  { nome: 'Esmaltação em Gel (Pé)', preco: 120.00, tempo: 45 },
  { nome: 'Top Coat Gel', preco: 30.00, tempo: 15 },
  { nome: 'Blindagem', preco: 150.00, tempo: 60 },
  { nome: 'Sobrancelha (Navalha, Linha, Cera)', preco: 55.00, tempo: 30 },
  { nome: 'Sobrancelha com Henna', preco: 70.00, tempo: 45 },
  { nome: 'Virilha Cavada', preco: 90.00, tempo: 30 },
  { nome: 'Virilha Completa', preco: 110.00, tempo: 40 },
  { nome: 'Perna Inteira', preco: 75.00, tempo: 40 },
  { nome: 'Meia Perna', preco: 50.00, tempo: 30 },
  { nome: 'Axilas', preco: 35.00, tempo: 20 },
  { nome: 'Buço', preco: 35.00, tempo: 15 },
  { nome: 'Nariz', preco: 25.00, tempo: 15 },
  { nome: 'Queixo', preco: 35.00, tempo: 15 }
];

const pacotesIniciais = [
  { 
    nome: '4 Mãos', 
    preco: 152.00, 
    descricao: 'Neste pacote você reserva o horário fixo e faz a mão por quatro semanas consecutivas.' 
  },
  { 
    nome: '4 Mãos + 2 Pés', 
    preco: 242.00, 
    descricao: 'Neste pacote você faz a mão por quatro semanas consecutivas e o pé a cada 15 dias.' 
  },
  { 
    nome: '4 Mãos + 4 Pés', 
    preco: 332.00, 
    descricao: 'Neste pacote você faz pé e mão nas quatro semanas consecutivas.' 
  }
];

export async function popularBancoDeDados() {
  try {
    for (const servico of servicosIniciais) {
      await addDoc(collection(db, 'servicos'), servico);
    }
    for (const pacote of pacotesIniciais) {
      await addDoc(collection(db, 'pacotes'), pacote);
    }
    console.log("Serviços e pacotes oficiais adicionados com sucesso!");
    alert("Banco de dados populado com sucesso!");
  } catch (error) {
    console.error("Erro ao popular base de dados:", error);
    alert("Erro ao popular base de dados.");
  }
}