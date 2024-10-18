/* Roberta di Camerino - Main controller */
var swiperH =null;
var menu_is_open = false;

function navbtn(){
    let btn  = document.querySelectorAll('.h-btn');
    let rem  = (1.4 *16); 
    let divw= 150/2;
    let ofs  = [3,5,4,4,6];
    let  ofs_len = ofs.length;
    btn.forEach((ele,i)=>{
        let Width = rem*ofs[i%ofs_len]/2.;
        ele.children[2].style.marginLeft = `-${divw-28}px`;
    });

}

function menu_open(){
    var modal = document.getElementById("ModalMenu");
    modal.style.display = "block";
    var modalopen = document.getElementById("ModalOpen");
    modalopen.style.display = "none";
    menu_is_open = true;
}


function menu_close(){
    if( !menu_is_open ){
        return;
    }
    var modal = document.getElementById("ModalMenu");
    modal.style.display = "none";
    var modalopen = document.getElementById("ModalOpen");
    modalopen.style.display = "block";
    menu_is_open = false;
}


function WindowSize() {
    if(window.innerWidth > 1250){
        menu_close();
    }
}

window.onresize = WindowSize;
navbtn();

function menu_func(e,name){
    e.preventDefault();
    switch(name){
        case 'home':{
            swiperH.slideTo(3);
            break;
        }
        case 'days':{
            swiperH.slideTo(3);
            break;
        }
        case 'info':{
            swiperH.slideTo(1);
            break;
        }
        case 'access':{
            swiperH.slideTo(0);
            break;
        }
        case 'email':{
            swiperH.slideTo(2);
            break;
        }
    }
    activateBtn(e);
    menu_close();
}




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
                mousewheelControl: false,
                freeMode: true,
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

        swiperH = new Swiper('.myswiper', {
            direction: 'vertical',
            loop: true,
            speed: 800, 
            allowTouchMove:false,
            noMousewheelClass:'swiper-slide',
            freeMode: false
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

