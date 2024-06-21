import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Pagination as MuiPagination, Box, Typography } from '@mui/material';

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
    background-color: darkslategrey;
    color: white;
    padding: 10px;
`;

const NavBarItem = styled.img`
    width: 45px;
    height: auto; /* Adjust height to maintain aspect ratio */
    cursor: pointer;
`;

const SearchInput = styled.input`
    padding: 5px;
    border: none;
    border-radius: 5px;
    display: ${({ visible }) => (visible ? 'block' : 'none')};
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

const placeholderImageUrl = 'https://test.create.diagnal.com/images/placeholder_for_missing_posters.png';

const Grid = () => {
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12); // Adjust as needed
    const [totalPages, setTotalPages] = useState(0);

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
            setTotalPages(Math.ceil((images.length + newImages.length) / itemsPerPage));
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    }, [page, hasMore, itemsPerPage, images.length]);

    const handlePageChange = (event, pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleScroll = useCallback(() => {
        if (loaderRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = loaderRef.current;
            if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore) {
                fetchImages();
            }
        }
    }, [fetchImages, hasMore]);

    const handleBackClick = () => {
        setShowSearch(prevShowSearch => {
            if (prevShowSearch) {
                setSearchTerm('');
                setFilteredImages([]);
                setPage(1);
                setHasMore(true);
                fetchImages();
            }
            return !prevShowSearch;
        });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        setPage(1); // Reset page when searching
        if (value === '') {
            setFilteredImages(images);
        } else {
            const filtered = images.filter(image =>
                image.name.toLowerCase().includes(value)
            );
            setFilteredImages(filtered);
        }
    };

    const handleSearchClick = () => {
        setShowSearch(prevShowSearch => !prevShowSearch);
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

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredImages(images);
        }
    }, [images, searchTerm]);

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

    const currentItems = searchTerm ? filteredImages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : images.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            <NavBar>
                <NavBarItem src="https://test.create.diagnal.com/images/Back.png" alt="Back" onClick={handleBackClick} />
                <SearchInput
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    visible={showSearch}
                />
                <NavBarItem
                    src="https://test.create.diagnal.com/images/search.png"
                    alt="Search"
                    onClick={handleSearchClick}
                    style={{ display: showSearch ? 'none' : 'block' }}
                />
            </NavBar>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <MuiPagination
                    count={Math.ceil((searchTerm ? filteredImages.length : images.length) / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    siblingCount={0}
                    boundaryCount={1}
                    size={'small'}
                    sx={{
                        mt: 2,
                        justifyContent: 'center',
                        marginBottom: '5px',
                        display: 'flex',
                        '& .MuiPaginationItem-root': {
                            color: 'darkslategrey',
                            borderColor: 'darkslategrey',
                        },
                        '& .Mui-selected': {
                            color: 'white',
                            backgroundColor: 'darkslategrey',
                        },
                    }}
                />
                {/* <Typography variant="body2" sx={{ mt: 2 }}>
                    Page {currentPage} of {Math.ceil((searchTerm ? filteredImages.length : images.length) / itemsPerPage)}
                </Typography> */}
            </Box>
            <GridContainer ref={loaderRef} data-testid="grid-container">
                {currentItems.map((poster, index) => renderImage(poster))}
                {hasMore && <Loader>Loading...</Loader>}
            </GridContainer>
        </>
    );
};

export default Grid;