import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    padding: 10px;
    overflow-y: auto;
    height: calc(100vh - 100px); /* Adjust height to leave space for navbar */
    scrollbar-width: none;
    -ms-overflow-style: none;

    /* Hide scrollbar for WebKit-based browsers */
    &::-webkit-scrollbar {
        width: 0;
        height: 0;
    }

    /* Styling for scrollbar on hover */
    &:hover {
        scrollbar-width: thin;
        scrollbar-color: darkgrey lightgrey;
    }

    &:hover::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    &:hover::-webkit-scrollbar-thumb {
        background-color: darkgrey;
        border-radius: 10px;
    }

    &:hover::-webkit-scrollbar-track {
        background: lightgrey;
    }
`;

const NavBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #007bff;
    color: white;
    padding: 10px;
`;

const NavBarItem = styled.img`
    width: 60px;
    height: auto; /* Adjust height to maintain aspect ratio */
    cursor: pointer;
`;

const ImageContainer = styled.div`
    position: relative;
`;

const Image = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const ImageName = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 5px;
    box-sizing: border-box;
`;

const Loader = styled.div`
    text-align: center;
    padding: 20px;
    font-size: 1.5em;
`;

const BackToTopButton = styled.button`
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    display: ${({ show }) => (show ? 'block' : 'none')};
`;

const placeholderImageUrl = 'https://test.create.diagnal.com/images/placeholder_for_missing_posters.png';

const Grid = () => {
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);
    const [showBackToTop, setShowBackToTop] = useState(false);

    const fetchImages = useCallback(async () => {
        if (!hasMore) {
            return;
        }

        try {
            const response = await fetch(`https://test.create.diagnal.com/data/page${page}.json`);
            if (!response.ok) {
                setHasMore(false);
                return;
            }
            const data = await response.json();
            const newImages = data['page']['content-items']['content'] || [];
            if (newImages.length === 0) {
                setHasMore(false);
            } else {
                setImages(prevImages => [...prevImages, ...newImages]);
                setPage(prevPage => prevPage + 1);
            }
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    }, [page, hasMore]);

    const handleScroll = useCallback(() => {
        if (loaderRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = loaderRef.current;
            if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore) {
                fetchImages();
            }
            // Show Back to Top button logic
            if (scrollTop > clientHeight) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        }
    }, [fetchImages, hasMore]);

    const scrollToTop = () => {
        if (loaderRef.current) {
            loaderRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    const handleBackClick = () => {
        // Placeholder for back click functionality
        console.log("Back clicked");
    };

    const handleSearchClick = () => {
        // Placeholder for search click functionality
        console.log("Search clicked");
    };

    useEffect(() => {
        const gridElement = loaderRef.current;
        if (gridElement) {
            gridElement.addEventListener('scroll', handleScroll);
            return () => gridElement.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    observer.unobserve(img);
                }
            });
        }, options);

        document.querySelectorAll('.lazy').forEach(img => {
            observer.observe(img);
        });

        return () => {
            observer.disconnect();
        };
    }, [images]); // Observe changes in images array

    const renderImage = (poster) => {
        const imageUrl = `https://test.create.diagnal.com/images/${poster['poster-image']}`;
        const name = poster.name || 'No Name';

        return (
            <ImageContainer key={poster.id}>
                <Image
                    className="lazy"
                    src={placeholderImageUrl}
                    data-src={imageUrl}
                    alt=""
                    onError={(e) => { e.target.src = placeholderImageUrl }}
                />
                <ImageName>{name}</ImageName>
            </ImageContainer>
        );
    };

    return (
        <>
            <NavBar>
                <NavBarItem src="https://test.create.diagnal.com/images/Back.png" alt="Back" onClick={handleBackClick} />
                {/* <h2>Grid of Images</h2> */}
                <NavBarItem src="https://test.create.diagnal.com/images/search.png" alt="Search" onClick={handleSearchClick} />
            </NavBar>
            <GridContainer ref={loaderRef} data-testid="grid-container">
                {images.map((poster, index) => renderImage(poster))}
                {hasMore && <Loader>Loading...</Loader>}
                <BackToTopButton show={showBackToTop} onClick={scrollToTop}>Back to Top</BackToTopButton>
            </GridContainer>
        </>
    );
};

export default Grid;