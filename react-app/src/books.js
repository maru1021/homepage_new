const fetchBooks = (searchVal, startIndex = 0, options = {}) => {
  const apiKey = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
  return fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchVal}&startIndex=${startIndex}&maxResults=20&key=${apiKey}`, options)
    .then(response => response.json())
    .then(data =>
      data.items ? data.items.map(book => {
        const { volumeInfo, accessInfo } = book;
        const { industryIdentifiers, title, infoLink } = volumeInfo;
        const { pdf, webReaderLink } = accessInfo;

        return {
          isbn: industryIdentifiers && industryIdentifiers[0] ? industryIdentifiers[0].identifier : 'N/A',
          title,
          download: pdf.isAvailable,
          infoLink,
          downloadLink: webReaderLink,
        };
      }) : []
    );
};

export default fetchBooks;