const express = require('express');
const app = express();

// Middleware para o Express entender arquivos JSON recebidos no body (Postman)
app.use(express.json());

// Importando o NOSSO repositório do Garixos
const empresaRepo = require('./repositories/empresaRepository.js'); // Ajuste o caminho da pasta se você salvou em outro lugar
const usuarioRepo = require('./repositories/usuarioRepository.js'); // Ajuste o caminho se necessário
const enderecoRepo = require('./repositories/enderecoRepository.js'); // Ajuste o caminho se necessário
const zonaColetaRepo = require('./repositories/zonaColetaRepository.js');
const veiculoRepo = require('./repositories/veiculoRepository.js');
const solicitacaoRepo = require('./repositories/solicitacaoRepository.js');
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
// ROTA GET: Listar TODOS os Endereços (Geral)
// ==========================================
app.get('/api/enderecos', async (req, res) => {
  try {
    const enderecos = await enderecoRepo.obterTodosEnderecos();
    res.status(200).json(enderecos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao buscar endereços.' });
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

// 2. POST: O Cidadão abre um novo pedido de recolha
app.post('/api/solicitacoes', async (req, res) => {
  try {
    const { usuario_id, endereco_id, tipo_lixo, data_solicitacao } = req.body;

    if (!usuario_id || !endereco_id) {
      return res.status(400).json({ mensagem: 'O ID do utilizador e do endereço são obrigatórios!' });
    }

    const novaSolicitacao = await solicitacaoRepo.salvarSolicitacao({ 
      usuario_id, 
      endereco_id, 
      tipo_lixo,
      data_solicitacao
    });
    
    res.status(201).json(novaSolicitacao);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro interno ao criar a solicitação.' });
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
// INICIANDO O SERVIDOR
// ==========================================
const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor do Garixos rodando na porta ${PORTA}`);
  console.log(`👉 Teste GET: http://localhost:${PORTA}/api/empresas`);
});