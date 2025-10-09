// DOM elements
const collegeForm = document.getElementById('collegeForm');
const resultsContainer = document.getElementById('resultsContainer');
const collegeTableBody = document.getElementById('collegeTableBody');
const selectedCountElement = document.getElementById('selectedCount');
const cityCheckboxGroup = document.getElementById('cityCheckboxGroup');
const universitySelect = document.getElementById('university');
const backButton = document.getElementById('back_to_home');
const paginationContainer = document.getElementById('pagination');

// Global variables
let currentPage = 1;
const collegesPerPage = 10;
let allColleges = [];

// Loading system
function createLoadingOverlay() {
    if (!document.getElementById('loading-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 10, 26, 0.9);
            backdrop-filter: blur(5px);
            z-index: 10000;
            display: none;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        `;
        
        overlay.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                text-align: center;
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    border: 4px solid rgba(74, 144, 226, 0.3);
                    border-top: 4px solid #4a90e2;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
                <div style="
                    color: #ffffff;
                    font-size: 18px;
                    font-weight: 500;
                " id="loading-text">Loading...</div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(overlay);
    }
}

function showLoading(message = 'Loading...') {
    createLoadingOverlay();
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    
    if (loadingText) {
        loadingText.textContent = message;
    }
    
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Smooth scroll to results
function scrollToResults() {
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
        resultsContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

// Toast functionality
function showToast(message, type = 'info', duration = 4000) {
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        'success': '✓',
        'error': '✕',
        'warning': '⚠',
        'info': 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${iconMap[type] || 'ℹ'}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

// Smooth scroll to results
function scrollToResults() {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// Event Listeners
collegeForm.addEventListener('submit', handleFormSubmit);
cityCheckboxGroup.addEventListener('change', handleCityCheckboxChange);
backButton.addEventListener('click', () => {
    window.location.href = '/';
});

// Initialize
document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
    try {
        showLoading('Loading form data...');
        
        await fetchUniversities();
        await fetchCities();
        
        hideLoading();
        showToast('Form loaded successfully!', 'success', 2000);
        
    } catch (error) {
        console.error('Error initializing form:', error);
        hideLoading();
        showToast('Error loading form data. Some features may not work correctly.', 'error');
    }
}

// Event Handlers
function handleCityCheckboxChange(e) {
    if (e.target.value === "All" && e.target.checked) {
        // If "All Cities" is checked, uncheck all other cities
        const otherCheckboxes = document.querySelectorAll('input[name="city"]:not([value="All"])');
        otherCheckboxes.forEach(cb => cb.checked = false);
    } else if (e.target.value !== "All" && e.target.checked) {
        // If any other city is checked, uncheck "All Cities"
        const allCheckbox = document.querySelector('input[name="city"][value="All"]');
        if (allCheckbox) allCheckbox.checked = false;
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    // Get all checked city checkboxes
    const cityCheckboxes = document.querySelectorAll('input[name="city"]:checked');
    const cities = Array.from(cityCheckboxes).map(cb => cb.value);

    // If "All Cities" is selected, ignore other selections
    const finalCities = cities.includes("All") ? ["All"] : cities;

    const formData = {
        university: universitySelect.value,
        cities: finalCities
    };

    generateCollegeList(formData);
}


// Core Functions
async function generateCollegeList(formData) {
    try {
        // Show loading overlay
        showLoading('Searching for top colleges...');
        
        const response = await fetch('/pcm/topCollegeList', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        
        // Update loading message
        showLoading('Processing results...');
        
        allColleges = data;
        
        displayColleges(data);
        currentPage = 1; // Reset to first page
        updatePagination(data.length);
        
        // Hide loading
        hideLoading();
        
        // Show success toast and scroll to results
        if (data && data.length > 0) {
            showToast(`Found ${data.length} colleges matching your criteria!`, 'success');
            // Auto scroll to results after a short delay
            setTimeout(() => {
                scrollToResults();
            }, 500);
        } else {
            showToast('No colleges found matching your criteria.', 'warning');
            // Still scroll to show the "no results" message
            setTimeout(() => {
                scrollToResults();
            }, 500);
        }

    } catch (error) {
        console.log('Error:', error);
        hideLoading();
        showToast('An error occurred while fetching college data. Please try again.', 'error');
    }
}

function displayColleges(colleges) {
    collegeTableBody.innerHTML = '';

    if (!colleges || colleges.length === 0) {
        collegeTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No colleges found matching your criteria.</td></tr>';
        resultsContainer.style.display = 'block';
        paginationContainer.innerHTML = '';
        return;
    }

    // Calculate start and end index for current page
    const startIndex = (currentPage - 1) * collegesPerPage;
    const endIndex = Math.min(startIndex + collegesPerPage, colleges.length);
    
    // Display colleges for current page
    for (let i = startIndex; i < endIndex; i++) {
        const college = colleges[i];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${college.college_code}</td>
            <td><a class="college_ancor_tag" onclick="viewCollegeDetails(${college.college_code})">${college.college_name}</a></td>
        `;
        
        collegeTableBody.appendChild(row);
    }

    resultsContainer.style.display = 'block';
    selectedCountElement.textContent = `${colleges.length} colleges found`;
}

// View College Details
function viewCollegeDetails(id) {
    window.location.href = `/collegePagePCM/${id}`;
}

function updatePagination(totalColleges) {
    paginationContainer.innerHTML = '';
    
    const totalPages = Math.ceil(totalColleges / collegesPerPage);
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayColleges(allColleges);
            updatePagination(totalColleges);
        }
    });
    paginationContainer.appendChild(prevButton);
    
    // Page buttons
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.textContent = '1';
        firstPageButton.addEventListener('click', () => {
            currentPage = 1;
            displayColleges(allColleges);
            updatePagination(totalColleges);
        });
        paginationContainer.appendChild(firstPageButton);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }
    
    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayColleges(allColleges);
            updatePagination(totalColleges);
        });
        paginationContainer.appendChild(pageButton);
    }
    
    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
        
        const lastPageButton = document.createElement('button');
        lastPageButton.textContent = totalPages;
        lastPageButton.addEventListener('click', () => {
            currentPage = totalPages;
            displayColleges(allColleges);
            updatePagination(totalColleges);
        });
        paginationContainer.appendChild(lastPageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayColleges(allColleges);
            updatePagination(totalColleges);
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Data Fetching Functions
async function fetchUniversities() {
    try {
        const response = await fetch('/collegePredictorPCM/fetchUniversity');
        const data = await response.json();
        
        data.forEach(element => {
            const option = document.createElement('option');
            option.value = element.university;
            option.textContent = element.university;
            universitySelect.appendChild(option);
        });

    } catch (error) {
        console.log('Error fetching universities:', error);
        showToast('Error loading universities. Using default options.', 'warning');
        universitySelect.innerHTML = '<option value="All" selected>All Universities</option>';
    }
}



function processCities(citiesArray) {

    const allCities = citiesArray.map(cityObj => cityObj.city.toUpperCase());
    const uniqueCities = [...new Set(allCities)];
    
    return uniqueCities;
}

async function fetchCities() {
    try {
        const response = await fetch('/collegePredictorPCM/fetchcity');
        const data = await response.json();
         
        const new_data = processCities(data);
        // console.log(new_data);
        new_data.forEach(city => {
            const label = document.createElement('label');
            label.className = 'checkbox-label';
            label.innerHTML = `
                <input type="checkbox" name="city" value="${city}">
                <span>${city}</span>
            `;
            cityCheckboxGroup.appendChild(label);
        });

    } catch (error) {
        console.log('Error fetching cities:', error);
        showToast('Error loading cities. Using default options.', 'warning');
        cityCheckboxGroup.innerHTML = `
            <label class="checkbox-label">
                <input type="checkbox" name="city" value="All" checked>
                <span>All Cities</span>
            </label>
        `;
    }
}



