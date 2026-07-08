const express = require('express');
const app = express();
const cors = require('cors');

// Middleware para o Express entender arquivos JSON recebidos no body (Postman)
app.use(express.json());
app.use(cors()); // Permite que o seu front-end converse com a API


// Importando o NOSSO repositório do Garixos
const empresaRepo = require('./repositories/empresaRepository.js'); // Ajuste o caminho da pasta se você salvou em outro lugar
const usuarioRepo = require('./repositories/usuarioRepository.js'); // Ajuste o caminho se necessário
const enderecoRepo = require('./repositories/enderecoRepository.js'); // Ajuste o caminho se necessário
const zonaColetaRepo = require('./repositories/zonaColetaRepository.js');
const veiculoRepo = require('./repositories/veiculoRepository.js');
const solicitacaoRepo = require('./repositories/solicitacaoRepository.js');
const suporteRepo = require('./repositories/suporteRepository.js');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
  : null;

const ASSISTANT_SYSTEM_PROMPT = `
Você é a Assistente Virtual do Garixos, uma plataforma municipal de coleta inteligente de resíduos.
Seu nome é Gari. Você é simpática, prestativa e objetiva. Responda sempre em português brasileiro.
Mantenha respostas curtas e diretas (máximo 3 parágrafos).

SOBRE O GARIXOS:
- Plataforma que conecta cidadãos a empresas de coleta de resíduos urbanos
- Funcionalidades principais:
  1. Histórico de Solicitações: consulta de todas as coletas solicitadas (data, hora, local, status)
  2. Mapa em Tempo Real: visualização de caminhões e pontos de coleta próximos
  3. Solicitar Coleta: solicitar retirada de lixo no endereço (orgânico, reciclável, eletrônico, poda, entulho)
  4. Horários de Coleta: tabela com dias e horários por tipo de resíduo
  5. Cadastro de Endereço: salvar endereços para facilitar futuras solicitações
  6. Notícias Ambientais: notícias sobre meio ambiente e sustentabilidade

HORÁRIOS DE COLETA:
- Segunda: 07h-18h - Lixo Comum
- Terça: 07h-18h - Reciclável
- Quarta: 07h-18h - Lixo Comum
- Quinta: 07h-18h - Orgânico
- Sexta: 07h-18h - Lixo Comum
- Sábado: 08h-12h - Volumoso

TIPOS DE LIXO ACEITOS: Orgânico, Reciclável, Eletrônico, Poda, Entulho

SUPORTE: O usuário pode enviar mensagens de suporte e feedback na seção "Precisa de Ajuda?" no rodapé da página.

Se não souber algo específico do sistema, oriente o usuário a usar a seção de Suporte.
Nunca invente informações que não estão acima.
`.trim();

function normalizeAssistantHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(item => item && typeof item === 'object' && typeof item.role === 'string' && Array.isArray(item.parts))
    .slice(-10)
    .map(item => ({
      role: item.role,
      parts: item.parts
        .filter(part => part && typeof part.text === 'string' && part.text.trim().length > 0)
        .map(part => ({ text: part.text }))
    }))
    .filter(item => item.parts.length > 0);
}

