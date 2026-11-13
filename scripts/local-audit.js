import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function lerArquivosDiretorio(dir, lista = []) {
  const arquivos = fs.readdirSync(dir);
  for (const arquivo of arquivos) {
    const caminhoCompleto = path.join(dir, arquivo);
    if (fs.statSync(caminhoCompleto).isDirectory()) {
      if (!caminhoCompleto.includes('node_modules') && !caminhoCompleto.includes('.expo')) {
        lerArquivosDiretorio(caminhoCompleto, lista);
      }
    } else if (caminhoCompleto.endsWith('.js')) {
      lista.push(caminhoCompleto);
    }
  }
  return lista;
}

async function rodarAuditoriaLocal() {
  try {
    console.log("A analisar arquivos do projeto localmente...");
    const arquivos = lerArquivosDiretorio('./src');
    
    let codigoConsolidado = '';
    for (const arq of arquivos) {
      const conteudo = fs.readFileSync(arq, 'utf8');
      codigoConsolidado += `\n--- ARQUIVO: ${arq} ---\n${conteudo}\n`;
    }

    const prompt = `Analisa o código deste projeto React Native (Expo Router e Firebase) abaixo. Identifica bugs, problemas de lógica, telas faltantes ou inconsistências de design e dá sugestões diretas em português:\n\n${codigoConsolidado}`;

    console.log("A enviar para o Google Gemini...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    console.log("\n================ RELATÓRIO DA IA ================\n");
    console.log(response.text);
    console.log("\n=================================================\n");

  } catch (error) {
    console.error("Erro ao executar auditoria:", error);
  }
}

rodarAuditoriaLocal();