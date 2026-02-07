const sun = document.querySelector(".fa-sun");
const soon = document.querySelector(".fa-moon");
const body = document.querySelector("body");

sun.addEventListener("click",()=>{
    body.classList.add("sun");
});
soon.addEventListener("click",()=>{
    body.classList.remove("sun");
})