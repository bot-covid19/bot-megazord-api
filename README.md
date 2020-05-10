# Bot COVID-19 Messaging API

## Setup
É necessário que tenha `docker-compose` instalado.
> Instruções de como instala-lo [aqui](https://docs.docker.com/compose/install/)

### 1) Adicionar credenciais da conta do Twilio no ambiente
Você precisa de acesso ao dashboard do Twilio.

Vá até o `Programable SMS > Dashboard` e clique em `Show API Credentials`. Copie/Anote os valores do SID e do Token.

Abra o arquivo `env.example`, que se encontra na raiz do projeto, cole os valores correspondentes e renomeie o arquivo para `.env`.

### 2) Configurar WebHook do Twilio para seu ambiente local via ngrok

Exponha sua porta 3000 em uma URL pública usando `ngrok`
```
npx ngrok --http 3000
```

Copie/Anote a URL pública (geralmente no formato `http://[hash].ngrok.io`) presente em `Forwarding: http://[hash].ngrok.io -> http://localhost:3000`.

Vá ao Dashboard do Twilio, em `Programable SMS > Whatsapp > Sandbox` e, no campono campo `When a message comes in`, com a opção de `HTTP POST` selecionada, cole a URL anotada com no seguinte formato:
```
http://[hash].ngrok.io/api/v1/incoming
```

### (Opcional) Seed no banco
Agora só falta alimentar o banco com informação base, contida na pasta `seed/`.
Para isto, rode o comando abaixo:
```
make seed
```

### 3) Rode o projeto
Agora é só e rode o projeto.

```
make up
```