async function generateAssistantReply(history) {
  if (!GEMINI_URL) {
    throw new Error('GEMINI_API_KEY não configurada no servidor.');
  }

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: ASSISTANT_SYSTEM_PROMPT }]
      },
      contents: normalizeAssistantHistory(history)
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data && data.error && data.error.message
      ? data.error.message
      : 'Erro ao consultar o Gemini';
    throw new Error(message);
  }

  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) {
    throw new Error('Resposta inesperada do Gemini.');
  }

  return reply;
}
// ==========================================
// ROTA GET: Listar as Empresas
// ==========================================
app.get('/api/empresas', async (req, res) => {
  try {
    const empresas = await empresaRepo.obterEmpresas();
    res.status(200).json(empresas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao buscar as empresas.' });
  }
});

// ==========================================
// ROTA POST: Cadastrar nova Empresa
// ==========================================
app.post('/api/empresas', async (req, res) => {
  try {
    // Pega os dados que você vai enviar pelo corpo da requisição no Postman
    const { nome, cnpj } = req.body;

    // Validação básica de segurança
    if (!nome || !cnpj) {
      return res.status(400).json({ mensagem: 'Nome e CNPJ são obrigatórios!' });
    }

    const novaEmpresa = await empresaRepo.salvarEmpresa(nome, cnpj);
    res.status(201).json(novaEmpresa); // 201 significa "Created" (Criado com sucesso)

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao salvar a empresa.' });
  }
});

// ==========================================
// ROTA DELETE: Excluir uma Empresa por ID
// ==========================================
app.delete('/api/empresas/:id', async (req, res) => {
  try {
    // Pega o ID diretamente da URL (exemplo: /api/empresas/3)
    const { id } = req.params;

    const excluido = await empresaRepo.excluirEmpresa(id);

    if (excluido) {
      // Status 200 OK com uma mensagem de confirmação
      return res.status(200).json({ mensagem: 'Empresa excluída com sucesso!' });
    } else {
      // Status 404 Not Found se o ID não existir no banco de dados
      return res.status(404).json({ mensagem: 'Empresa não encontrada.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao excluir a empresa.' });
  }
});

// ==========================================
// ROTA PUT: Atualizar (Update) uma Empresa
// ==========================================
app.put('/api/empresas/:id', async (req, res) => {
  try {
    const { id } = req.params; // Pega o ID da URL
    const { nome, cnpj } = req.body; // Pega os novos dados do JSON

    const empresaAtualizada = await empresaRepo.atualizarEmpresa(id, { nome, cnpj });

    if (empresaAtualizada) {
      return res.status(200).json(empresaAtualizada);
    } else {
      return res.status(404).json({ mensagem: 'Empresa não encontrada para atualização.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao atualizar a empresa.' });
  }
});

// ==========================================
// ROTA GET: Listar todos os Usuários
// ==========================================
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await usuarioRepo.obterUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao buscar os usuários.' });
  }
});

app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioRepo.buscarPorId(id);

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    res.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao buscar o usuário.' });
  }
});

// ==========================================
// ROTA POST: Cadastrar um novo Usuário
// ==========================================
app.post('/api/usuarios', async (req, res) => {
  try {
    const { nome, email, senha, data_nascimento, perfil, empresa_id } = req.body;

    // Validação básica dos campos obrigatórios
    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ mensagem: 'Nome, email, senha e perfil são obrigatórios!' });
    }

    // O repositório já salva e retorna o usuário sem a senha por segurança
    const novoUsuario = await usuarioRepo.salvarUsuario({
      nome,
      email,
      senha, // Em produção, aqui aplicaríamos um hash de senha (ex: bcrypt)
      data_nascimento,
      perfil,       // 'CIDADAO' ou 'ADMIN' de acordo com o ENUM do banco
      empresa_id: perfil === 'ADMIN' ? empresa_id : null // Só atrela empresa se for admin interno
    });

    res.status(201).json(novoUsuario);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao salvar o usuário.' });
  }
});

// ==========================================
// ROTA PUT: Atualizar (Update) um Usuário
// ==========================================
app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Captura os dados que podem ser atualizados
    const { nome, email, senha, data_nascimento, perfil, empresa_id } = req.body;

    const usuarioAtualizado = await usuarioRepo.atualizarUsuario(id, { 
      nome, 
      email, 
      senha, 
      data_nascimento, 
      perfil, 
      empresa_id 
    });

    if (usuarioAtualizado) {
      return res.status(200).json(usuarioAtualizado);
    } else {
      return res.status(404).json({ mensagem: 'Usuário não encontrado para atualização.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao atualizar o usuário.' });
  }
});

// ==========================================
// ROTA DELETE: Excluir um Usuário por ID
// ==========================================
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const excluido = await usuarioRepo.excluirUsuario(id);

    if (excluido) {
      return res.status(200).json({ mensagem: 'Usuário excluído com sucesso!' });
    } else {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao excluir o usuário.' });
  }
});


// ==========================================
// ROTA DE AUTENTICAÇÃO (LOGIN)
// ==========================================
const MASTER_USER = {
  email: 'master@garixos.com',
  senha: 'Master@123',
  usuario: {
    id: 0,
    nome: 'Usuário Master',
    email: 'master@garixos.com',
    perfil: 'MASTER'
  }
};

