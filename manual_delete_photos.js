// Google Photos Select All Tool
// This script adds a "SELECT ALL" button to select all visible photos

// Selectors (same as delete tool)
const CHECKBOX_SELECTOR = '.ckGgle';
const DELETE_BUTTON_SELECTORS = {
    languageAgnosticDeleteButton: 'div[data-delete-origin] button',
    deleteButton: 'button[aria-label="Delete"]',
    confirmationButton: 'div[aria-modal="true"] > div > div > div > button:nth-of-type(2)'
};
const MAX_RETRIES = 1000;
const BUTTON_DELAY = 2000;

// Create and style the SELECT ALL button
function createSelectAllButton() {
    const button = document.createElement('button');
    button.textContent = 'SELECT ALL PHOTOS';
    button.id = 'select-all-photos-btn';
    
    // Style the button
    button.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 10000;
        background-color: #1a73e8;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 64px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
    `;
    
    // Add hover effect
    button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#1557b0';
        button.style.transform = 'translateY(-1px)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = '#1a73e8';
        button.style.transform = 'translateY(0)';
    });
    
    // Add click handler
    button.addEventListener('click', selectAllPhotos);
    
    return button;
}

// Create and style the DELETE button
function createDeleteButton() {
    const button = document.createElement('button');
    button.textContent = 'DELETE SELECTED';
    button.id = 'delete-selected-btn';
    
    // Style the button (red color)
    button.style.cssText = `
        position: fixed;
        top: 120px;
        left: 20px;
        z-index: 10000;
        background-color: #dc2626;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 64px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
    `;
    
    // Add hover effect
    button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#b91c1c';
        button.style.transform = 'translateY(-1px)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = '#dc2626';
        button.style.transform = 'translateY(0)';
    });
    
    // Add click handler
    button.addEventListener('click', deleteSelectedPhotos);
    
    return button;
}

// Function to select all photos
async function selectAllPhotos() {
    const button = document.getElementById('select-all-photos-btn');
    button.textContent = 'SELECTING...';
    button.disabled = true;
    
    console.log('[INFO] Starting photo selection...');
    
    let attemptCount = 1;
    let checkboxes;
    
    // Wait for checkboxes to load with retry mechanism
    do {
        checkboxes = document.querySelectorAll(CHECKBOX_SELECTOR);
        if (checkboxes.length <= 0) {
            await new Promise(r => setTimeout(r, 1000));
        }
    } while (checkboxes.length <= 0 && attemptCount++ < MAX_RETRIES);
    
    if (checkboxes.length <= 0) {
        console.log('[ERROR] No photos found to select.');
        button.textContent = 'NO PHOTOS FOUND';
        setTimeout(() => {
            button.textContent = 'SELECT ALL PHOTOS';
            button.disabled = false;
        }, 2000);
        return;
    }
    
    // Select all checkboxes
    checkboxes.forEach((checkbox) => {
        if (!checkbox.checked) {
            checkbox.click();
        }
    });
    
    console.log(`[SUCCESS] Selected ${checkboxes.length} photos`);
    
    // Update button text
    button.textContent = `✓ ${checkboxes.length} SELECTED`;
    setTimeout(() => {
        button.textContent = 'SELECT ALL PHOTOS';
        button.disabled = false;
    }, 3000);
}

// Function to delete selected photos
async function deleteSelectedPhotos() {
    const button = document.getElementById('delete-selected-btn');
    const originalText = button.textContent;
    
    
    button.textContent = 'DELETING...';
    button.disabled = true;
    console.log('[INFO] Starting deletion process');
    
    try {
        // Try to click the delete button (language agnostic first)
        let deleteButton;
        try {
            deleteButton = document.querySelector(DELETE_BUTTON_SELECTORS.languageAgnosticDeleteButton);
            if (!deleteButton) throw new Error('Language agnostic button not found');
            deleteButton.click();
            console.log('[INFO] Clicked language agnostic delete button');
        } catch {
            deleteButton = document.querySelector(DELETE_BUTTON_SELECTORS.deleteButton);
            if (!deleteButton) throw new Error('Delete button not found');
            deleteButton.click();
            console.log('[INFO] Clicked standard delete button');
        }
        
        // Wait for modal and click confirmation
        setTimeout(() => {
            const confirmButton = document.querySelector(DELETE_BUTTON_SELECTORS.confirmationButton);
            if (confirmButton) {
                confirmButton.click();
                console.log('[SUCCESS] Deletion confirmed');
                button.textContent = '✓ DELETED';
                button.style.backgroundColor = '#16a34a';
            } else {
                console.log('[ERROR] Confirmation button not found');
                button.textContent = 'CONFIRM FAILED';
                button.style.backgroundColor = '#ef4444';
            }
            
            // Reset button after 3 seconds
            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '#dc2626';
                button.disabled = false;
            }, 3000);
        }, BUTTON_DELAY);
        
    } catch (error) {
        console.log('[ERROR] Delete failed:', error.message);
        button.textContent = 'DELETE FAILED';
        button.style.backgroundColor = '#ef4444';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '#dc2626';
            button.disabled = false;
        }, 3000);
    }
}

// Initialize the tool
function init() {
    // Remove existing buttons if present
    const existingSelectButton = document.getElementById('select-all-photos-btn');
    const existingDeleteButton = document.getElementById('delete-selected-btn');
    if (existingSelectButton) {
        existingSelectButton.remove();
    }
    if (existingDeleteButton) {
        existingDeleteButton.remove();
    }
    
    // Create and add both buttons
    const selectButton = createSelectAllButton();
    const deleteButton = createDeleteButton();
    document.body.appendChild(selectButton);
    document.body.appendChild(deleteButton);
    
    console.log('[INFO] Google Photos Select & Delete tool loaded');
    console.log('[INFO] Click "SELECT ALL PHOTOS" to select all visible photos');
    console.log('[INFO] Click "DELETE SELECTED" to delete the selected photos');
}

// Run the initialization
init();