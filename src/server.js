const http = require('http');
const query = require('querystring');

// const htmlHandler = require('./htmlHandler.js')
const apiHandler = require('./apiHandler.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000

const urlStruct = {
  "/authors": apiHandler.getAuthors,
  "/titles": apiHandler.getTitles,
  "/book": apiHandler.getBook,
  "/search": apiHandler.getSearch,
  "/addBook": apiHandler.addBook,
  "/editBook": apiHandler.editBook,
  default: apiHandler.respond404
};

const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const type = request.headers['content-type'];
    if(type === 'application/x-www-form-urlencoded') {
      request.body = query.parse(bodyString);
    } else if (type === 'application/json') {
      request.body = JSON.parse(bodyString);
    } else {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify({ error: 'invalid data format' }));
      return response.end();
    }

    handler(request, response);
  });
}

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http'
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  if(request.headers.accept) {
    request.acceptedTypes = request.headers.accept.split(',');
  }

  request.query = Object.fromEntries(parsedUrl.searchParams);

  const handler = urlStruct[parsedUrl.pathname] || urlStruct.default

  if (request.method == 'POST') {
    parseBody(request, response, handler)
  } else {
    handler(request, response)
  }
}

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on http://127.0.0.1:${port}`);
})