app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const { Usuario } = require('./models');

    if (email === MASTER_USER.email && senha === MASTER_USER.senha) {
      return res.status(200).json({
        mensagem: 'Login bem-sucedido',
        usuario: MASTER_USER.usuario
      });
    }

    // Procura o utilizador no banco de dados com o email e senha exatos
    const usuario = await Usuario.findOne({ 
      where: { email: email, senha: senha } 
    });

    if (usuario) {
      // Se encontrou, devolve os dados (sem a senha, por segurança)
      res.status(200).json({ 
        mensagem: 'Login bem-sucedido', 
        usuario: { 
          id: usuario.id, 
          nome: usuario.nome, 
          email: usuario.email, 
          perfil: usuario.perfil 
        } 
      });
    } else {
      res.status(401).json({ mensagem: 'Email ou senha inválidos' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ mensagem: 'Erro interno no servidor' });
  }
});
// ==========================================
// ROTA GET: Listar os Endereços de um Utilizador
// ==========================================
app.get('/api/enderecos/usuario/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const enderecos = await enderecoRepo.obterEnderecosPorUsuario(usuario_id);
    
    res.status(200).json(enderecos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao buscar os endereços.' });
  }
});

// ==========================================
// ROTA POST: Registar um novo Endereço
// ==========================================
app.post('/api/enderecos', async (req, res) => {
  try {
    const { usuario_id, cep, logradouro, bairro, numero, zona_id } = req.body;

    // Validação básica dos campos
    if (!usuario_id || !cep || !logradouro || !bairro || !numero) {
      return res.status(400).json({ mensagem: 'Faltam dados obrigatórios para registar o endereço!' });
    }

    const novoEndereco = await enderecoRepo.salvarEndereco({
      usuario_id,
      cep,
      logradouro,
      bairro,
      numero,
      zona_id
    });

    res.status(201).json(novoEndereco);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao guardar o endereço.' });
  }
});

// ==========================================
// ROTA GET: Listar todos os Endereços
// ==========================================
app.get('/api/enderecos', async (req, res) => {
  try {
    const enderecos = await enderecoRepo.obterTodosEnderecos();
    res.status(200).json(enderecos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao buscar os endereços.' });
  }
});

// ==========================================
// ROTAS DE SUPORTE / FEEDBACK / ALTERAÇÃO DE DADOS
// ==========================================
app.get('/api/suporte', async (req, res) => {
  try {
    const registros = await suporteRepo.listarSolicitacoes();
    res.status(200).json(registros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao buscar registros de suporte.' });
  }
});

app.post('/api/suporte', async (req, res) => {
  try {
    const { tipo, email, assunto, mensagem, tipo_feedback, usuario_id } = req.body;

    if (!tipo || !email || !assunto || !mensagem) {
      return res.status(400).json({ mensagem: 'Tipo, email, assunto e mensagem são obrigatórios.' });
    }

    const novoRegistro = await suporteRepo.criarSolicitacao({
      tipo,
      email,
      assunto,
      mensagem,
      tipo_feedback: tipo_feedback || null,
      status: 'aberto',
      usuario_id: usuario_id || null
    });

    res.status(201).json(novoRegistro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao salvar o registro de suporte.' });
  }
});

app.put('/api/suporte/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const atualizado = await suporteRepo.atualizarStatus(id, status || 'aberto');
    if (!atualizado) {
      return res.status(404).json({ mensagem: 'Registro de suporte não encontrado.' });
    }

    res.status(200).json(atualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao atualizar o registro de suporte.' });
  }
});

app.delete('/api/suporte/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const removido = await suporteRepo.excluirSolicitacao(id);

    if (!removido) {
      return res.status(404).json({ mensagem: 'Registro de suporte não encontrado.' });
    }

    res.status(200).json({ mensagem: 'Registro removido com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao remover o registro de suporte.' });
  }
});

// ==========================================
// ROTA PUT: Atualizar (Update) um Endereço
// ==========================================
app.put('/api/enderecos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cep, logradouro, bairro, numero, zona_id } = req.body;

    const enderecoAtualizado = await enderecoRepo.atualizarEndereco(id, {
      cep,
      logradouro,
      bairro,
      numero,
      zona_id
    });

    if (enderecoAtualizado) {
      return res.status(200).json(enderecoAtualizado);
    } else {
      return res.status(404).json({ mensagem: 'Endereço não encontrado para atualização.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao atualizar o endereço.' });
  }
});

