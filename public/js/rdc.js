/* Roberta di Camerino - Main controller */

$(document).ready(function () {


    // Closes the Responsive Menu on Menu Item Click
        $('.navbar-collapse ul li a').click(function() {
            if ($(this).attr('class') != 'dropdown-toggle active' && $(this).attr('class') != 'dropdown-toggle') {
                $('.navbar-toggle:visible').click();
            }
        });
    
        $( "#about" ).load( "resources/about.html", function(){
    
            var swiperAbout = new Swiper('.swiper-container-about', {
                scrollbar: '.swiper-scrollbar',
                direction: 'vertical',
                slidesPerView: 'auto',
                mousewheelControl: true,
                freeMode: true
            });
    
        });
        $( "#contacts" ).load( "resources/contacts.html");
        $( "#lookbook" ).load( "resources/lookbook.html" );
       
        $( "#news" ).load( "resources/news.html" , function(){
    
            var swiperNews = new Swiper('.swiper-container-news', {
                scrollbar: '.swiper-scrollbar',
                direction: 'vertical',
                slidesPerView: 'auto',
                mousewheelControl: true,
                freeMode: true
            });
    
        });
    
        /*
        var swiperH = new Swiper('.swiper', {
            //pagination: '.swiper-pagination-h',
            //paginationClickable: true,
           
            simulateTouch: false,
            initialSlide: 4,
            onlyExternal: true
        });
                const swiperH = new Swiper(".swiper", {
            initialSlide: 0,
            direction: 'vertical',
          });
        */

        const swiperH = new Swiper('.myswiper', {
            direction: 'vertical',
            loop: true,
            speed: 800, 
            //autoplay: {delay: 15000,},
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            }
        });
    
        $('#home-btn').on('click', function(e){
            //console.log(e.target.id);
            e.preventDefault();
            swiperH.slideTo(3);
            activateBtn(e);
            //swiperV.slideTo(1);
        });
    
    
        $('#news-btn').on('click', function(e){
            //console.log(e.target.id);
            e.preventDefault();
            swiperH.slideTo(1);
            activateBtn(e);
        });
    

        $('#about-btn').on('click', function(e){
            //console.log(e.target.id);
            e.preventDefault();
            swiperH.slideTo(1);
            activateBtn(e);
            //swiperV.slideTo(0);
        });
    
    
        $('#lookbook-btn').on('click', function(e){
           // console.log(e.target.id);
            e.preventDefault();
            swiperH.slideTo(0);
            activateBtn(e);
        });


        $('#contacts-btn').on('click', function(e){
            e.preventDefault();
            swiperH.slideTo(2);
            activateBtn(e);
        });
    

        $('#lookbook-btn-intro').on('click', function(e){
            // console.log(e.target.id);
            e.preventDefault();
            swiperH.slideTo(1);
            activateBtn(e);
        });

    
        $("[data-dismiss='modal']").on('click', function(e){
            $('.navbar-collapse ul li a').removeClass('active');
        });
    

    
    });
    
    function activateBtn(e){
        $('.navbar-collapse ul li a').removeClass('active');
        $(e.target).addClass('active');
    }

