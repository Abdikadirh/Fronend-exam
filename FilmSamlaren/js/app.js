document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "19b731cf"; // My API key
  const movieList = document.getElementById("movieList"); // Movie list container
  const movieDetails = document.getElementById("movieDetails"); // Movie details container
  const searchInput = document.getElementById("searchInput"); // Search input field
  const searchButton = document.getElementById("searchButton"); // Search button
  const movieCount = document.getElementById("movieCount"); // Movie count display
  const loadingSpinner = document.getElementById("loadingSpinner"); // Loading spinner
  const favoritesList = document.getElementById("favoritesList"); // Favorites list container

  const favorites = JSON.parse(localStorage.getItem("favorites")) || []; // Load favorites from localStorage

  // Function to handle the search
  function handleSearch() {
    const searchTerm = searchInput.value;
    if (searchTerm) {
      fetchMoviesByTitle(searchTerm); // Fetch movies by title
    }
  }

  // Event listener for search button click
  searchButton.addEventListener("click", handleSearch);

  // Event listener for Enter key press on keyboard
  searchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      handleSearch(); // Trigger search on Enter key press
    }
  });

  // Save movie to favorites
  window.saveFavorite = function(movie) {
    if (!favorites.some(fav => fav.imdbID === movie.imdbID)) {
      favorites.push(movie); // Add movie to favorites if not already added
      localStorage.setItem("favorites", JSON.stringify(favorites)); // Save favorites to localStorage
      displayFavorites(); // Update favorites list

      // Visual feedback: Change button text to "Added" and disable it
      const button = document.querySelector(`#favButton-${movie.imdbID}`);
      button.textContent = "Added";
      button.disabled = true;

      alert("Your movie has been added to the favorites list!"); // Show alert message
    }
  };

  // Display favorites
  function displayFavorites() {
    favoritesList.innerHTML = "";
    favorites.forEach(movie => {
      const movieItem = document.createElement("div");
      movieItem.className = "movie-item";
      movieItem.innerHTML = `
              <div class="movie-item-content">
                  <img src="${movie.Poster}" alt="${movie.Title}">
                  <h3>${movie.Title}</h3>
                  <p>${movie.Year}</p>
                  <button class="add-to-favorites" onclick='removeFavorite("${movie.imdbID}")'>Remove</button>
              </div>
          `;
      favoritesList.appendChild(movieItem);
    });
  }



    // Remove movie from favorites
    window.removeFavorite = function(imdbID) {
      const index = favorites.findIndex(movie => movie.imdbID === imdbID);
      if (index !== -1) {
        favorites.splice(index, 1); // Remove movie from favorites
        localStorage.setItem("favorites", JSON.stringify(favorites)); // Save updated favorites to localStorage
        displayFavorites(); // Update favorites list
        alert("Your movie has been removed from the favorites list!"); // Show alert message
      }
    };
  
    // Fetch movies by title and call fetch Movie DetailsBatch when needed parse and present the JSON data on the web page 
    async function fetchMoviesByTitle(title) {
      try {
        // Disable the search button during loading
        searchButton.disabled = true;
  
        clearMovieDetails(); // Clear movie details
        showLoadingSpinner(); // Show loading spinner
  
        const response = await fetch(
          `https://www.omdbapi.com/?s=${title}&apikey=${apiKey}`
        );
        const data = await response.json();
  
        // Hide loading spinner and re-enable the search button
        hideLoadingSpinner();
        searchButton.disabled = false; // Re-enable the button after loading
  
        if (data.Response === "True") {
          displayMovies(data.Search); // Display movies in the list
          updateMovieCount(data.Search.length); // Update movie count
          const imdbIDs = data.Search.map(movie => movie.imdbID);
          fetchMovieDetailsBatch(imdbIDs); // Fetch details for all movies currently
        } else {
          movieList.innerHTML = "<p>No movies found.</p>";
          updateMovieCount(0); // Update movie count to 0
        }
      } catch (error) {
        hideLoadingSpinner(); // Hide loading spinner
        searchButton.disabled = false; // Re-enable the button if an error occurs
        console.error("Error fetching movies:", error); // Log error to console
        movieList.innerHTML =
          "<p>Something went wrong. Please try again later.</p>";
      }
    }
  
    // Display movies in the list with live region
    function displayMovies(movies) {
      movieList.innerHTML = ""; // Clear the movie list
      movies.forEach(movie => {
        const movieItem = document.createElement("div");
        movieItem.className = "movie-item";
        movieItem.innerHTML = `
            <div class="movie-item-content">
                <img src="${movie.Poster}" alt="${movie.Title}">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
                <button class="add-to-favorites" onclick='saveFavorite(${JSON.stringify(
                  movie
                )})'>Add to Favorites</button>
            </div>
        `;
        movieItem.addEventListener("click", () => {
          fetchMovieDetails(movie.imdbID);
        });
        movieList.appendChild(movieItem);
      });
    }
  
