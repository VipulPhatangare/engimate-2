const central_object = {
    mainCaste: '',
    casteColumn: '',
    specialReservation: ''
};

let selectedBranches = [];
let currentCollegeData = [];
let currentFormData = {};

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

// Toast notification system
function createToastContainer() {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
}

function showToast(message, type = 'info', duration = 3000) {
    createToastContainer();
    
    const colors = {
        success: { bg: '#10B981', text: '#ffffff', icon: '✓' },
        error: { bg: '#EF4444', text: '#ffffff', icon: '✕' },
        warning: { bg: '#F59E0B', text: '#ffffff', icon: '⚠' },
        info: { bg: '#3B82F6', text: '#ffffff', icon: 'ℹ' }
    };
    
    const color = colors[type] || colors.info;
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${color.bg};
        color: ${color.text};
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: inherit;
        font-size: 14px;
        max-width: 350px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        pointer-events: auto;
        word-wrap: break-word;
    `;
    
    toast.innerHTML = `
        <span style="font-weight: bold; font-size: 16px;">${color.icon}</span>
        <span>${message}</span>
    `;
    
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// DOM elements
const casteSelect = document.getElementById('caste');
const tfwsContainer = document.getElementById('tfwsContainer');
const tfwsCheckbox = document.getElementById('tfws');
const branchCategorySelect = document.getElementById('branchCategory');
const collegeForm = document.getElementById('collegeForm');
const resultsContainer = document.getElementById('resultsContainer');
const collegeCardsContainer = document.getElementById('collegeCards');
const selectedCountElement = document.getElementById('selectedCount');
const regionCheckboxGroup = document.getElementById('regionCheckboxGroup');
// const roundSelect = document.getElementById('round');
const homeuniversitySelect = document.getElementById('homeUniversity');
const customBranchBtn = document.getElementById('customBranchBtn');
const branchSelect = document.getElementById('branch');
const selectedBranchesContainer = document.getElementById('selectedBranchesContainer');

// Initialize
updateSelectedCount(0);

// Event Listeners
casteSelect.addEventListener('change', handleCasteChange);
collegeForm.addEventListener('submit', handleFormSubmit);

regionCheckboxGroup.addEventListener('change', handleRegionCheckboxChange);
customBranchBtn.addEventListener('click', () => {
    customBranchBtn.style.display = 'none';
    toggleBranchSelection();
});
branchSelect.addEventListener('change', handleBranchSelection);

// PDF Download button event listener
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadPdfBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', generatePDF);
    }
});

// Event Handlers
function handleCasteChange() {
    if (this.value === 'OPEN' || this.value === 'OBC') {
        tfwsContainer.style.display = 'block';
    } else {
        tfwsContainer.style.display = 'none';
        tfwsCheckbox.checked = false;
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    // let percentile = parseFloat(document.getElementById('percentile').value);
    // let percentile_jee = parseFloat(document.getElementById('percentile_jee').value);

    // // console.log(percentile);
    // // console.log(percentile_jee);

    // // Check if both percentile values are null/NaN/empty
    // if ((isNaN(percentile) || percentile === null) && (isNaN(percentile_jee) || percentile_jee === null)) {
    //     showToast('Please fill either MHT-CET percentile or JEE percentile', 'warning');
    //     return;
    // }
    // Get all checked region checkboxes
    const regionCheckboxes = document.querySelectorAll('input[name="region"]:checked');
    const regions = Array.from(regionCheckboxes).map(cb => cb.value);

    // If "All Regions" is selected, ignore other selections
    const finalRegions = regions.includes("All") ? ["All"] : regions;

    const formData = {
        percentile: parseFloat(document.getElementById('percentile').value),
        caste: casteSelect.value,
        gender: document.querySelector('input[name="gender"]:checked').value,
        specialReservation: document.getElementById('specialReservation').value,
        tfws: tfwsCheckbox.checked,
        branchCategory: branchCategorySelect.value,
        city: finalRegions,
        selected_branches: [],
        round: 'eng_2025_26_cap_1',
        homeuniversity: homeuniversitySelect.value
    };

    // console.log('Form Data:', formData);
    generateCollegeList(formData);
}

document.getElementById('back_to_pcm').addEventListener('click',()=>{
  window.location.href = '/';
});

function handleRegionCheckboxChange(e) {
    if (e.target.value === "All" && e.target.checked) {
        // If "All Regions" is checked, uncheck all other regions
        const otherCheckboxes = document.querySelectorAll('input[name="region"]:not([value="All"])');
        otherCheckboxes.forEach(cb => cb.checked = false);
    } else if (e.target.value !== "All" && e.target.checked) {
        // If any other region is checked, uncheck "All Regions"
        const allCheckbox = document.querySelector('input[name="region"][value="All"]');
        allCheckbox.checked = false;
    }
}

function handleBranchSelection() {
    if (this.value && !selectedBranches.includes(this.value)) {
        selectedBranches.push(this.value);
        updateSelectedBranchesDisplay();

        // Remove selected option from dropdown
        this.querySelector(`option[value="${this.value}"]`).remove();

        // Reset dropdown
        this.value = '';

        // Hide dropdown if all branches are selected
        if (this.options.length <= 1) {
            branchSelect.classList.add('hidden');
        }
    }
}

function toggleBranchSelection() {
    branchSelect.classList.remove('hidden');
    branchSelect.focus();
}

function updateSelectedBranchesDisplay() {
    selectedBranchesContainer.innerHTML = '';

    selectedBranches.forEach(branchValue => {
        const branchText = branchSelect.querySelector(`option[value="${branchValue}"]`)?.text || branchValue;

        const tag = document.createElement('div');
        tag.className = 'branch-tag';
        tag.innerHTML = `
            ${branchText}
            <button type="button" data-value="${branchValue}">&times;</button>
        `;

        tag.querySelector('button').addEventListener('click', (e) => {
            e.stopPropagation();
            removeBranch(branchValue);
        });

        selectedBranchesContainer.appendChild(tag);
    });

    // Show/hide the add button based on remaining branches
    if (branchSelect.options.length > 1) {
        customBranchBtn.style.display = 'block';
    }
}

function removeBranch(branchValue) {
    selectedBranches = selectedBranches.filter(b => b !== branchValue);

    // Add the option back to the dropdown
    const optionText = [...branchSelect.options].find(opt => opt.value === branchValue)?.text || branchValue;
    if (optionText) {
        const option = new Option(optionText, branchValue);
        branchSelect.appendChild(option);
    }

    updateSelectedBranchesDisplay();
}

// Core Functions
async function generateCollegeList(formData) {
    formData.selected_branches = selectedBranches;
    
    // Show loading overlay
    showLoading('Searching for colleges...');
    
    try {
        const response = await fetch('/collegePredictorPCM/College_list', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log(data);
        
        // Hide loading before displaying results
        hideLoading();
        
        displayColleges(data, formData);
        
        // Show success toast based on results
        if (data && data.length > 0) {
            showToast(`Found ${data.length} colleges matching your criteria!`, 'success');
        } else {
            showToast('No colleges found matching your criteria.', 'warning');
        }
        
        // Auto scroll to results after data is loaded
        setTimeout(() => {
            scrollToResults();
        }, 500);

    } catch (error) {
        console.log('Error:', error);
        hideLoading();
        showToast('An error occurred while fetching college data. Please try again.', 'error');
    }
}

function displayColleges(colleges, formData) {
    collegeCardsContainer.innerHTML = '';
    
    // Store data for PDF generation
    currentCollegeData = colleges || [];
    currentFormData = formData || {};

    if (!colleges || colleges.length === 0) {
        collegeCardsContainer.innerHTML = '<p>No colleges found matching your criteria.</p>';
        resultsContainer.style.display = 'block';
        // Hide download button when no data
        const downloadBtn = document.getElementById('downloadPdfBtn');
        if (downloadBtn) downloadBtn.style.display = 'none';
        return;
    }

    colleges.forEach(college => {
        const card = createCollegeCard(college, formData);
        collegeCardsContainer.appendChild(card);
    });

    resultsContainer.style.display = 'block';
    updateSelectedCount(colleges.length);
    
    // Show download button when data is available
    const downloadBtn = document.getElementById('downloadPdfBtn');
    if (downloadBtn) downloadBtn.style.display = 'flex';
    
    // Generate PDF table content
    generatePdfList();
}

function createCollegeCard(college, formData) {
    const card = document.createElement('div');
    card.className = 'college-card selected';
    card.dataset.code = college.choice_code;

    let card_content = `
        <div class="college-card-header">
            <div class="college-code">${college.choice_code}</div>
            <div class="college-code">Seat type: ${college.seat_type}</div>
            <input type="checkbox" checked class="card-checkbox">
        </div>
        <div class="college-name">${college.college_name}</div>
        <div>University: ${college.university}</div>
        <div>${college.branch_name}</div>
        <div class="college-details">
            <div class="college-detail">
                <div class="college-detail-label">GOPEN</div>
                <div>${college.gopen}</div>
            </div>
            <div class="college-detail">
                <div class="college-detail-label">AI</div>
                <div>${college.all_india}</div>
            </div>
    `;

    if (formData.gender == 'Female') {
        card_content = card_content + `
            <div class="college-detail">
                <div class="college-detail-label">LOPEN</div>
                <div>${college.lopen}</div>
            </div>
        `;

        if (formData.caste != 'OPEN' && formData.caste != 'EWS') {
            let caste_column = `L${formData.caste}`;
            card_content = card_content + `
            <div class="college-detail">
                <div class="college-detail-label">${caste_column}</div>
                <div>${college[caste_column.toLowerCase()]}</div>
            </div>
        `;
        }
    } else {
        if (formData.caste != 'OPEN' && formData.caste != 'EWS') {
            let caste_column = `G${formData.caste}`;
            card_content = card_content + `
            <div class="college-detail">
                <div class="college-detail-label">${caste_column}</div>
                <div>${college[caste_column.toLowerCase()]}</div>
            </div>
        `;
        }
    }

    if(formData.caste == 'EWS'){
        card_content = card_content + `
            <div class="college-detail">
                <div class="college-detail-label">EWS</div>
                <div>${college.ews}</div>
            </div>
        `;
    }

    if (formData.tfws) {
        card_content = card_content + `
            <div class="college-detail">
                <div class="college-detail-label">TFWS</div>
                <div>${college.tfws}</div>
            </div>
        `;
    }

    if (formData.specialReservation != 'No') {
        card_content = card_content + `
            <div class="college-detail">
                <div class="college-detail-label">${formData.specialReservation}</div>
                <div>${college[formData.specialReservation.toLowerCase()]}</div>
            </div>
        `;
    }

    card.innerHTML = card_content + `
        </div>
    `;

    card.addEventListener('click', function (e) {
        if (e.target.type !== 'checkbox') {
            const checkbox = this.querySelector('.card-checkbox');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);
            updateSelectedCount();
        }
    });

    const checkbox = card.querySelector('.card-checkbox');
    checkbox.addEventListener('change', function () {
        card.classList.toggle('selected', this.checked);
        updateSelectedCount();
    });

    return card;
}

function updateSelectedCount(count) {
    if (typeof count === 'number') {
        selectedCountElement.textContent = `${count} selected`;
    } else {
        const selectedCount = document.querySelectorAll('.college-card.selected').length;
        selectedCountElement.textContent = `${selectedCount} selected`;
    }
}

// Initialization
document.addEventListener("DOMContentLoaded", initialize());

async function initialize() {
    await fetchBranches();
    await fetchCity();
    await fetchUniversity();
}

// fetching branches
async function fetchBranches() {
    try {
        const response = await fetch('/collegePredictorPCM/fetchBranches');
        let data = await response.json();

        const optionsHolder = document.getElementById('branch');
        optionsHolder.innerHTML = '<option value="" disabled selected>Select branches</option>';

        data = data.reduce((acc, curr) => {
            if (!acc.some(item => item.branch_name === curr.branch_name)) {
                acc.push(curr);
            }
            return acc;
        }, []);

        data.forEach(element => {
            const option = document.createElement('option');
            option.value = `${element.branch_name}`;
            option.innerHTML = `${element.branch_name}`;

            optionsHolder.appendChild(option);
        });
    } catch (error) {
        console.log(error);
    }
}

// fetching city
async function fetchCity() {
    try {
        const response = await fetch('/collegePredictorPCM/fetchcity');
        const data = await response.json();

        const cityholder = document.getElementById('regionCheckboxGroup');
        cityholder.innerHTML = `
            <label class="checkbox-label">
                <input type="checkbox" name="region" value="All" checked>
                <span>All Regions</span>
            </label>
        `;

        data.forEach(element => {
            const child = document.createElement('label');
            child.classList.add('checkbox-label');

            child.innerHTML = `
                <input type="checkbox" name="region" value="${element.city}" >
                <span>${element.city}</span>
            `;

            cityholder.appendChild(child);
        });

    } catch (error) {
        console.log(error);
    }
}

// Home university
async function fetchUniversity() {
    try {
        const response = await fetch('/collegePredictorPCM/fetchUniversity');
        const data = await response.json();

        homeuniversitySelect.innerHTML = `<option value="" disabled selected>Select your home university</option>`;

        data.forEach(element => {
            const option = document.createElement('option');
            option.value = `${element.university}`;
            option.innerHTML = `${element.university}`;
            homeuniversitySelect.appendChild(option);
        });

    } catch (error) {
        console.log(error);
    }
}

// PDF Generation Functions
function generatePdfList() {
    const pdfTableBody = document.getElementById('pdfTableBody');
    const pdfHead = document.getElementById('pdfHead');

    if (!currentCollegeData || currentCollegeData.length === 0) {
        return;
    }

    let pdfHeadContent = `<tr>  
                        <th>No.</th>
                        <th>Choice code</th>
                        <th>College Name</th>
                        <th>Branch</th>
                        <th>GOPEN</th>`;
    
    if(currentFormData.gender == 'Female' && currentFormData.caste == 'OPEN'){
        pdfHeadContent+= '<th>LOPEN</th>';
    }
    
    if(currentFormData.caste == 'EWS'){
        pdfHeadContent+= '<th>EWS</th>';
    }
    
    if(currentFormData.caste != 'OPEN' && currentFormData.caste != 'EWS'){
        if(currentFormData.gender == 'Female'){
            pdfHeadContent+= `<th>L${currentFormData.caste}</th>`;
        }else{
            pdfHeadContent+= `<th>G${currentFormData.caste}</th>`;
        }
    }

    if(currentFormData.tfws) {
        pdfHeadContent += '<th>TFWS</th>';
    }

    pdfHeadContent += '</tr>'; 
    pdfHead.innerHTML = pdfHeadContent;
   
    pdfTableBody.innerHTML = '';
    let index = 1;
    
    currentCollegeData.forEach((college) => {
        const row = document.createElement('tr');
        let rowContent = `
            <td>${index}</td>
            <td>${college.choice_code}</td>
            <td>${college.college_name}</td>
            <td>${college.branch_name}</td>
            <td>${college.gopen}</td>
        `;
        
        if(currentFormData.gender == 'Female' && currentFormData.caste == 'OPEN'){
            rowContent += `<td>${college.lopen}</td>`;
        }
        
        if(currentFormData.caste == 'EWS'){
            rowContent += `<td>${college.ews}</td>`;
        }
        
        if(currentFormData.caste != 'OPEN' && currentFormData.caste != 'EWS'){
            if(currentFormData.gender == 'Female'){
                let caste = `l${currentFormData.caste}`;
                rowContent += `<td>${college[caste.toLowerCase()]}</td>`;
            }else{
                let caste = `g${currentFormData.caste}`;
                rowContent += `<td>${college[caste.toLowerCase()]}</td>`;
            }
        }

        if(currentFormData.tfws) {
            rowContent += `<td>${college.tfws}</td>`;
        }

        row.innerHTML = rowContent;
        index++;
        pdfTableBody.appendChild(row);
    });
}

function generatePDF() {
    if (!currentCollegeData || currentCollegeData.length === 0) {
        showToast('No college data available to download', 'warning');
        return;
    }

    try {
        // Show loading toast
        showToast('Generating PDF...', 'info', 2000);

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Add title
        doc.setFontSize(20);
        doc.setTextColor(26, 58, 143);
        doc.text('EngiMate - College Predictions', 14, 20);

        // Add generation info
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const currentDate = new Date().toLocaleDateString();
        doc.text(`Generated on: ${currentDate}`, 14, 30);
        doc.text(`Total Colleges: ${currentCollegeData.length}`, 14, 36);

        // Add search criteria
        let currentY = 42;
        doc.setFontSize(10);
        
        if (currentFormData.percentile) {
            doc.text(`MHT-CET Percentile: ${currentFormData.percentile}`, 14, currentY);
            currentY += 6;
        }
        if (currentFormData.caste) {
            doc.text(`Category: ${currentFormData.caste}`, 14, currentY);
            currentY += 6;
        }
        if (currentFormData.gender) {
            doc.text(`Gender: ${currentFormData.gender}`, 14, currentY);
            currentY += 6;
        }
        if (currentFormData.homeuniversity) {
            const universityText = doc.splitTextToSize(`Home University: ${currentFormData.homeuniversity}`, 270);
            doc.text(universityText, 14, currentY);
            currentY += universityText.length * 6;
        }

        // TFWS
        const tfwsText = currentFormData.tfws ? 'TFWS: Yes' : 'TFWS: No';
        doc.text(tfwsText, 14, currentY);
        currentY += 10;

        // Add table
        const table = document.getElementById('pdfTable');
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);
        const rows = Array.from(table.querySelectorAll('tr')).map(tr =>
            Array.from(tr.querySelectorAll('td')).map(td => td.textContent)
        ).filter(row => row.length);

        doc.autoTable({
            head: [headers],
            body: rows,
            startY: currentY,
            styles: {
                fontSize: 8,
                cellPadding: 3,
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: [26, 58, 143],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240]
            },
            margin: { left: 14 }
        });

        // Save the PDF
        const fileName = `EngiMate_College_Predictions_${currentDate.replace(/\//g, '-')}.pdf`;
        doc.save(fileName);
        
        // Show success toast
        showToast('PDF downloaded successfully!', 'success');

    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('Error generating PDF. Please try again.', 'error');
    }
}