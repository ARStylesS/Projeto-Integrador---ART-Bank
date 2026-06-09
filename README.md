# AR Bank

Esse projeto é um aplicativo mobile de transferências bancárias simuladas.
Nesse app, o usuário do banco fictício AR Bank pode fazer as seguintes operações em sua conta bancária:

---
 para alterar foto do perfil tem que usar pacote de imagens no expo na pasta do front ar-bank-app:
npx expo install expo-image-picker
npm install multer && npm install -D @types/multer precisa intalar esta biblioteca o ar-bank-api

Funcionalidades principais do projeto:
1. Consultar saldo
2. Fazer transferências para outra conta
3. Solicitar transferência vinda de outro usuário
4. Completar pagamento de solicitação de transferência

---

Funcionalidades secundárias do projeto:
1. Gerenciar conta de usuário, com edição de dados
2. Inclusão de foto de perfil
3. Consultar extrato bancário
4. Realizar empréstimo (inclui parcelamento e juros)
5. Sistema de cassino virtual com jogos simulados

---

Esse projeto será feito com React Native (incluindo HTML, CSS e JavaScript) para criar uma aplicação mobile funcional

Para rodar o servidor do back-end, abra um terminal e insira:

``` bash
cd ar-bank-api
npm install
npx prisma generate //insira somente se for a primeira vez clonando
npm run dev

```
Para rodar o front-end e expo, abra outro terminal e insira:

``` bash
cd ar-bank-app
npm install
npx expo start
```

Para consultar o banco de dados, abra um terceiro terminal e insira:

```bash
cd ar-bank-api
npx prisma studio
```
O último deve ser inserido toda vez para iniciar o servidor expo da aplicação.

Dashboard do Projeto feito no Figma:
https://www.figma.com/design/wI1IrLNZYZpZm3jlP7f3vE/ARBank---Transfer%C3%AAncias-Banc%C3%A1rias?node-id=0-1&t=fydsYEml5I9WPz6t-1

---
