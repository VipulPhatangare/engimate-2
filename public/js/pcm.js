
// Initialize College Swiper
const collegeSwiper = new Swiper(".collegeSwiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    breakpoints: {
        640: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        },
    },
});

document.addEventListener('DOMContentLoaded', async function () {
  await collegeNames();
});


let colleges = [];

async function collegeNames() {
    try {
        const response = await fetch('/pcm/collegeNames');
        colleges = await response.json();
    } catch (error) {
        console.log(error);
    }
}

const searchInput = document.getElementById('collegeSearch');
const searchResults = document.getElementById('searchResults');

searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    searchResults.innerHTML = '';
    
    if (searchTerm.length < 2) {
        searchResults.style.display = 'none';
        return;
    }
    
    const filteredColleges = colleges.filter(college => 
        college.college_name.toLowerCase().includes(searchTerm)
    );
    
    if (filteredColleges.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No colleges found</div>';
        searchResults.style.display = 'block';
        return;
    }
    
    filteredColleges.forEach(college => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <div class="college-name">${college.college_name}</div>
        `;
        resultItem.addEventListener('click', () => {
            viewCollegeDetails(college.college_code);
        });
        searchResults.appendChild(resultItem);
    });
    
    searchResults.style.display = 'block';
});

// Close search results when clicking outside
document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
    }
});

// Show results when search input is focused
searchInput.addEventListener('focus', function() {
    if (this.value.length >= 2 && searchResults.children.length > 0) {
        searchResults.style.display = 'block';
    }
});

// Note: Updates banner functionality removed as the HTML elements don't exist
// If you need updates banner, add the required HTML elements and uncomment below:
/*
// Auto-scrolling updates with infinite loop
let currentUpdate = 0;
const updateItems = document.querySelectorAll('.update-item');
const updatesTrack = document.querySelector('.updates-track');
const totalUpdates = updateItems.length - 1;
const updateWidth = 100;
let isTransitioning = false;

function scrollToNextUpdate() {
    if (isTransitioning || !updatesTrack) return;
    
    currentUpdate++;
    updatesTrack.style.transition = 'transform 0.5s ease';
    updatesTrack.style.transform = `translateX(-${currentUpdate * updateWidth}%)`;
    isTransitioning = true;
    
    if (currentUpdate === totalUpdates) {
        setTimeout(() => {
            updatesTrack.style.transition = 'none';
            currentUpdate = 0;
            updatesTrack.style.transform = `translateX(0)`;
            setTimeout(() => {
                isTransitioning = false;
            }, 50);
        }, 500);
    } else {
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }
}

let updateInterval = setInterval(scrollToNextUpdate, 5000);

if (updatesTrack) {
    updatesTrack.addEventListener('mouseenter', () => {
        clearInterval(updateInterval);
    });

    updatesTrack.addEventListener('mouseleave', () => {
        updateInterval = setInterval(scrollToNextUpdate, 5000);
    });

    let touchStartX = 0;
    let touchEndX = 0;

    updatesTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(updateInterval);
    });

    updatesTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        updateInterval = setInterval(scrollToNextUpdate, 5000);
    });

    function handleSwipe() {
        const threshold = 50;
        
        if (touchStartX - touchEndX > threshold) {
            scrollToNextUpdate();
        } else if (touchEndX - touchStartX > threshold) {
            if (currentUpdate > 0) {
                currentUpdate--;
                updatesTrack.style.transform = `translateX(-${currentUpdate * updateWidth}%)`;
            }
        }
    }
}
*/

document.getElementById('branchCutoffs').addEventListener('click',()=>{
    window.location.href = '/pcm/branchCutoffs';
});

// Note: percentilePredictor button removed from HTML, so commenting out the event listener
/*
document.getElementById('percentilePredictor').addEventListener('click',()=>{
    window.location.href = '/pcm/percentilePredictor';
});
*/

document.getElementById('topCollgesPCM').addEventListener('click',()=>{
    window.location.href = '/pcm/topCollegePCM';
});

// Note: Logout functionality removed along with sidebar
// If you need logout functionality, add a logout button to your HTML and uncomment below:
/*
document.getElementById('logout').addEventListener('click',async ()=>{
    try {
        const response = await fetch('/pcm/logout');
        const data = await response.json();

        if(data.islogout){
            window.location.href = '/';
        }else{
            console.log(data.msg);
        }
    } catch (error) {
        console.log(error);
    }
});
*/

document.getElementById('collegePredictorPCM').addEventListener('click',()=>{
    window.location.href = '/pcm/collegePredictorPCM';
});

document.getElementById('preferenceListPCM').addEventListener('click',()=>{
    window.location.href = '/prefernceListPCM';
});



// View College Details
async function viewCollegeDetails(id) {
    window.location.href = `/collegePagePCM/${id}`;
}

// Payment Modal Functions
let selectedPlan = null;

function openPaymentModal() {
    document.getElementById('paymentModal').style.display = 'flex';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function selectPlan(planType) {
    selectedPlan = planType;
    const basicPlan = document.getElementById('basicPlan');
    const premiumPlan = document.getElementById('premiumPlan');
    
    if (planType === 'basic') {
        basicPlan.classList.add('selected');
        premiumPlan.classList.remove('selected');
    } else {
        premiumPlan.classList.add('selected');
        basicPlan.classList.remove('selected');
    }
}

function proceedToPayment() {
    if (!selectedPlan) {
        alert('Please select a plan first');
        return;
    }
    
    const planName = selectedPlan === 'basic' ? 'Basic Plan (₹500)' : 'Premium Plan (₹1000)';
    alert(`Redirecting to payment gateway for ${planName}`);
    // In actual implementation, this would redirect to payment gateway
    // window.location.href = `/payment?plan=${selectedPlan}`;
}

// Note: Mobile menu toggle removed as the elements don't exist in current HTML structure
// If you need mobile navigation, add the required HTML elements and uncomment below:
/*
document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
        authButtons.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        authButtons.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        authButtons.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.backgroundColor = '#0a0a1a';
        navLinks.style.padding = '1rem';
        authButtons.style.position = 'absolute';
        authButtons.style.top = 'calc(100% + 150px)';
        authButtons.style.left = '0';
        authButtons.style.width = '100%';
        authButtons.style.backgroundColor = '#0a0a1a';
        authButtons.style.padding = '1rem';
        authButtons.style.gap = '1rem';
    }
});
*/

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('paymentModal');
    if (event.target === modal) {
        closePaymentModal();
    }
}

// Chatbot Functionality
class Chatbot {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.apiEndpoint = '/api/chat';
        this.isOpen = false;
        this.isTyping = false;
        this.storageKey = 'engimate_chat_history';
        
        this.initializeElements();
        this.bindEvents();
        this.loadChatHistory();
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    initializeElements() {
        this.popup = document.getElementById('chatbotPopup');
        this.icon = document.getElementById('chatIcon');
        this.closeBtn = document.getElementById('closeChatButton');
        this.messages = document.getElementById('chatMessages');
        this.input = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendButton');
        
        // For backward compatibility
        this.container = this.popup;
        this.window = this.popup;
    }
    
    bindEvents() {
        this.icon.addEventListener('click', () => this.toggleWindow());
        this.closeBtn.addEventListener('click', () => this.closeWindow());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Close chatbot when clicking outside (only on desktop)
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.popup.contains(e.target) && !this.icon.contains(e.target) && window.innerWidth > 480) {
                this.closeWindow();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Handle mobile swipe down to close (on mobile)
        if (window.innerWidth <= 480) {
            this.addMobileGestures();
        }
        
        // Re-check mobile gestures on resize
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 480) {
                this.addMobileGestures();
            }
        });
    }
    
    toggleWindow() {
        if (this.isOpen) {
            this.closeWindow();
        } else {
            this.openWindow();
        }
    }
    
    openWindow() {
        this.popup.classList.add('show');
        this.isOpen = true;
        
        // Focus input after animation completes
        setTimeout(() => {
            this.input.focus();
        }, 300);
        
        // Disable background scrolling when chat is open
        document.body.style.overflow = 'hidden';
    }

    closeWindow() {
        this.popup.classList.remove('show');
        this.isOpen = false;
        
        // Re-enable background scrolling when chat is closed
        document.body.style.overflow = '';
    }    handleResize() {
        if (this.isOpen) {
            // Always disable background scrolling when chat is open
            document.body.style.overflow = 'hidden';
        }
    }
    
    addMobileGestures() {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        const header = this.popup.querySelector('.chat-header');
        
        if (!header) {
            console.warn('Chat header not found for mobile gestures');
            return;
        }
        
        // Touch start
        header.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
        }, { passive: true });
        
        // Touch move
        header.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentY = e.touches[0].clientY;
            const diffY = currentY - startY;
            
            // Only allow downward swipes
            if (diffY > 0) {
                this.popup.style.transform = `translateY(${diffY}px)`;
                this.popup.style.transition = 'none';
            }
        }, { passive: true });
        
        // Touch end
        header.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const diffY = currentY - startY;
            isDragging = false;
            
            // Reset styles
            this.popup.style.transition = '';
            this.popup.style.transform = '';
            
            // Close if swiped down enough (more than 100px)
            if (diffY > 100) {
                this.closeWindow();
            }
        }, { passive: true });
    }
    
    async sendMessage() {
        const message = this.input.value.trim();
        if (!message || this.isTyping) return;
        
        // Disable input while processing
        this.input.disabled = true;
        this.sendBtn.disabled = true;
        
        // Add user message
        this.addMessage(message, 'user');
        this.input.value = '';
        
        // Show typing indicator
        this.showTyping();
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: this.sessionId
                })
            });
            
            const data = await response.json();
            
            // Hide typing indicator
            this.hideTyping();
            
            if (data.reply) {
                // Add a small delay before starting to type the response
                setTimeout(() => {
                    this.addMessage(data.reply, 'bot', true); // Enable typing effect for bot messages
                }, 500);
            } else {
                throw new Error('No reply received');
            }
            
        } catch (error) {
            console.error('Chat error:', error);
            this.hideTyping();
            setTimeout(() => {
                this.addMessage("I'm sorry, I'm having trouble connecting right now. Please try again later or contact support.", 'bot', true);
            }, 500);
        } finally {
            // Re-enable input after response is complete
            setTimeout(() => {
                this.input.disabled = false;
                this.sendBtn.disabled = false;
                this.input.focus();
            }, 1000);
        }
    }
    
    addMessage(text, sender, useTypingEffect = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.formatTime(new Date());
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        
        this.messages.appendChild(messageDiv);
        this.scrollToBottom();
        
        if (useTypingEffect && sender === 'bot') {
            this.typeMessage(contentDiv, text).then(() => {
                // Save chat history after typing animation completes
                this.saveChatHistory();
            });
        } else {
            // Format the message and set innerHTML directly (no wrapping <p> tag for lists)
            const formattedText = this.formatMessage(text);
            contentDiv.innerHTML = formattedText;
            // Save chat history immediately for user messages
            setTimeout(() => this.saveChatHistory(), 100);
        }
    }
    
    showTyping() {
        this.isTyping = true;
        this.sendBtn.disabled = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `
            <div class="typing-indicator">
                <span>EngiMate Assistant is typing</span>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        typingDiv.appendChild(contentDiv);
        this.messages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTyping() {
        this.isTyping = false;
        
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    formatMessage(text) {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #4a90e2; text-decoration: underline;">$1</a>');
        
        // Format bold text (**text** to <strong>text</strong>) - handle this first
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #4a90e2;">$1</strong>');
        
        // Handle italic formatting carefully to avoid bullet points
        // Split by lines to process each line separately
        const tempLines = text.split('\n');
        for (let i = 0; i < tempLines.length; i++) {
            const line = tempLines[i];
            // Only apply italic formatting if line doesn't start with "* " (bullet point)
            if (!line.trim().startsWith('* ')) {
                tempLines[i] = line.replace(/\*([^*\n]+)\*/g, '<em style="font-style: italic;">$1</em>');
            }
        }
        text = tempLines.join('\n');
        
        // Convert bullet points (* item) to proper list items
        const lines = text.split('\n');
        let formattedText = '';
        let inList = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check if line starts with bullet point
            if (line.startsWith('* ')) {
                if (!inList) {
                    formattedText += '<ul class="chat-list">';
                    inList = true;
                }
                const listItem = line.substring(2).trim(); // Remove '* ' prefix
                formattedText += `<li>${listItem}</li>`;
            } else {
                // Close list if we were in one
                if (inList) {
                    formattedText += '</ul>';
                    inList = false;
                }
                
                // Add regular line
                if (line) {
                    formattedText += line + '<br>';
                } else {
                    formattedText += '<br>';
                }
            }
        }
        
        // Close list if still open
        if (inList) {
            formattedText += '</ul>';
        }
        
        // Clean up multiple consecutive <br> tags
        formattedText = formattedText.replace(/(<br>\s*){3,}/g, '<br><br>');
        
        // Remove trailing <br>
        formattedText = formattedText.replace(/(<br>\s*)+$/, '');
        
        // Add word-break for long words on mobile
        if (window.innerWidth <= 480) {
            formattedText = `<div style="word-break: break-word; overflow-wrap: break-word;">${formattedText}</div>`;
        }
        
        return formattedText;
    }
    
    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.messages.scrollTop = this.messages.scrollHeight;
        }, 100);
    }

    // Persistence methods
    saveChatHistory() {
        try {
            const messages = Array.from(this.messages.children)
                .filter(msg => !msg.classList.contains('typing-indicator'))
                .map(msg => ({
                    content: msg.querySelector('.message-content')?.innerHTML || '',
                    sender: msg.classList.contains('user-message') ? 'user' : 'bot',
                    time: msg.querySelector('.message-time')?.textContent || ''
                }));
            
            localStorage.setItem(this.storageKey, JSON.stringify({
                messages: messages,
                sessionId: this.sessionId,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Failed to save chat history:', error);
        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) return;

            const data = JSON.parse(saved);
            
            // Only load if saved within last 24 hours
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem(this.storageKey);
                return;
            }

            // Restore session ID
            this.sessionId = data.sessionId || this.sessionId;

            // Clear existing messages and restore saved ones
            this.messages.innerHTML = '';
            
            data.messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.sender}-message`;
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'message-content';
                contentDiv.innerHTML = msg.content;
                
                const timeDiv = document.createElement('div');
                timeDiv.className = 'message-time';
                timeDiv.textContent = msg.time;
                
                messageDiv.appendChild(contentDiv);
                messageDiv.appendChild(timeDiv);
                this.messages.appendChild(messageDiv);
            });

            // Chat history restored without welcome message

        } catch (error) {
            console.warn('Failed to load chat history:', error);
            localStorage.removeItem(this.storageKey);
        }
    }

    clearChatHistory() {
        localStorage.removeItem(this.storageKey);
        this.messages.innerHTML = '';
        this.sessionId = this.generateSessionId();
        this.addMessage("Chat history cleared. How can I help you today?", 'bot', true);
    }

    typeMessage(container, text, speed = 50) {
        return new Promise((resolve) => {
            // Create a temporary div to hold the content
            const typingDiv = document.createElement('div');
            container.appendChild(typingDiv);
            
            // Create a cursor element
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            cursor.textContent = '|';
            typingDiv.appendChild(cursor);
            
            const formattedText = this.formatMessage(text);
            
            // Parse the text while maintaining formatting
            const words = text.split(' ');
            let currentText = '';
            let wordIndex = 0;
            
            const typeWord = () => {
                if (wordIndex < words.length) {
                    // Remove cursor temporarily
                    cursor.remove();
                    
                    // Add the next word
                    currentText += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
                    
                    // Update the div with formatted text
                    typingDiv.innerHTML = this.formatMessage(currentText);
                    
                    // Re-add cursor
                    cursor.textContent = '|';
                    typingDiv.appendChild(cursor);
                    
                    wordIndex++;
                    this.scrollToBottom();
                    
                    // Variable speed based on word length and punctuation
                    let delay = speed;
                    const lastChar = words[wordIndex - 1]?.slice(-1);
                    if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
                        delay = speed * 4; // Longer pause after sentences
                    } else if (lastChar === ',' || lastChar === ';' || lastChar === ':') {
                        delay = speed * 2.5; // Medium pause after commas/colons
                    } else if (words[wordIndex - 1]?.includes('\n')) {
                        delay = speed * 2; // Pause for line breaks
                    }
                    
                    setTimeout(typeWord, delay);
                } else {
                    // Remove cursor and finalize message with full formatting
                    cursor.remove();
                    typingDiv.innerHTML = formattedText;
                    this.scrollToBottom();
                    resolve();
                }
            };
            
            typeWord();
        });
    }
    
    getPartialFormattedText(fullFormattedText, charCount) {
        // Simple approach: get text up to charCount and preserve basic formatting
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = fullFormattedText;
        const fullText = tempDiv.textContent || tempDiv.innerText || '';
        
        if (charCount >= fullText.length) {
            return fullFormattedText;
        }
        
        // Return plain text up to charCount (for simplicity)
        return fullText.substring(0, charCount);
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new Chatbot();
});


