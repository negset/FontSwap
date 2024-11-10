document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main");
  const navHeight = window.getComputedStyle(document.querySelector("nav"))["height"];
  const footerHeight = window.getComputedStyle(document.querySelector("footer"))["height"];
  main.style.minHeight = `calc(100vh - ${navHeight} - ${footerHeight})`;

  const navbarBurger = document.querySelector(".navbar-burger");
  const burgerTarget = document.getElementById(navbarBurger.dataset.target);
  navbarBurger.onclick = () => {
    navbarBurger.classList.toggle("is-active");
    burgerTarget.classList.toggle("is-active");
  };
  main.onclick = () => {
    navbarBurger.classList.remove("is-active");
    burgerTarget.classList.remove("is-active");
  };
});