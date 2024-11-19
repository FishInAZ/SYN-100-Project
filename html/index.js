// Function to open the create room modal
function openModal() {
    document.getElementById("createRoomModal").style.display = "block";
}

// Function to close the create room modal
function closeModal() {
    document.getElementById("createRoomModal").style.display = "none";
}

// Function to open the info modal
function openInfoModal() {
    document.getElementById("infoModal").style.display = "block";
}

// Function to close the info modal
function closeInfoModal() {
    document.getElementById("infoModal").style.display = "none";
}

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
    const infoModal = document.getElementById("infoModal");
    const createRoomModal = document.getElementById("createRoomModal");
    if (event.target == infoModal) {
        infoModal.style.display = "none";
    }
    if (event.target == createRoomModal) {
        createRoomModal.style.display = "none";
    }
}

// Function to navigate to table.html
function navigateToTable() {
    window.location.href = "table.html";
}
