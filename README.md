<h1 align="center">
  <br>
  <br>

  ![screenshot](https://raw.githubusercontent.com/Leandro-Amorim/dream-canvas/main/images/image1.jpg)

  Dream Canvas
  <br>
</h1>

<h4 align="center">A social network for generating and sharing AI images, made with <a href="https://nextjs.org/" target="_blank">Next.js</a>. You can see a working example at <a href="https://dream-canvas-dev.vercel.app/" target="_blank">dream-canvas-dev.vercel.app</a>.</h4>

> **Note**
> Unfortunately, I can't guarantee that the image generation in this demo will work, as the API costs come out of my own funds.

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#prerequisites">Prerequisites</a> •
  <a href="#setup">Setup</a> •
  <a href="#potential-improvements">Known Issues / Potential improvements</a> •
  <a href="#credits">Credits</a> •
  <a href="#donate">Donate</a> •
  <a href="#license">License</a>
</p>

![screenshot](https://raw.githubusercontent.com/Leandro-Amorim/dream-canvas/main/images/image2.jpg)

![screenshot](https://raw.githubusercontent.com/Leandro-Amorim/dream-canvas/main/images/image3.jpg)

![screenshot](https://raw.githubusercontent.com/Leandro-Amorim/dream-canvas/main/images/image4.jpg)

## Key Features

* User authentication using NextAuth/Auth.js
* Premium users and Stripe integration
* Generation limits for free and anonymous users that are reset daily
* Create, comment, like and share posts
* Follow, block and report users
* Multiple Stable Diffusion checkpoints and LoRas
* Free and priority queues
* Real-time generation status updates via websockets
* Real-time notifications via websockets

## Architecture

The repository is a monorepo consisting of 2 separate projects:

* [**Frontend**](https://github.com/Leandro-Amorim/dream-canvas/tree/main/frontend): A Next.js project that acts as the project's frontend and also comprises most of the backend logic via API Routes.

* [**Server**](https://github.com/Leandro-Amorim/dream-canvas/tree/main/server): A Node.js backend project designed to handle processes that wouldn't be possible in Next.JS due to its serverless architecture. It currently runs the Websockets server responsible for sending notifications and generation status updates, as well as processing the generation queue and running scheduled jobs.

There are also other services that are part of the project and are not contained in this repository:

* A serverless Stable Diffusion API running on [RunPod](https://www.runpod.io/).

* A postgreSQL database.



## Prerequisites

To get started, you'll need the following resources already setup:

* A postgreSQL database
* An SMTP server for sending authentication emails
* A Stripe account for payment support
* An S3-compatible bucket with public access

## Setup

### Stable Diffusion API

To set up a Stable Diffusion API in Runpod, I used the amazing work of Ashley Kleynhans in his 
[Automatic1111 worker template](https://github.com/ashleykleynhans/runpod-worker-a1111). Make sure you've followed all the steps in his guide and in the end you'll have a working Stable Diffusion API.

You should also make sure that the checkpoints and LoRas downloaded to the Network Volume match the models in the project (which can be seen in [models.ts](https://github.com/Leandro-Amorim/dream-canvas/blob/main/frontend/src/data/models.ts), [modifiers.ts](https://github.com/Leandro-Amorim/dream-canvas/blob/main/frontend/src/data/modifiers.ts) and [models.ts](https://github.com/Leandro-Amorim/dream-canvas/blob/main/server/src/data/models.ts)). The table below contains all the models used in the project, as well as their filenames and the link to find them.

| **SDXL Model**                    | **Type**   | **Path/Filename**                                             | **Url**                                                                                                       |
|-----------------------------------|------------|---------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| Juggernaut XL                     | Checkpoint | /models/Stable-diffusion/juggernautXL_juggernautX.safetensors | https://civitai.com/models/133005?modelVersionId=456194                                                       |
| anima_pencil-XL                   | Checkpoint | /models/Stable-diffusion/animaPencilXL_v310.safetensors       | https://civitai.com/models/261336?modelVersionId=465206                                                       |
| epiCRealism XL                    | Checkpoint | /models/Stable-diffusion/epicrealismXL_v6Miracle.safetensors  | https://civitai.com/models/277058?modelVersionId=461409                                                       |
| Disney Princess XL                | LoRa       | /models/Lora/princess_xl_v2.safetensors                       | https://civitai.com/models/212532?modelVersionId=244808                                                       |
| Sinfully Stylish                  | LoRa       | /models/Lora/sinfully_stylish_SDXL.safetensors                | https://civitai.com/models/340248?modelVersionId=407532                                                       |
| Cucoloris Casting Shadow          | LoRa       | /models/Lora/casting shadow style v2.safetensors              | https://civitai.com/models/391036?modelVersionId=445042                                                       |
| Painted World                     | LoRa       | /models/Lora/Painted World-000006.safetensors                 | https://civitai.com/models/242763?modelVersionId=273924                                                       |
| ParchartXL                        | LoRa       | /models/Lora/ParchartXL_CODA.safetensors                      | https://civitai.com/models/141471?modelVersionId=440425                                                       |
| Neon Cyberpunk Impressionism SDXL | LoRa       | /models/Lora/Neon_Cyberpunk_Impressionism_SDXL.safetensors    | https://civitai.com/models/361379?modelVersionId=403845                                                       |
| SDXL VAE                          | VAE        | /models/VAE/sdxl_vae.safetensors                              | https://huggingface.co/madebyollin/sdxl-vae-fp16-fix/resolve/main/sdxl_vae.safetensors                        |
| SDXL Refiner                      | Refiner    | /models/Stable-diffusion/sd_xl_refiner_1.0.safetensors        | https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0/resolve/main/sd_xl_refiner_1.0.safetensors |
| ESRGAN 4x                         | Upscaler   | /models/ESRGAN/4x-UltraSharp.pth                              | https://huggingface.co/ashleykleynhans/upscalers/resolve/main/4x-UltraSharp.pth                               |


<br/>

### Next.js Frontend

The first step is to configure the environment variables correctly. Below is a table with the names of the variables and their respective descriptions.

| **Variable**                            | **Description**                                                                                                         |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| NEXT_PUBLIC_URL                         | The url where the Next.js project will be hosted.                                                                       |
| DATABASE_URL                            | The url of the project's postgreSQL database.                                                                           |
| SMTP_HOST                               | The url of the SMTP server.                                                                                             |
| SMTP_PORT                               | The port of the SMTP server.                                                                                            |
| SMTP_USER                               | The username of the SMTP server.                                                                                        |
| SMTP_PASSWORD                           | The password of the SMTP server.                                                                                        |
| EMAIL_FROM                              | The address that people will see in the from field when they receive the email.                                         |
| NEXT_PUBLIC_DAILY_FREE_IP_GENERATIONS   | How many generations anonymous users have per day. Defaults to 5.                                                       |
| NEXT_PUBLIC_DAILY_FREE_USER_GENERATIONS | How many generations free users have per day. Defaults to 25.                                                           |
| NEXT_PUBLIC_DAILY_PREMIUM_CREDITS       | How many premium credits free users will earn per day. Defaults to 50.                                                  |
| SYSTEM_DAILY_FREE_GENERATIONS           | How many free generations the server can do before it runs out of resources. Defaults to 200.                           |
| SYSTEM_FREE_QUEUE_MAX_SIZE              | The maximum number of generations that can be in the free queue at the same time.                                       |
| STRIPE_PUBLISHABLE_KEY                  | Stripe public key.                                                                                                      |
| STRIPE_SECRET_KEY                       | Stripe secret key.                                                                                                      |
| STRIPE_PRODUCT_WH_SECRET                | The key that will be used to validate the product price change webhook.                                                 |
| STRIPE_SUBSCRIPTION_WH_SECRET           | The key that will be used to validate the subscription webhook.                                                         |
| GOOGLE_CLIENT_ID                        | The credentials for Google's OAuth provider. You can leave this blank, but the OAuth login buttons will no longer work. |
| GOOGLE_CLIENT_SECRET                    | Same as above.                                                                                                          |
| GITHUB_CLIENT_ID                        | The credentials for Github's OAuth provider. You can leave this blank, but the OAuth login buttons will no longer work. |
| GITHUB_CLIENT_SECRET                    | Same as above.                                                                                                          |
| JWT_SECRET                              | The secret that will be used to sign and verify the JWT authentication of websockets.                                   |
| NEXTAUTH_SECRET                         | NextAuth's secret key. Required in production.                                                                          |
| NEXT_PUBLIC_WEBSOCKETS_SERVER           | The url for the Node.js backend service.                                                                                |
| AWS_REG                                 | The S3-compatible bucket region.                                                                                        |
| AWS_KEY                                 | The S3-compatible bucket access key.                                                                                    |
| AWS_SECRET                              | The S3-compatible bucket secret access key.                                                                             |
| AWS_BUCKET                              | The name of the S3-compatible bucket.                                                                                   |


<br/><br/>
The next step is to run the migrations to configure the postgreSQL database schemas.

```bash
# Install dependencies
$ npm install

# Generate migration files
$ npm run migration

# Push migration to db
$ npm run dbpush
```

You can then start the application in developer mode.

```bash
# Start in developer mode
$ npm run dev
```

<br/>

### Backend service

The first step is to configure the environment variables correctly. Below is a table with the names of the variables and their respective descriptions.

| **Variable**                  | **Description**                                                                                                         |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| JWT_SECRET                    | The secret that will be used to sign and verify the JWT authentication of websockets.                                   |
| PUBLIC_URL                    | The url where the Next.js project is hosted.         |
| DATABASE_URL                  | The url of the project's postgreSQL database.                                                                           |
| API_URL                       | The url for RunPod's serverless function. It should have the following format: ``https://api.runpod.ai/v2/ENDPOINT_ID/run`` |
| API_KEY                       | RunPod API access key.                                                                                                  |
| AWS_REG                       | The S3-compatible bucket region.                                                                                        |
| AWS_KEY                       | The S3-compatible bucket access key.                                                                                    |
| AWS_SECRET                    | The S3-compatible bucket secret access key.                                                                             |
| AWS_BUCKET                    | The name of the S3-compatible bucket.                                                                                   |
| DAILY_FREE_IP_GENERATIONS     | How many generations anonymous users have per day. Defaults to 5.                                                       |
| DAILY_FREE_USER_GENERATIONS   | How many generations free users have per day. Defaults to 25.                                                           |
| DAILY_PREMIUM_CREDITS         | How many premium credits free users will earn per day. Defaults to 50.                                                  |
| SYSTEM_DAILY_FREE_GENERATIONS | How many free generations the server can do before it runs out of resources. Defaults to 200.                           |


<br/> 
You can then install the dependencies and start the project in developer mode.

<br/> 

```bash
# Install dependencies
$ npm install

# Start in developer mode
$ npm run dev
```
<br/>

### Stripe Webhooks

2 webhooks will be required:

* The first is responsible for handling price changes and will listen to the following events: ``product.created``, ``product.deleted``, ``product.updated``, ``price.created``, ``price.deleted``, ``price.updated``. The endpoint url will be ``https://FRONTEND_URL/api/webhooks/product-change``. Only the first product created will be considered a subscription to the service.

* The second will be responsible for handling customer subscriptions and will listen to the following events: ``customer.deleted``, ``customer.created``, ``checkout.session.completed``, ``customer.subscription.created``, ``customer.subscription.deleted``, ``customer.subscription.updated``. The endpoint url will be ``https://FRONTEND_URL/api/webhooks/subscription``.

In addition, it is necessary to limit each customer to just one subscription in ``Settings > Payments > Subscriptions``.

## Potential Improvements

There are some points in the project that, if I were to rewrite it from scratch, I would do differently. Others are problems that I don't like but are beyond my control. They are:

* **Models defined in the code**: The initial plan was to define the models available in the database and request them when they were needed. The solution of defining the models in a javascript object was only temporary, but I ended up referencing this object locally in many places in the code, so it would have been too much work to replace all the occurrences and rework the logic. Oops, sorry about that.

* **Stable Diffusion API too slow**: Unfortunately, cold starts are always going to be part of projects like this. There are some solutions on the Internet for optimizing RunPod cold starts. However, most of them involve higher financial costs (such as setting a worker as always active), which is not justified in a non-commercial project like this.




## Credits

This project would not have been possible without the following open source projects and software: 

* [Next.js](https://nextjs.org/)
* [Tailwind](https://tailwindcss.com/)
* [shadcn/ui](https://ui.shadcn.com/)
* [Node.js](https://nodejs.org/)
* [Drizzle ORM](https://orm.drizzle.team/)
* [TanStack Query](https://tanstack.com/query/)
* [Framer Motion](https://www.framer.com/motion/)
* [Socket.IO](https://socket.io/)
* [Tabler Icons](https://tabler.io/icons)
* [RunPod Serverless Worker for SD API](https://github.com/ashleykleynhans/runpod-worker-a1111) by Ashley Kleynhans
* [Ribbons Animation](https://codepen.io/bsehovac/pen/LQVzxJ) by Boris Šehovac

## Donate

If you think this project has helped you in any way or you've learned something new, consider buying me a coffee, I love it!

<a href="https://www.buymeacoffee.com/leandro.n.amorim" target="_blank"><img src="https://raw.githubusercontent.com/Leandro-Amorim/supafy/main/setup/img/coffee.png" alt="Buy Me A Coffee"></a>

## License

Distributed under the MIT License. See ` `LICENSE.txt` ` for more information.
