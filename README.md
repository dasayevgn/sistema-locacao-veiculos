# Sistema de Locação de Veículos

Aplicação full stack para uma locadora: cadastro e login de usuários, cadastro e consulta de veículos, registro e devolução de locações.

Disciplina: Programação com Frameworks Web.

## Integrantes

1. Dasayev Gomes Nunes - 43762751
2. Júlio Thomas Araújo Gonçalves - 44511795
3. Moisés  fênix melo do nascimento - 42711266

## Tecnologias

- Backend: Node.js, Express, JavaScript, Prisma ORM, MySQL, JWT, bcrypt
- Frontend: React (Vite), fetch

## Funcionalidades

- Cadastro e login de usuários, com senha em hash (bcrypt) e token JWT
- Cadastro de veículos com placa única e diária positiva
- Listagem de veículos com filtro de disponibilidade
- Registro de locação com cálculo do valor no backend (fração de 24 h conta como diária completa)
- Listagem do histórico de locações do usuário autenticado
- Finalização de locação, que libera o veículo novamente

## Requisitos

- Node.js 18 ou superior
- MySQL 8 em execução

## Instalação e execução

### Banco de dados

Crie o banco vazio:

```
CREATE DATABASE locadora CHARACTER SET utf8mb4;
```

### Backend

```
cd backend
npm install
cp .env.example .env
```

Edite o `.env`: informe `DATABASE_URL` com usuário e senha do seu MySQL e defina um `JWT_SECRET` longo e aleatório.

```
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run dev
```

A API sobe em `http://localhost:3333`. O seed cria o usuário `demo@locadora.com` (senha `123456`) e quatro veículos.

### Frontend

```
cd frontend
npm install
cp .env.example .env
npm run dev
```

A interface abre em `http://localhost:5173`.

## Endpoints

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| POST | /auth/register | não | Cadastra usuário |
| POST | /auth/login | não | Retorna o JWT e os dados públicos do usuário |
| GET | /auth/me | sim | Usuário autenticado |
| POST | /veiculos | sim | Cadastra veículo |
| GET | /veiculos | sim | Lista veículos; `?disponivel=true` filtra os disponíveis |
| POST | /locacoes | sim | Registra locação |
| GET | /locacoes | sim | Lista as locações do usuário autenticado |
| GET | /locacoes/:id | sim | Consulta uma locação própria |
| PATCH | /locacoes/:id/finalizar | sim | Finaliza uma locação própria |

Rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>`.

## Decisões de projeto

- Routes mapeiam endpoints, Controllers tratam a entrada e a resposta HTTP, Services concentram validações e regras de negócio, e o acesso ao banco é feito pelo Prisma.
- O usuário de cada operação vem do token validado pelo middleware, nunca do corpo da requisição.
- Para evitar duas locações ativas do mesmo veículo, o registro roda em `prisma.$transaction` e reserva o veículo com um `updateMany` condicional (`disponivel: true`). Se duas requisições chegam juntas, só uma altera a linha; a outra recebe 409.
- A finalização usa o mesmo padrão com `status: 'ATIVA'`, então finalizar duas vezes retorna 409.
- Locações e veículos não são excluídos, para preservar o histórico.
- Erros usam 400 (validação), 401 (autenticação), 403 (locação de outro usuário), 404 (inexistente) e 409 (conflito).
