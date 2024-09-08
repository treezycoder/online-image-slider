import axios from "axios";
import "./App.css";
import { useEffect, useState } from "react";

export default function App() {
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(null); // Store total pages
  const [isOnline, setIsOnline] = useState(false);

  function handleSearch(event) {
    event.preventDefault();
    if (!isOnline) return;
    console.log("Form submitted:", searchTerm);
    setCurrentPage(1);
    fetchImages(currentPage);
  }

  //Fetching Images from api
  async function fetchImages(pageNumber) {
    if (!isOnline) return;
    setLoading(true);
    setErrorMessage(false);
    setCurrentImageIndex(0);
    if (!searchTerm) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        `https://api.unsplash.com/search/photos`,
        {
          params: { query: searchTerm, page: pageNumber },
          headers: {
            Authorization: `Client-ID PhhCADJfMZnHTkRsdkp7Tz1jxAS3koC8tFuh-vs9JhA`,
          },
        }
      );
      console.log(response);
      setImages(response.data.results);
      // Extract total pages from Link headers
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.log(error);
      setErrorMessage(true);
    } finally {
      setLoading(false);
    }
  }
  console.log(
    totalPages,
    currentPage,
    searchTerm,
    currentImageIndex,
    images,
    errorMessage
  );
  //Navigation and Controls
  function handlePrevImage() {
    if (!isOnline) return;
    if (images.length === 0) return;
    if (currentImageIndex === 0) {
      setCurrentImageIndex(images.length - 1);
    } else {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  }

  function handleNextImage() {
    if (!isOnline) return;
    if (images.length === 0) return;
    if (currentImageIndex === images.length - 1) {
      setCurrentImageIndex(0);
    } else {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  }

  function handlePrevPage() {
    if (!isOnline) return;
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function handleNextPage() {
    if (!isOnline) return;
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }

  //Navigation and Controls
  function handleReload() {
    setTotalPages(null);

    setCurrentPage(1);
    fetchImages(currentPage);
  }

  //Fetch new images when page changes
  useEffect(() => {
    fetchImages(currentPage);
  }, [currentPage]);

  //checking online status
  useEffect(() => {
    const checkConnection = async () => {
      const onlineStatus = navigator.onLine;
      if (onlineStatus) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    };
    checkConnection();

    const intervalId = setInterval(checkConnection, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  console.log(navigator.onLine ? "You are online" : "You are offline");

  return (
    <div>
      <section
        id="search"
        className=" h-[120px] flex flex-col justify-around items-center"
      >
        <h1
          aria-label="Header"
          className="select-none p-4 text-2xl text-cyan-700 font-bold font-sans uppercase tracking-wide "
        >
          online image slider
        </h1>
        <form id="Search Field" onSubmit={handleSearch} className="">
          <input
            aria-label="Search Box"
            className="border-2 rounded-full w-[200px] py-2 px-4 focus:outline-none focus:border-cyan-700/30 shadow-sm shadow-cyan-200 placeholder-slate-500 placeholder:text-md placeholder:font-mono ring-2 ring-cyan-700"
            type="text"
            placeholder="Search Images.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </section>
      <section id="photos" className="mt-[10px]">
        <div className="aspect-video block mx-auto w-full h-[320px] max-w-[600px] md:w-[80%] relative border-2 shadow-lg hover:shadow-xl rounded-lg px-4 py-12 select-none">
          <p className=" mx-auto absolute top-3 left-[43%] text-slate-500 font-bold font-mono italic text-sm ">
            Page{` `}
            {loading || images.length === 0 ? "*" : currentPage}
            <span className="tracking-wider">/</span>
            {totalPages ? totalPages : "*"}
          </p>
          <span
            id="online-indicator"
            className={`inline-block absolute top-4 left-[40%] border rounded-full w-[10px] h-[10px] ${
              isOnline ? "bg-green-500" : "bg-red-500"
            } ring-1 ring-gray-300 ${!isOnline ? "pulsate-bck" : " "}`}
          ></span>
          <div
            aria-label="Images Display Screen"
            id="image-container"
            className="block bg-black border rounded-sm w-full h-full"
          >
            {
              <div className="has-[img]:border-0 text-center text-xl font-mono font-bold my-auto h-full flex items-center justify-center drop-shadow-sm border">
                {!isOnline ? (
                  <p className="text-red-400">You are offline</p>
                ) : loading ? (
                  <p className="text-green-400">Fetching Images...</p>
                ) : errorMessage ? (
                  <p className="text-red-400">
                    Failed to Fetch Images, Please Reload
                  </p>
                ) : images.length === 0 ? (
                  <p className="text-white/30">No Images To Display</p>
                ) : (
                  <img
                    alt={images[currentImageIndex]?.alt_description}
                    aria-label={`Image ${currentImageIndex + 1}`}
                    src={images[currentImageIndex]?.urls?.regular}
                    className="fade-in object-fill border-0 w-full h-full"
                  />
                )}
              </div>
            }
          </div>

          {!loading && images.length > 0 && !errorMessage && (
            <ul className="flex flex-row space-x-0.5 justify-center relative top-[15px] w-full">
              {images.map((_, index) => (
                <li
                  aria-label={`go to image ${index + 1}`}
                  onClick={() => setCurrentImageIndex(index)}
                  key={index}
                  className={`hover:cursor-pointer border rounded-full w-4 h-4  ${
                    currentImageIndex === index ? "bg-gray-900" : "bg-gray-400"
                  } `}
                />
              ))}
            </ul>
          )}
          {loading && (
            <div class="loading-dots space-x-0.5 flex flex-row justify-center relative top-[15px] w-full">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
          {errorMessage && isOnline && (
            <div className="flex flex-row justify-center relative top-[10px] w-full">
              <span
                aria-label="Refresh search"
                onClick={handleReload}
                title="Reload"
                className="cursor-pointer border-0 relative hover:bg-black/10 rounded-full p-2 bottom-[5px]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
          )}

          <span
            aria-label="Previous Page"
            title="Previous Page"
            id="prev-page"
            onClick={handlePrevPage}
            className={`${
              currentPage === 1 ? "" : "hover:bg-black/10"
            } border-0  rounded-full p-2 inline absolute left-[15%] bottom-1 ${
              currentPage === 1 ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={`${currentPage === 1 ? "grey" : "currentColor"}`}
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M10.72 11.47a.75.75 0 0 0 0 1.06l7.5 7.5a.75.75 0 1 0 1.06-1.06L12.31 12l6.97-6.97a.75.75 0 0 0-1.06-1.06l-7.5 7.5Z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M4.72 11.47a.75.75 0 0 0 0 1.06l7.5 7.5a.75.75 0 1 0 1.06-1.06L6.31 12l6.97-6.97a.75.75 0 0 0-1.06-1.06l-7.5 7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </span>

          <span
            aria-label="Next Page"
            title="Next Page"
            id="next-page"
            onClick={handleNextPage}
            className={`${
              currentPage === totalPages || images.length === 0
                ? " "
                : "hover:bg-black/10"
            } border-0 rounded-full p-2 inline absolute right-[15%] bottom-1 ${
              currentPage === totalPages || images.length === 0
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={`${
                currentPage === totalPages || images.length === 0
                  ? "grey"
                  : "currentColor"
              }`}
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M13.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M19.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span
            aria-label="Previous Image"
            title="Previous Image"
            id="prev-image"
            className={`${
              images.length === 0 ? "cursor-not-allowed" : "cursor-pointer"
            } cursor-pointer border-0 ${
              images.length === 0 ? " " : "hover:bg-black/10"
            } rounded-full p-2 inline absolute left-[21%] bottom-1`}
            onClick={handlePrevImage}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={`${images.length === 0 ? "grey" : " currentColor"}`}
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span
            aria-label="Next Image"
            title="Next Image"
            id="next-image"
            className={`${
              images.length === 0 ? "cursor-not-allowed" : "cursor-pointer"
            } border-0 ${
              images.length === 0 ? " " : "hover:bg-black/10"
            } rounded-full p-2 inline absolute right-[21%] bottom-1`}
            onClick={handleNextImage}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={`${images.length === 0 ? "grey" : " currentColor"}`}
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      </section>
    </div>
  );
}
