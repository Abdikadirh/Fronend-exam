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
    console.log("Saving favorite movie:", movie); // Check movie object
    const button = document.querySelector(`#favButton-${movie.imdbID}`);
    console.log("Button element:", button); // Check if button is found

    if (!favorites.some(fav => fav.imdbID === movie.imdbID)) {
      favorites.push(movie); // Add movie to favorites if not already added
      localStorage.setItem("favorites", JSON.stringify(favorites)); // Save favorites to localStorage
      displayFavorites(); // Update favorites list

      if (button) {
        // Ensure button exists before modifying it
        // Visual feedback: Change button text to "Added" and disable it
        button.textContent = "Added";
        button.disabled = true;
      }

      // Scroll to the newly added movie in the favorites list
      const newFavorite = document.querySelector(`#fav-${movie.imdbID}`);
      if (newFavorite) {
        newFavorite.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Show success message with movie title
      alert(
        `Your movie "${movie.Title}" has been added to the favorites list!`
      );
    }
  };

  // Display favorites
  function displayFavorites() {
    favoritesList.innerHTML = "";
    favorites.forEach(movie => {
      const movieItem = document.createElement("div");
      movieItem.className = "movie-item";
      movieItem.id = `fav-${movie.imdbID}`; // Assign unique ID here
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

  // Fetch movies by title and call fetchMovieDetailsBatch when needed
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
        fetchMovieDetailsBatch(imdbIDs); // Fetch details for all movies concurrently
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

  // Update movie count with live region
  function updateMovieCount(count) {
    movieCount.textContent = `Found ${count} movie(s)`; // Update the movie count text
  }

  // Fetch movie details
  async function fetchMovieDetails(imdbID) {
    try {
      showLoadingSpinner(); // Show loading spinner
      const response = await fetch(
        `https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`
      );
      const movie = await response.json();
      hideLoadingSpinner(); // Hide loading spinner
      movieDetails.innerHTML = `
              <div class="movie-item-content">
                  <h2>${movie.Title}</h2>
                  <p><span><strong>Year:</strong></span> ${movie.Year}</p>
                  <p><span><strong>Genre:</strong></span> ${movie.Genre}</p>
                  <p><span><strong>Plot:</strong></span> ${movie.Plot}</p>
                  <img src="${movie.Poster}" alt="${movie.Title}">
                  <button class="add-to-favorites">Add to Favorites</button>
              </div>
          `;
      // Add event listener for the "Add to Favorites" button in movie details
      const addToFavoritesButton = movieDetails.querySelector(
        ".add-to-favorites"
      );
      addToFavoritesButton.addEventListener("click", () => saveFavorite(movie)); // Add to favorites on click
    } catch (error) {
      hideLoadingSpinner(); // Hide loading spinner
      console.error("Error fetching movie details:", error); // Log error to console
      movieDetails.innerHTML =
        "<p>Something went wrong. Please try again later.</p>";
    }
  }

  // Clear movie details
  function clearMovieDetails() {
    movieDetails.innerHTML = ""; // Clear movie details
  }

  // Show loading spinner
  function showLoadingSpinner() {
    loadingSpinner.style.display = "block"; // Show loading spinner
  }

  // Hide loading spinner
  function hideLoadingSpinner() {
    loadingSpinner.style.display = "none"; // Hide loading spinner
  }

  displayFavorites(); // Display favorites on page load
  loadInitialMovies(); // Load initial movies

  // Load initial movies
  async function loadInitialMovies() {
    try {
      showLoadingSpinner(); // Show loading spinner
      const response = await fetch(
        `https://www.omdbapi.com/?s=batman&apikey=${apiKey}`
      );
      const data = await response.json();
      hideLoadingSpinner(); // Hide loading spinner
      if (data.Response === "True") {
        displayMovies(data.Search); // Display movies in the list
        updateMovieCount(data.Search.length); // Update movie count
      }
    } catch (error) {
      hideLoadingSpinner(); // Hide loading spinner
      console.error("Error loading initial movies:", error); // Log error to console
    }
  }

  // Fetch multiple movie details concurrently using Promise.all
  async function fetchMovieDetailsBatch(imdbIDs) {
    try {
      const moviePromises = imdbIDs.map(id =>
        fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`).then(res =>
          res.json()
        )
      );
      const movies = await Promise.all(moviePromises); // This resolves all movie details concurrently
      displayMovieDetails(movies); // Display the movie details
    } catch (error) {
      console.error("Error fetching multiple movie details:", error); // Log error to console
    }
  }
});
