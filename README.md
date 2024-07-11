# OpenAPI / Swagger to aspida

> [!CAUTION]
>
> LUCO社内利用のためにOAS 3.1.0に仮対応したものです。
>
> LUCO社内での利用は問題ありませんが、社外の利用に関して一切の責任を負いません。
>
> また、このフォークはupstreamへのPRを基本的に作成しません（OAS 3.0.x利用者への破壊的な変更が含まれるためです）
>
> また一切の自動テストを行っていませんので、利用に際しては自己責任でお願いします。
>
> This is a temporary support version of OAS 3.1.0 for LUCO internal use.
>
> Internal use within LUCO is not a problem, but we do not take any responsibility for external use.
>
> Also, this fork does not basically create a PR to upstream (as it contains destructive changes to the 3.0.x environment)
>
> Please note that no automatic testing has been carried out and that you use the system at your own risk.
>
> THIS IS UNOFFICIAL FORK

<br />
<img src="https://aspida.github.io/aspida/logos/png/logo.png" alt="aspida" title="aspida" />
<div align="center">
  <a href="https://www.npmjs.com/package/openapi2aspida">
    <img src="https://img.shields.io/npm/v/openapi2aspida" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/openapi2aspida">
    <img src="https://img.shields.io/npm/dm/openapi2aspida" alt="npm download" />
  </a>
</div>
<br />
<p align="center">Convert OpenAPI 3.0 and Swagger 2.0 definitions into <a href="https://github.com/aspida/aspida/tree/master/packages/aspida">aspida</a>.</p>
<br />
<br />

## Breaking change :warning:

### 2022/03/07

Since openapi2aspida >= `0.18.0` , decision whether to be required follows the OpenAPI spec correctly. Dropping the support for original implementation, that was defaulting to required.

### 2021/03/15

Since openapi2aspida >= `0.16.0` , requires TypeSciprt 3.8 or higher for Type-Only Imports.

### 2020/11/26

Since openapi2aspida >= `0.14.0` , request headers are forced to be optional.

### 2020/11/14

Since openapi2aspida >= `0.13.0` , optional for aspida only if the 'required' property of OpenAPI is set to `false`.

## Getting Started

Compatible with yaml/json of OpenAPI3.0/Swagger2.0

```sh
$ mkdir petstore-api
$ cd petstore-api
$ npx openapi2aspida -i https://petstore.swagger.io/v2/swagger.json # or ../local-swagger.yaml
# api/$api.ts was built successfully.

$ npm init -y
$ npm install @aspida/axios axios typescript ts-node @types/node
```

`index.ts`

```ts
import axiosClient from "@aspida/axios"
import api from "./api/$api"
import type { Pet } from "./api/@types"
;(async () => {
  const client = api(axiosClient())
  const petId = 100
  const body: Pet = {
    id: petId,
    name: "hoge",
    photoUrls: [],
    status: "available"
  }

  await client.pet.$post({ body })
  const pet = await client.pet._petId(petId).$get()
  console.log(pet)
})()
```

`package.json`

```json
{
  "scripts": {
    "start": "ts-node index.ts"
  }
}
```

```sh
$ npm start
# { id: 100, name: 'hoge', photoUrls: [], tags: [], status: 'available' }
```

## Build from config file

Create config file in project root

`aspida.config.js`

```js
module.exports = {
  input: "api", // "input" of aspida is "output" for openapi2aspida
  outputEachDir: true, // Generate $api.ts in each endpoint directory
  openapi: { inputFile: "https://petstore.swagger.io/v2/swagger.json" }
}
```

```sh
$ npx openapi2aspida
```

## Cli options

### `-i`, `--input`

path to an OpenAPI spec file for input

### `-o`, `--outputdir`

can change aspida output directory

### `-c`, `--config`

path to an aspida config file

### `--version`

displays version of openapi2aspida

### example

```bash
npx openapi2aspida -i=openApi/sample.yaml -o=lib/api/sample
```

## License

openapi2aspida is licensed under a [MIT License](https://github.com/aspida/openapi2aspida/blob/master/LICENSE).
