### Serverless newsletter service

It works, but to make it production-ready you'll probably want to add `SNS` topic so the emails are not lost, tinker with an email sending function to hide the recipients, and obviously change the domain/email (`/src/index.ts`) and region (`/serverless.ts`)

### Setup:

1. install Node.js through [nvm](https://github.com/nvm-sh/nvm)
2. install [serverless ci](https://www.serverless.com/)

Deploy

```
sls deploy
```

Remove deployed resources

```
sls remove
```

Register email recipients

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"email":"kek@example.com"}' \
  <register endpoint>
```

Send an email message to registered email addresses

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"msg":"some msg"}' \
  <register endpoint>
```

You'll get the endpoints after running `sls deploy`
