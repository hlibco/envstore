<div align="center">
  <img src="logo.png" width="240" height="240">
  <br>
  <br>
</div>

[![CircleCI](https://circleci.com/gh/hlibco/envstore/tree/master.svg?style=shield)](https://circleci.com/gh/hlibco/envstore/tree/master) [![codecov](https://codecov.io/gh/hlibco/envstore/branch/master/graph/badge.svg)](https://codecov.io/gh/hlibco/envstore) [![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Your application requires **Environment Variables**. You must know if they have been setup properly before the application starts.

> **Envstore** was made to help engineers like yourself to identify as soon as possible that the application is about to operate in an misconfigured environment. This saves countless debugging hours.

- Zero dependencies
- 100% test coverage
- Typescript

## Problem (use case)

You application sends email when your users signup and you forgot to setup the *API_KEY* of your email service provider.
You'll find out about this problem after having some new users sadly not getting signup emails.


## Solution

Check all environment variables required by your application before it starts running.


## API

```js
import Envstore from 'envstore'

const env = new Envstore(process.env)

// -- The basics --

env.array('ENV_VAR_NAME') // 'a,b,c' => ['a', 'b', 'c']

env.boolean('ENV_VAR_NAME') // 'true' or '1' => true | 'false' or '0' => false

env.float('ENV_VAR_NAME') // '2.5' => 2.5

env.integer('ENV_VAR_NAME') // '10' => 10

env.json('ENV_VAR_NAME') // '{"x":5}' => {x: 5}

env.string('ENV_VAR_NAME') // 'text' => 'text'

// All basic methods support a second argument as default value, for example:

env.string('USER', 'root') // If there is no `USER` in the environment variables, `root` is assigned


// -- Set variables per environment --

env.pick('ENV_VAR_NAME', {
  development: prop => env.string(prop)
}, prop => env.string(prop))


// -- ADVANCED: Dynamically configure your environment variables --

env.setup({
  production: (env) => {
    // Load your secrets from a configuration repository
    const secrets = ...

    // Merge secrets into Envstore
    env.merge(secrets)
  }
})
```


## Use

### Basic

```js
// config.js
import Envstore from 'envstore'

const env = new Envstore(process.env, process.env.NODE_ENV || 'development')

const config = {
  PORT: env.integer('PORT'),
  AUTH: env.boolean('AUTH', true) // default = true
}

export default config
```

In the `config.js` above we're specifying the following:

Variable | Cast    | Comments
--       | --      | --
**PORT** | integer | required (no default value)
**AUTH** | boolean | not required (default = true), accept only '1', 'true', '0', 'false'

**Note**: Environment variables in NodeJS are `string` or `undefined`. However, **Envstore** takes a step further and let you cast those variables for later use.

Import your config file in your application the way you like:

```js
import config from './config'
console.log(config.PORT) // => number
console.log(config.AUTH) // => boolean
```

## Multiple Environments

Now you want to run your application in `development` and `test` mode in your local machine. Let's setup those environments:

```js
const config = {
  URI: env.pick('URI', {
    development: () => 'http://localhost:3000',
    test: () => 'http://localhost:4000'
  }, prop => env.string(prop))
}
```

When you run you application in test mode `NODE_ENV=test`, you will see this result:

```js
// app.js
import config from './config'
console.log(config.HOST) // => http://localhost:4000
```

### Default Values

In the example below, all environments will use `URI = 'http://localhost:3000'` except the **production** environment that will use `URI = 'https://mysite.com'`.

```js
const config = {
  URI: env.pick('URI', {
    production: () => 'https://mysite.com'
  }, () => 'http://localhost:3000')
}
```

### Custom Defaults

You work on a tem of developers and want to specify your own defaults without breaking others workflow. Overwrite the default value by the **URI** in your local environment.

```js
const config = {
  URI: env.pick({
    production: () => 'https://mysite.com'
  }, () => env.string('URI', 'http://localhost:3000')
}
```

## Advanced

Do you use IoC (Inversion of Control) and Dependency Injection? This section is for you.

Let's assume you are a professional engineer that cares about your **database credentials** and is aware that hosting them in the Environment Variable is not the safest option. Credentials repository and dynamic configuration to the rescue.

If you are interested in this topic, check out [AWS Secrets Manager](https://aws.amazon.com/secrets-manager).

A more robust implementation of your config file is presented below:

```js
  // config.js
  import Envstore from 'envstore'

  export default class Config {
    env

    readonly database = {
      username: undefined,
      password: undefined,
    }

    async setup() {
      this.env = new Envstore(process.env, process.env.NODE_ENV || 'development')

      await this.env.setup({
        production: async () => {
          // Load your secrets from a configuration repository
          const secrets = ...

          // Merge secrets into Envstore
          env.merge(secrets)
        }
      })
    }
  }
```
