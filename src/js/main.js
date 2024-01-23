import Swiper from 'swiper';
import { Pagination, EffectFade } from 'swiper/modules';

const swiper = new Swiper('.swiper', {
  modules: [Pagination, EffectFade],
  loop: true,
  // effect: "fade",
  pagination: {
    el: '.swiper-pagination',
  },
});


document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger__wrapper');
  const burgerLines = burger.querySelector('.burger');
  const navbar = document.querySelector('.navbar');

  burger.addEventListener('click', () => {
    burgerLines.classList.toggle('burger--active');
    navbar.classList.toggle('navbar--active')
  })
})
