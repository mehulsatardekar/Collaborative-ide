var socket = io("http://localhost:7001");

var room = getParameterByName('room');
var user = getParameterByName('user');
document.getElementById("username").innerHTML = user;
document.getElementById("roomid").innerHTML= room;

let textbox1 = document.getElementById("textbox1");
let textbox2 = document.getElementById("textbox2");
let runCodebtn = document.getElementById("containers");

var myCodeMirror= CodeMirror.fromTextArea(document.getElementById("editor"),{
    lineNumbers: true,
    mode: "javascript",
    theme:"ayu-dark",
    autoCloseBrackets:true,
    styleActiveLine:true,
    lineWrapping:true,
    autofocus:true,
    scrollbarStyle: "simple"
    
});



$("#containers").on("click", function(){

  window.scrollBy(0, 400);
  textbox2.innerHTML="";
  textbox2.innerHTML="compiling";

  runCodebtn.classList.add("disabled");
  let language_selector = document.getElementById("language_selector");
  lang_value= language_selector.options[language_selector.selectedIndex].value;
  console.log(lang_value);
  
  $.post('/home', {data: myCodeMirror.getValue(), input:textbox1.value, lang_val:lang_value}, function (data) {
    //console.log(data);
   
    setTimeout(()=>{
      if(data.run_status["output"]===undefined){
        textbox2.innerHTML="";
        textbox2.append("Error \n");
        textbox2.append("JSON DATA: = \n " + JSON.stringify(data,null,'\t'));
        runCodebtn.classList.remove("disabled");

        }else{
          textbox2.innerHTML="";
          textbox2.append(data.run_status["output"]);
          textbox2.append("JSON DATA: = \n " + JSON.stringify(data,null,'\t'));
          runCodebtn.classList.remove("disabled");

        }
    },4000)
    
  });
  
 
});


myCodeMirror.setSize("100%","100%");

//socket active users





socket.on('activeuser',function(data){
  let user = document.getElementById('activeusers')
  console.log(data)
  user.innerText=data.description
})
        $.ajax({
            url: '/getData/' + room,
            success: function(result, status, xhr) {
                myCodeMirror.setValue(result.value);
                console.log(result);
            }
        });
        myCodeMirror.on('keyup', function () {
          var msg = {
              id: room,
              user: user,
              value: myCodeMirror.getValue()
          }
          socket.emit('document-update',msg);
      });

      socket.on('doc', function(msg){
          if(msg.new_val.id === room && msg.new_val.user != user) {
              var current_pos = myCodeMirror.getCursor();
              myCodeMirror.getDoc().setValue(msg.new_val.value);
              myCodeMirror.setCursor(current_pos);
          }
      });





// theme selector
var input = document.getElementById("select");
  function selectTheme() {
    var theme = input.options[input.selectedIndex].textContent;
    myCodeMirror.setOption("theme", theme);
    location.hash = "#" + theme;
  }
  var choice = (location.hash && location.hash.slice(1)) ||
               (document.location.search &&
                decodeURIComponent(document.location.search.slice(1)));
  if (choice) {
    input.value = choice;
    myCodeMirror.setOption("theme", choice);
  }
  CodeMirror.on(window, "hashchange", function() {
    var theme = location.hash.slice(1);
    if (theme) { input.value = theme; selectTheme(); }
  });

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
} 


jQuery(function(){
   
  
})
