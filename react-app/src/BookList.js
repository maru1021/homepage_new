import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';

const BookList = ({ src }) => {
  const [books, setBooks] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const resultsPerPage = 20;

  const handleSearch = useCallback(() => {
    setSearchQuery(searchVal.trim());
    setCurrentPage(0);
  }, [searchVal]);

  const fetchBooks = useCallback(() => {
    if (searchQuery === '') {
      setBooks([]);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    setIsLoading(true);

    src(searchQuery, currentPage * resultsPerPage, { signal })
      .then((data) => {
        if (!signal.aborted) {
          setBooks(data);
        }
      })
      .finally(() => {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('書籍の取得に失敗しました:', error);
        }
      });

    return () => controller.abort();
  }, [searchQuery, currentPage, src]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handlePageChange = useCallback((direction) => {
    setCurrentPage((prevPage) => prevPage + direction);
  }, []);

  const renderBookRow = useCallback((elem, index) => (
    <tr key={`${elem.isbn}-${index}`}>
      <td>
        <a href={elem.infoLink} target="_blank" rel="noopener noreferrer">
          {elem.title}
        </a>
      </td>
      <td>
        {elem.download && (
          <a href={elem.downloadLink} target="_blank" rel="noopener noreferrer">
            ダウンロード
          </a>
        )}
      </td>
    </tr>
  ), []);

  const renderTable = () => (
    <table className="table table-bordered table-hover">
      <thead className="table-light">
        <tr className='text-center'>
          <th>タイトル</th>
          <th>ダウンロード</th>
        </tr>
      </thead>
      <tbody>
        {books.length > 0 ? (
          books.map((book, index) => renderBookRow(book, index))
        ) : (
          <tr>
            <td colSpan="2" className="text-center">検索結果がありません</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="検索キーワードを入力"
              className="form-control"
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              検索
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          {isLoading ? (
            <div className="loading-spinner text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">読み込み中...</span>
              </div>
              <p className="mt-2">読み込み中...</p>
            </div>
          ) : (
            renderTable()
          )}

          <div className="d-flex justify-content-between">
            <button
              className="btn btn-secondary"
              onClick={() => handlePageChange(-1)}
              disabled={currentPage === 0}
            >
              前へ
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handlePageChange(1)}
              disabled={books.length < resultsPerPage}
            >
              次へ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

BookList.propTypes = {
  src: PropTypes.func.isRequired
};

export default BookList;
