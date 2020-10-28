### Serverless newsletter service

It works, but to make it production-ready you'll probably want to add `SNS` topic so the emails are not lost and tinker with an email sending function to hide the recipients.

### Local setup:

1. install Node.js through [nvm](https://github.com/nvm-sh/nvm)
2. install [serverless ci](https://www.serverless.com/)

### AWS setup:

1. fill out the `.env` with your domain and email address
2. verify your domain

   - if it comes from route53 just run this:

   ```
   npm run ts-node -- ./scripts/verifyEmailDomain
   ```

   - if it comes from the other provider you must do it manually

3. (optional) Contact AWS support to leave the SES sandbox
   By default you can only send emails to verified email addresses

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