// ==========================================
// ROTA DELETE: Excluir um Endereço
// ==========================================
app.delete('/api/enderecos/:id/:usuario_id', async (req, res) => {
  try {
    const { id, usuario_id } = req.params;
    
    // Passamos o usuario_id para garantir que a pessoa só apague o próprio endereço
    const excluido = await enderecoRepo.excluirEndereco(id, usuario_id);

    if (excluido) {
      return res.status(200).json({ mensagem: 'Endereço excluído com sucesso!' });
    } else {
      return res.status(404).json({ mensagem: 'Endereço não encontrado ou não pertence a este usuário.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao excluir o endereço.' });
  }
});

// ==========================================
// ROTAS PARA A ENTIDADE: ZONAS DE COLETA
// ==========================================

// 1. GET: Listar todas as Zonas de Coleta
app.get('/api/zonas', async (req, res) => {
  try {
    const zonas = await zonaColetaRepo.obterZonas();
    res.status(200).json(zonas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao buscar as zonas de coleta.' });
  }
});

// 2. POST: Cadastrar uma nova Zona de Coleta
app.post('/api/zonas', async (req, res) => {
  try {
    const { nome_zona, empresa_id } = req.body;

    if (!nome_zona || !empresa_id) {
      return res.status(400).json({ mensagem: 'O nome_zona e a empresa_id são obrigatórios!' });
    }

    const novaZona = await zonaColetaRepo.salvarZona({ nome_zona, empresa_id });
    res.status(201).json(novaZona);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao salvar a zona de coleta.' });
  }
});

// 3. PUT: Atualizar uma Zona de Coleta existente
app.put('/api/zonas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_zona, empresa_id } = req.body;

    const zonaAtualizada = await zonaColetaRepo.atualizarZona(id, { nome_zona, empresa_id });

    if (zonaAtualizada) {
      return res.status(200).json(zonaAtualizada);
    } else {
      return res.status(404).json({ mensagem: 'Zona não encontrada para atualização.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao atualizar a zona.' });
  }
});

// 4. DELETE: Remover uma Zona de Coleta
app.delete('/api/zonas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const excluido = await zonaColetaRepo.excluirZona(id);

    if (excluido) {
      return res.status(200).json({ mensagem: 'Zona de coleta excluída com sucesso!' });
    } else {
      return res.status(404).json({ mensagem: 'Zona de coleta não encontrada.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao excluir a zona de coleta.' });
  }
});

// ==========================================
// ROTAS PARA A ENTIDADE: VEÍCULOS
// ==========================================

// 1. GET: Listar todos os Veículos
app.get('/api/veiculos', async (req, res) => {
  try {
    const veiculos = await veiculoRepo.obterVeiculos();
    res.status(200).json(veiculos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao buscar os veículos.' });
  }
});

// 2. POST: Registar um novo Veículo
app.post('/api/veiculos', async (req, res) => {
  try {
    const { placa, modelo, empresa_id } = req.body;

    // Validação dos campos
    if (!placa || !modelo || !empresa_id) {
      return res.status(400).json({ mensagem: 'A placa, modelo e o ID da empresa são obrigatórios!' });
    }

    const novoVeiculo = await veiculoRepo.salvarVeiculo({ placa, modelo, empresa_id });
    res.status(201).json(novoVeiculo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao guardar o veículo.' });
  }
});

// 3. PUT: Atualizar os dados de um Veículo
app.put('/api/veiculos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { placa, modelo, empresa_id } = req.body;

    const veiculoAtualizado = await veiculoRepo.atualizarVeiculo(id, { placa, modelo, empresa_id });

    if (veiculoAtualizado) {
      return res.status(200).json(veiculoAtualizado);
    } else {
      return res.status(404).json({ mensagem: 'Veículo não encontrado para atualização.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao atualizar o veículo.' });
  }
});

// 4. DELETE: Remover um Veículo
app.delete('/api/veiculos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const excluido = await veiculoRepo.excluirVeiculo(id);

    if (excluido) {
      return res.status(200).json({ mensagem: 'Veículo excluído com sucesso!' });
    } else {
      return res.status(404).json({ mensagem: 'Veículo não encontrado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao excluir o veículo.' });
  }
});

// ==========================================
// ROTAS PARA A ENTIDADE: SOLICITAÇÕES
// ==========================================

