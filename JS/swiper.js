const swiper = new Swiper('.slide-swp', {
    pagination: {
        el: '.swiper-pagination',
        dynamicBullets: true,
        clickable: true,
    },
    autoplay: {
        delay: 2500,
    },
    loop: true,
});

  /* swiper slide products */

var swiper1 = new Swiper(".slide-product", {
slidesPerView: 5,
spaceBetween: 20,
navigation: {
    nextEl:".swiper-button-next",
    prevEl:".swiper-button-prev",
},
autoplay: {
    delay: 2500,
},
loop: true,
breakpoints:{
    1200:{
      slidesPerView : 5,
      spaceBetween: 20
    },
    1000:{
      slidesPerView : 4,
      spaceBetween: 20
    },
    700:{
      slidesPerView: 3 , 
      spaceBetween: 15 ,

    },
    0:{
      slidesPerView : 2,
      spaceBetween: 10
    }
  }

});