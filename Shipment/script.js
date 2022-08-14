const userPressedCancelShip = document.querySelector('#user-cancel-shipment');
const modal = document.querySelector('#modal');
const userYes = document.querySelector('#user-press-yes');
const userNo = document.querySelector('#user-press-no');

const otherModal = document.querySelector('#after-modal');
const userClose = document.querySelector('#user-close');

userPressedCancelShip.addEventListener('click', (e) => {
    e.preventDefault();
    showModal();
});

userYes.onclick = function () {showOtherModal()}
userNo.onclick = function () {modal.style.display = "none"}
userClose.onclick = function () {otherModal.style.display = "none"}

function showModal(){
    modal.style.display = "flex";
}
function showOtherModal(){
    modal.style.display = "none";
    otherModal.style.display = "flex";
}