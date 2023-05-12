import React, { useState, useEffect } from 'react';
import { TextField, Button, Autocomplete } from '@mui/material';
import { useInView } from 'react-intersection-observer';
import Shimmer from './Shimmer';

const API_KEY = '2f3bd9fdb618c112bb3e571629fef076';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [suggestedQueries, setSuggestedQueries] = useState([]);
  const [ref, inView] = useInView({
    triggerOnce: true,
  });

  useEffect(() => {
    const savedQueries = localStorage.getItem('suggestedQueries');
    if (savedQueries) {
      setSuggestedQueries(JSON.parse(savedQueries));
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [searchQuery, page]);

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [inView, isLoading, hasMore]);

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      let url = `https://www.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=${API_KEY}&per_page=20&page=${page}&format=json&nojsoncallback=1`;
      if (searchQuery) {
        url = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${API_KEY}&text=${searchQuery}&per_page=20&page=${page}&format=json&nojsoncallback=1`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.photos.photo.length > 0) {
        setPhotos((prevPhotos) => [...prevPhotos, ...data.photos.photo]);
        setHasMore(data.photos.page < data.photos.pages);
        setIsLoading(false);
      } else {
        setHasMore(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
    setPhotos([]);
    if (e.target.value) {
      fetchPhotos();
    }
  };

  const handlePhotoClick = (photo) => {
    console.log('Clicked photo:', photo);
    // Implement photo preview modal
  };

  const handleSearchFormSubmit = (e) => {
    e.preventDefault();
    if (searchQuery) {
      saveSuggestedQuery(searchQuery);
      fetchPhotos();
    }
  };

  const saveSuggestedQuery = (query) => {
    if (!suggestedQueries.includes(query)) {
      const updatedQueries = [query, ...suggestedQueries.slice(0, 4)];
      setSuggestedQueries(updatedQueries);
      localStorage.setItem('suggestedQueries', JSON.stringify(updatedQueries));
    }
  };

  return (
    <div>
      <header>
        <h1>Picso</h1>
        <form onSubmit={handleSearchFormSubmit}>
          <Autocomplete
            freeSolo
            options={suggestedQueries}
            value={searchQuery}
            onChange={(event, value) => setSearchQuery(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
            )}
          />
          <Button type="submit" variant="contained">
            Search
          </Button>
        </form>
      </header>
      <div className="container">
        <div className="row">
          {photos.map((photo, index) => {
            if (index === photos.length - 1) {
              return (
                <div
                  className="photos"
                  key={photo.id}
                  ref={ref}
                  onClick={() => handlePhotoClick(photo)}
                >
                  <img
                    src={`https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`}
                    alt={photo.title}
                    className="img-fluid"
                  />
                </div>
              );
            }
            return (
              <div
                className="photos"
                key={photo.id}
                onClick={() => handlePhotoClick(photo)}
              >
                <img
                  src={`https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`}
                  alt={photo.title}
                  className="img-fluid"
                />
              </div>
            );
          })}
        </div>
      </div>
      {isLoading && <p><Shimmer /></p>}
      {!isLoading && photos.length > 0 && (
        <Button variant="contained" onClick={() => setPage((prevPage) => prevPage + 1)}>
          Load More
        </Button>
      )}
      {!isLoading && !hasMore && photos.length === 0 && <p>No results found.</p>}
    </div>
  );
};

export default App;
