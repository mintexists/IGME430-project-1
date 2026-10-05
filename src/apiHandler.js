const fs = require('fs');

let books = JSON.parse(fs.readFileSync(`${__dirname}/../data/books.json`));

const respondJSON = (request, response, object, statusCode = 200) => {
  const content = JSON.stringify(object);
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf-8')
  })

  if (request.method !== 'HEAD' && statusCode != 204) {
    response.write(content)
  }

  response.end()
}

const addBook = (request, response) => {
  const title = request.body.title || null;
  const author = request.body.author || null;
  const country = request.body.country || null;
  const language = request.body.language || null;
  const link = request.body.link || null;
  const pages = request.body.pages || null;
  const year = request.body.year || null;
  const genres = request.body.genres || null;

  if (title == null || author == null || country == null || language == null || link == null || pages == null || year == null || genres == null) {
    const responseJSON = {
      id: "missingParams",
      message: "title, author, country, language, link, pages, year, and genres are all required for the addBook method"
    };

    return respondJSON(request, response, responseJSON, 400);
  }

  books.push({
    title,
    author,
    country,
    language,
    link,
    pages,
    year,
    genres
  })
  
  // if (userName in users) {
  //   users[userName].age = userAge;
  //   return respondJSON(request, response, {}, 204);
  // }

  const responseJSON = {
    id: 'addedBook',
    message: 'Added Successfully'
  };

  respondJSON(request, response, responseJSON, 201);
}

const editBook = (request, response) => {
  const title = request.body.title || null;
  const author = request.body.author || null;
  const country = request.body.country || null;
  const language = request.body.language || null;
  const link = request.body.link || null;
  const pages = request.body.pages || null;
  const year = request.body.year || null;
  const genres = request.body.genres || null;

  if (title == null) {
    const responseJSON = {
      id: "missingParams",
      message: "title is required for the editBook method"
    };

    return respondJSON(request, response, responseJSON, 400);
  }

  let didFindBook = false;
  books = books.map(book => {
    if (book.title == title) {
      didFindBook = true;
      if (author) book.author = author;
      if (country) book.country = country;
      if (language) book.language = language;
      if (link) book.link = link;
      if (pages) book.pages = pages;
      if (year) book.year = year;
      if (genres) book.genres = genres;
    }
  })

  if (!didFindBook) {
    const responseJSON = {
      id: "bookNotFound",
      message: "A book with this title could not be found"
    }

    return respondJSON(request, response, responseJSON, 404);
  }
  
  // if (userName in users) {
  //   users[userName].age = userAge;
  //   return respondJSON(request, response, {}, 204);
  // }

  respondJSON(request, response, {}, 204);
}



const getAuthors = (request, response) => {
  const responseJSON = {
    authors: [... new Set(books.map(book => book.author))].toSorted()
  }

  respondJSON(request, response, responseJSON);
}

const getTitles = (request, response) => {
  const responseJSON = {
    authors: [...new Set(books.map(book => book.title))].toSorted()
  }

  respondJSON(request, response, responseJSON);
}

const getBook = (request, response) => {
  if (!request.query.title) {
    const responseJSON = {
      id: "missingTitleParam",
      message: "Missing the title search parameter"
    }

    return respondJSON(request, response, responseJSON, 400);
  }

  const book = books.find(book => book.title == request.query.title);

  if (!book) {
    const responseJSON = {
      id: "bookNotFound",
      message: "A book with this title could not be found"
    }

    return respondJSON(request, response, responseJSON, 404);
  }

  respondJSON(request, response, book);
}

const getSearch = (request, response) => {
  const searchableKeys = new Set(["title", "author", "language", "country"])
  const searchedKeys = new Set(Object.keys(request.query))
  const intersection = searchableKeys.intersection(searchedKeys)

  if (intersection.size == 0) {
    const responseJSON = {
      id: "missingSearchParams",
      message: `Missing one or more of the following search params: ${[...searchableKeys.values()].join(', ')}`
    }

    return respondJSON(request, response, responseJSON, 400);
  }

  // unstrict search
  const results = books.filter(book => {
    let success = false;
    for (const key of [...intersection]) {
      if (book[key].toLowerCase().startsWith(request.query[key].toLowerCase())) {
        success = true;
      }
    }
    return success
  })

  // strict search
  // const results = books.filter(book => {
  //   let success = true;
  //   for (const key of [...intersection]) {
  //     if (!book[key].toLowerCase().startsWith(request.query[key].toLowerCase())) {
  //       success = false;
  //     }
  //   }
  //   return success
  // })

  if (results.length == 0) {
    const responseJSON = {
      id: "booksNotFound",
      message: `No books found with search parameters: ${[...intersection.values()].join(', ')}`
    }

    return respondJSON(request, response, responseJSON, 404);
  }

  respondJSON(request, response, results);
}

const respond404 = (request, response) => {
  const responseJSON = {
    id: 'notFound',
    message: 'The page you are looking for was not found',
  };

  respondJSON(request, response, responseJSON, 404);
}

module.exports = {
  getAuthors,
  getTitles,
  getBook,
  getSearch,
  addBook,
  editBook,
  respond404
}