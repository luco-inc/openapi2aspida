// for $ npm run dev:openapi
require('fs')
  .readdirSync(__dirname)
  .filter(
    n =>
      require('fs').statSync(`${__dirname}/${n}`).isDirectory() && n !== 'docs.baikalplatform.com',
  )
  .forEach(n =>
    require('fs').rmSync(`${__dirname}/${n}`, { recursive: true }, err => {
      if (err) console.log(err);
    }),
  );
