const form = document.querySelector('#user-form');
const modal = document.querySelector('#show-modal');
const closeModal = document.querySelector('#close-modal');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    openModal();
});

closeModal.onclick = function(){modal.style.display = "none"};

function openModal(){
    modal.style.display = "flex"
}