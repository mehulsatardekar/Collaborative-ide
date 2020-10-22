
 let nav = document.getElementById("nav");
 let nav_a = document.getElementById("nav-a");
 let nav_btn = document.getElementById("nav-btn");

 window.onscroll =()=>{
     if(document.body.scrollTop >= 100 || document.documentElement.scrollTop >=100) {
         nav.classList.add("bg-light")
         nav.classList.add("sticky-top")
         nav_a.classList.remove("d-none")
         nav_btn.classList.remove("d-none")

     }
     else{
        nav.classList.remove("bg-light")
        nav.classList.remove("sticky-top")
        nav_a.classList.remove("text-white")
        nav_a.classList.add("d-none")
        nav_btn.classList.add("d-none")

     }
 }
