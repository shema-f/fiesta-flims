const movieData = [
    {
        id: 1,
        title: "Echoes of Tomorrow",
        year: 2025,
        genre: "Sci-Fi",
        rating: 8.9,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=epic%20sci-fi%20movie%20poster%20futuristic%20city%20dark%20atmosphere&image_size=portrait_4_3",
        trending: true
    },
    {
        id: 2,
        title: "Midnight Shadows",
        year: 2024,
        genre: "Thriller",
        rating: 8.5,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=thriller%20movie%20poster%20dark%20mysterious%20atmosphere&image_size=portrait_4_3",
        trending: true
    },
    {
        id: 3,
        title: "Ocean's Heart",
        year: 2025,
        genre: "Adventure",
        rating: 9.1,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=adventure%20movie%20poster%20ocean%20exploration%20epic%20journey&image_size=portrait_4_3",
        trending: true
    },
    {
        id: 4,
        title: "Love in Paris",
        year: 2024,
        genre: "Romance",
        rating: 7.8,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=romantic%20movie%20poster%20paris%20eiffel%20tower%20beautiful%20couple&image_size=portrait_4_3",
        trending: false
    },
    {
        id: 5,
        title: "Neon Nights",
        year: 2025,
        genre: "Action",
        rating: 8.7,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=action%20movie%20poster%20cyberpunk%20neon%20lights%20hero&image_size=portrait_4_3",
        trending: true
    },
    {
        id: 6,
        title: "Forest of Secrets",
        year: 2024,
        genre: "Fantasy",
        rating: 8.3,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=fantasy%20movie%20poster%20magical%20forest%20mystical%20creatures&image_size=portrait_4_3",
        trending: false
    },
    {
        id: 7,
        title: "Space Odyssey",
        year: 2025,
        genre: "Sci-Fi",
        rating: 9.0,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=space%20movie%20poster%20astronaut%20galaxy%20stars&image_size=portrait_4_3",
        trending: true
    },
    {
        id: 8,
        title: "The Last Laugh",
        year: 2024,
        genre: "Comedy",
        rating: 7.5,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=comedy%20movie%20poster%20funny%20characters%20vibrant%20colors&image_size=portrait_4_3",
        trending: false
    },
    {
        id: 9,
        title: "Mountain Peak",
        year: 2025,
        genre: "Drama",
        rating: 8.6,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=drama%20movie%20poster%20mountain%20adventure%20inspirational&image_size=portrait_4_3",
        trending: false
    },
    {
        id: 10,
        title: "Ghost Protocol",
        year: 2024,
        genre: "Horror",
        rating: 8.2,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=horror%20movie%20poster%20scary%20ghost%20dark%20atmosphere&image_size=portrait_4_3",
        trending: false
    },
    {
        id: 11,
        title: "Cyber Warrior",
        year: 2025,
        genre: "Action",
        rating: 8.8,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk%20action%20movie%20poster%20warrior%20neon%20city&image_size=portrait_4_3",
        trending: true
    },
    {
        id: 12,
        title: "Ancient Mysteries",
        year: 2024,
        genre: "Documentary",
        rating: 8.0,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=documentary%20movie%20poster%20ancient%20ruins%20historical&image_size=portrait_4_3",
        trending: false
    }
];

const tvShowsData = [
    {
        id: 101,
        title: "Dark Realms",
        year: 2025,
        genre: "Fantasy",
        rating: 9.2,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=fantasy%20tv%20show%20poster%20epic%20world%20dragons%20magic&image_size=portrait_4_3"
    },
    {
        id: 102,
        title: "City of Dreams",
        year: 2024,
        genre: "Drama",
        rating: 8.4,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=drama%20tv%20show%20poster%20city%20night%20drama&image_size=portrait_4_3"
    },
    {
        id: 103,
        title: "Future Cop",
        year: 2025,
        genre: "Sci-Fi",
        rating: 8.9,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=sci-fi%20tv%20show%20poster%20future%20police%20cyberpunk&image_size=portrait_4_3"
    },
    {
        id: 104,
        title: "Family Ties",
        year: 2024,
        genre: "Comedy",
        rating: 7.9,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=comedy%20tv%20show%20poster%20family%20funny%20moments&image_size=portrait_4_3"
    },
    {
        id: 105,
        title: "Spy Games",
        year: 2025,
        genre: "Thriller",
        rating: 8.7,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=thriller%20tv%20show%20poster%20spy%20espionage%20secret%20agent&image_size=portrait_4_3"
    },
    {
        id: 106,
        title: "Wild Nature",
        year: 2024,
        genre: "Documentary",
        rating: 9.0,
        image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=wildlife%20documentary%20tv%20show%20poster%20animals%20nature&image_size=portrait_4_3"
    }
];

function createMovieCard(movie) {
    return `
        <div class="movie-card" data-id="${movie.id}">
            <div class="movie-card-image">
                <img src="${movie.image}" alt="${movie.title}">
                <div class="movie-card-overlay">
                    <div class="movie-card-actions">
                        <button class="movie-card-action play">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                        <button class="movie-card-action">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </button>
                        <button class="movie-card-action">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                ${movie.trending ? '<div class="movie-card-badge">Trending</div>' : ''}
            </div>
            <div class="movie-card-info">
                <h3 class="movie-card-title">${movie.title}</h3>
                <div class="movie-card-meta">
                    <span>${movie.year}</span>
                    <span>•</span>
                    <span>${movie.genre}</span>
                    <span class="movie-card-rating">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        ${movie.rating}
                    </span>
                </div>
            </div>
        </div>
    `;
}

function renderMovies() {
    const trendingContainer = document.getElementById('trendingMovies');
    const popularContainer = document.getElementById('popularMovies');
    const tvContainer = document.getElementById('tvShows');

    const trendingMovies = movieData.filter(movie => movie.trending);
    const popularMovies = movieData.filter(movie => !movie.trending);

    if (trendingContainer) {
        trendingContainer.innerHTML = trendingMovies.map(createMovieCard).join('');
    }

    if (popularContainer) {
        popularContainer.innerHTML = popularMovies.map(createMovieCard).join('');
    }

    if (tvContainer) {
        tvContainer.innerHTML = tvShowsData.map(createMovieCard).join('');
    }
}

function setupNavigation() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    const links = navLinks?.querySelectorAll('a') || [];
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks?.classList.remove('active');
        });
    });
}

function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn && searchInput) {
        const handleSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                alert(`Searching for: ${query}`);
            }
        };

        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
}

function setupMovieCards() {
    document.addEventListener('click', (e) => {
        const movieCard = e.target.closest('.movie-card');
        if (movieCard) {
            const movieId = movieCard.dataset.id;
            const allMovies = [...movieData, ...tvShowsData];
            const movie = allMovies.find(m => m.id == movieId);
            
            if (movie) {
                alert(`Selected: ${movie.title}\nYear: ${movie.year}\nRating: ${movie.rating}`);
            }
        }
    });
}

function setupScrollEffects() {
    let lastScroll = 0;
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (header) {
            if (currentScroll > 100) {
                header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
            } else {
                header.style.boxShadow = 'none';
            }
        }

        lastScroll = currentScroll;
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function init() {
    renderMovies();
    setupNavigation();
    setupSearch();
    setupMovieCards();
    setupScrollEffects();
    setupSmoothScroll();
}

document.addEventListener('DOMContentLoaded', init);
