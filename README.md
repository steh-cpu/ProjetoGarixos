# Garixos - Portal de Coleta de Resíduos

Este projeto é um site simples que mostra como funciona uma plataforma para coletar lixo e acompanhar serviços.

## O que tem no projeto

- `index.html`: página para fazer login com CPF e senha.
- `criarcadastro.html`: página para criar uma conta nova.
- `principal.html`: página principal com informações e opções.
- `css/`: arquivos que definem cores, fontes e layout.
- `js/`: código que faz o site funcionar.
- `assets/`: imagens usadas no site.

## Passo a passo para usar

1. Abra `index.html` no navegador.
2. Se ainda não tem conta, clique em "Criar conta".
3. Preencha os dados no formulário de cadastro.
4. Volte para a tela de login.
5. Digite o CPF e a senha que você usou.
6. Clique em "Entrar".

Se estiver certo, você será levado para a página principal.

> Importante: os dados são guardados no navegador apenas. Se você limpar o navegador, o cadastro pode sumir.

## O que o site faz

- Cria conta com CPF e senha.
- Faz login com CPF e senha.
- Verifica se o CPF existe no cadastro.
- Verifica se a senha está correta.
- Mostra uma página principal quando o usuário faz login.
- Mostra uma lista de regras de senha enquanto o usuário digita a senha.
- Usamos um mapa para mostrar localização como exemplo.

## Como os dados são guardados

- O site guarda as informações no `localStorage` do navegador.
- Não há servidor ou banco de dados real.
- O CPF, a senha e o nome ficam salvos no computador enquanto o navegador não for limpo.

## O que não funciona de verdade

- Login com Gmail e Facebook são apenas botões de exemplo.
- O envio de feedback não é auto completo.
- A parte de mapa e notificações é mais para demonstrar o visual.

## Separação de Equipe 

- po: thiago oliveira 
- scrum master: accioli 
- front-end: natã e stefany
- back-end: joão e diego
- banco de dados: caue e edu
