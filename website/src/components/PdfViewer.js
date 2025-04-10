import React, { useEffect, useRef, useState } from 'react';
let pdfjsLib, GlobalWorkerOptions;


if (typeof window !== 'undefined') {
    pdfjsLib = require('pdfjs-dist');
    GlobalWorkerOptions = pdfjsLib.GlobalWorkerOptions;
    GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
    ).toString();
}

const PdfViewer = ({ pdfUrl, scale }) => {
    const containerRef = useRef(null); // Reference to the scroll container
    const [numPages, setNumPages] = useState(0); // Total number of pages in the PDF
    const [currentPage, setCurrentPage] = useState(1); // Current page number
    const pageHeightsRef = useRef([]); // Array to store the height of each page (including separators)
    const pdfDocRef = useRef(null); // Ref to store the loaded PDF document object
    const isPdfLoaded = useRef(false); // Flag to indicate if the PDF has been loaded

    useEffect(() => {
        const loadPdf = async () => {
            try {
                // Load the PDF document
                const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
                pdfDocRef.current = pdf; // Save the PDF document object to the ref
                setNumPages(pdf.numPages);
                isPdfLoaded.current = true; // Mark the PDF as loaded

                // Initialize and render all pages
                renderAllPages(pdf);
            } catch (error) {
                console.error('PDF loading failed:', error.message);
            }
        };

        loadPdf();
    }, [pdfUrl]);

    const renderAllPages = async (pdf) => {
        if (!containerRef.current || !pdf) return;

        // Clear the scroll container
        containerRef.current.innerHTML = '';

        const containerWidth = containerRef.current.clientWidth;
        pageHeightsRef.current = []; // Reset the array of page heights

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: scale }); // Set the zoom scale

            // Create a new Canvas element
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Set the canvas dimensions
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Render the page
            await page.render({ canvasContext: context, viewport }).promise;

            // Calculate the page height
            const pageHeight = (viewport.height / viewport.width) * containerWidth;

            // Create a page container
            const pageContainer = document.createElement('div');
            pageContainer.style.height = `${pageHeight}px`;
            pageContainer.style.display = 'flex';
            pageContainer.style.justifyContent = 'center';
            pageContainer.style.alignItems = 'center';
            pageContainer.appendChild(canvas);

            // Add a page separator (optional)
            const spacer = document.createElement('div');
            spacer.style.height = '20px'; // Space between pages
            spacer.style.backgroundColor = '#f0f0f0'; // Separator color

            // Append the page container and separator to the scroll container
            containerRef.current.appendChild(pageContainer);
            containerRef.current.appendChild(spacer);

            // Record the height of each page (including the separator)
            pageHeightsRef.current.push(pageHeight + 20); // 20 is the separator height
        }

        // Update the current page number
        updateCurrentPage();
    };

    const updateCurrentPage = () => {
        if (!containerRef.current) return;

        const scrollTop = containerRef.current.scrollTop; // Get the current scroll position
        let cumulativeHeight = 0;

        // Calculate the current page based on the cumulative height
        for (let i = 0; i < pageHeightsRef.current.length; i++) {
            cumulativeHeight += pageHeightsRef.current[i];
            if (scrollTop < cumulativeHeight) {
                setCurrentPage(i + 1); // Update the current page number
                break;
            }
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    if (isPdfLoaded.current) {
                        renderAllPages(pdfDocRef.current); // Re-render when the container size changes
                    }
                }
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        // Listen for scroll events
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', updateCurrentPage);
        }

        // Clean up the event listener
        return () => {
            if (container) {
                container.removeEventListener('scroll', updateCurrentPage);
            }
        };
    }, []);

    return (
        <div>
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '700px', // Container height
                    overflowY: 'auto', // Enable vertical scrolling
                    border: '1px solid #ccc',
                    backgroundColor: "#f0f0f0",
                }}
            >
                {/* PDF rendering area */}
                <div style={{ position: 'relative' }}></div>
            </div>
            <span style={{ margin: '0 10px' }}>
                Current Page: {currentPage} / Total Pages: {numPages}
            </span>
        </div>
    );
};

export default PdfViewer;