// 1. GET: Listar todas as Solicitações
app.get('/api/solicitacoes', async (req, res) => {
  try {
    const solicitacoes = await solicitacaoRepo.obterSolicitacoes();
    res.status(200).json(solicitacoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao buscar as solicitações.' });
  }
});

// ==========================================
// ROTA DE SOLICITAÇÕES DE COLETA
// ==========================================
// ==========================================
// ROTA DE SOLICITAÇÕES DE COLETA
// ==========================================
app.post('/api/solicitacoes', async (req, res) => {
  try {
    const { usuario_id, endereco_id, tipo_lixo, status } = req.body; 
    const { SolicitacaoColeta } = require('./models');

    const novaSolicitacao = await SolicitacaoColeta.create({
      usuario_id: usuario_id,
      endereco_id: endereco_id, 
      tipo_lixo: tipo_lixo,
      status: status || 'PENDENTE'
    });

    res.status(201).json(novaSolicitacao);
  } catch (error) {
    console.error('Erro ao salvar solicitação:', error);
    res.status(500).json({ mensagem: 'Erro interno no servidor' });
  }
});
// 3. PUT: A Empresa atualiza o estado do pedido (ex: aloca um veículo)
app.put('/api/solicitacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, veiculo_id, tipo_lixo, data_solicitacao } = req.body;

    const solicitacaoAtualizada = await solicitacaoRepo.atualizarSolicitacao(id, { 
      status, 
      veiculo_id, 
      tipo_lixo,
      data_solicitacao
    });

    if (solicitacaoAtualizada) {
      return res.status(200).json(solicitacaoAtualizada);
    } else {
      return res.status(404).json({ mensagem: 'Solicitação não encontrada.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao atualizar a solicitação.' });
  }
});

// 4. DELETE: Remover/Cancelar uma solicitação
app.delete('/api/solicitacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const excluido = await solicitacaoRepo.excluirSolicitacao(id);

    if (excluido) {
      return res.status(200).json({ mensagem: 'Solicitação cancelada com sucesso!' });
    } else {
      return res.status(404).json({ mensagem: 'Solicitação não encontrada.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao cancelar a solicitação.' });
  }
});

// ==========================================
// ROTA DO ASSISTENTE VIRTUAL (GEMINI)
// ==========================================
// ==========================================
// ROTA DO ASSISTENTE VIRTUAL (SIMULADOR PARA APRESENTAÇÃO)
// ==========================================
// ==========================================
// ROTA DO ASSISTENTE VIRTUAL (SIMULADOR PARA APRESENTAÇÃO)
// ==========================================


// ==========================================
// ROTA DO ASSISTENTE VIRTUAL (SIMULADOR PARA APRESENTAÇÃO)
// ==========================================
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { history = [] } = req.body;
    const lastMessage = history[history.length - 1].parts[0].text.toLowerCase();

    // Resposta padrão
    let reply = "Em breve vai estar finalizado!"; 

    // Perguntas padrões da assistente
    if (lastMessage.includes("solicitar") || lastMessage.includes("coleta?")) {
        reply = "Para solicitar uma coleta, clique no card 'Solicitar Coleta' na tela inicial, selecione o endereço desejado, o tipo de resíduo e confirme. Você poderá acompanhar o status pelo seu histórico!";
    } else if (lastMessage.includes("Tipos de lixo aceitos") || lastMessage.includes("lixo") || lastMessage.includes("aceitos")) {
        reply = "Aceitamos os seguintes tipos de resíduos: Orgânico, Reciclável, Eletrônico, Poda e Entulho. Cada um deles é encaminhado para o tratamento correto!";
    
    // Perguntas anteriores de segurança e resíduos perigosos
    } else if (lastMessage.includes("vidro")) {
        reply = "Vidros quebrados devem ser embalados em caixas ou garrafas PET para segurança dos coletores. Por favor, identifique a embalagem como 'Vidro'.";
    } else if (lastMessage.includes("horário")) {
        reply = "Nossos horários são de segunda a sexta, das 07h às 18h, e aos sábados das 08h às 12h. Consulte a aba 'Horários' no menu para detalhes!";
    } else if (lastMessage.includes("pilhas") || lastMessage.includes("bateria")) {
        reply = "Pilhas e baterias contêm metais pesados tóxicos. Entregue-as em pontos de logística reversa (supermercados ou farmácias). Nunca descarte no lixo comum!";
    } else if (lastMessage.includes("óleo")) {
        reply = "O óleo de cozinha nunca deve ser despejado na pia. Armazene-o frio em uma garrafa PET e entregue em pontos de coleta.";
    } else if (lastMessage.includes("saúde") || lastMessage.includes("médico") || lastMessage.includes("agulha")) {
        reply = "Materiais de saúde (seringas, agulhas) são resíduos especiais. Coloque agulhas em recipientes rígidos e descarte-as em postos de saúde.";
    }

    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro no assistente.' });
  }
});

// ==========================================
// INICIANDO O SERVIDOR
// ==========================================
const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor do Garixos rodando na porta ${PORTA}`);
  console.log(`👉 Teste GET: http://localhost:${PORTA}/api/empresas`);
});