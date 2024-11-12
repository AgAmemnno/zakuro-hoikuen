var $messages = $(".messages-content"),
  d,
  h,
  m;
var global_i = 0;
var global_msg = "";


$(window).load(function () {
  $messages.mCustomScrollbar();
  /*{
    advanced:{
      updateOnContentResize: true
    }
  });
  */
  setTimeout(function () {
    fakeMessage();
  }, 100);
});

function updateScrollbar() {
  $messages.mCustomScrollbar("update");
  setTimeout(function(){
        $messages.mCustomScrollbar("scrollTo","bottom");
    },1000);
}

function setDate() {
  d = new Date();
  if (m != d.getMinutes()) {
    m = d.getMinutes();
    $('<div class="timestamp">' + d.getHours() + ":" + m + "</div>").appendTo(
      $(".message:last")
    );
  }
}

function insertMessage() {
  msg = $(".message-input").val();
  if ($.trim(msg) == "") {
    return false;
  }
  $('<div class="message message-personal">' + msg + "</div>")
    .appendTo($(".mCSB_container"))
    .addClass("new");
  setDate();
  $(".message-input").val(null);
  updateScrollbar();
  setTimeout(function () {
    fakeMessage();
  }, 10 + Math.random() * 20);
}

$(".message-submit").click(function () {
  insertMessage();
});
function resetALL(){
    global_msg = "";
    global_i = 0;
    $(".message").each( function() {
        $(this).remove();
    });
    fakeMessage();
}
$(".message-reset").click(function () {
  resetALL();
});

$(window).on("keydown", function (e) {
  if (e.which == 13) {
    insertMessage();
    return false;
  }
});

var Fake = [
  "Hola como estas?",
  "That's awesome",
  "Codepen is a nice place to stay",
  "I think you're a nice person",
  "Why do you think that?",
  "Can you explain?",
  "Anyway I've gotta go now",
  "It was a pleasure chat with you",
  "Time to make a new codepen",
  "Bye",
  ":)"
];

// https://codepen.io/gcarino/pen/AaJBOo
var questions = [
    {
        id      :    -3,
        question:    "ご利用ありがとうございます。１０万円払ってください。",
        selector:    ["Yeh","No"],
        comments:    [],
        distination: [-3,-1]
    }, 
    {
        id      :    -2,
        question:    "お役に立てましたか？",
        selector:    ["Yeh","Hmm"],
        comments:    [],
        distination: [-3,-1]
    }, 
    {
        id      :    -1,
        question:    "ご質問内容を、メールか電話でお問い合わせください。",
        selector:    ["Mail","Tel"],
        comments:    ["mailを作成します。","電話番号は048-664-5054です。"],
        distination: []
    }, 
    {
        id      :    0,
        question:    "質問グループを選択してください.",
        selector:    ["園内", "就職", "Page"],
        comments:    ["保育園の日常業務に関すること","保育士採用情報","バグや不具合など",""],
        distination: [1, 2, 3]
    }, 
    {
        id      :    1,
        question:    "保育園のどのようなことですか？",
        selector:    ["欠席","災害対策","虐待防止","給食"],
        comments:    ["年中行事に関すること","給食など","小学校に関すること"],
        distination: [4, 5, 6,7]
    }, 
    {
      id      :    4,
      question:    "欠席に関しては、朝１０時までに電話で園にお知らせください。",
      selector:    ["さらに、ご質問がある方","リセット"],
      comments:    [],
      distination: [-1,-100]
  　}, 
    {
      id      :    5,
      question:    "災害対策として、月に一度避難訓練を実施しています。</br>また、避難所は園のお庭となっておりますが、状況によっては、別所公園に避難します。",
      selector:    ["さらに、ご質問がある方","リセット"],
      comments:    [],
      distination: [-1,-100]
  　}, 
    {
      id      :    6,
      question:    "虐待防止対策は、さいたま市の方針に沿って、当園のマニュアルが作成されています。</br>詳細に関しては、直接ご質問ください。",
      selector:    ["さらに、ご質問がある方","リセット"],
      comments:    [],
      distination: [-1,-100]
  　}, 
    {
      id      :    7,
      question:    "アレルギーをお持ちの方は、医師の診断書と共に報告してください。</br>給食は別途アレルギーに応じて、ご用意いたします。",
      selector:    ["さらに、ご質問がある方","リセット"],
      comments:    [],
      distination: [-1,-100]
  　}, 
    {
        id      :    2,
        question:    "保育士の募集は、現在行っておりません。</br>随時、募集を行いますので、ご検討ください。",
        selector:    ["さらに、ご質問がある方","リセット"],
        comments:    [],
        distination: [-1,-100]
    }, 

    {
        id      :    3,
        question:    "このページに関する不具合がございましたら、</br>保育園とは別に以下のいずれかからご報告願います。",
        selector:    ["Github","Mail"],
        comments:    ["直接コードを修正したい時","内容についてのご相談"],
        distination: [-200,-300]
    }

];
function getQu(i){
    return questions.find( d => {
    return d.id === i;
  });
};

  
var questionCounter = 0; //Tracks question number
var selections = []; //Array containing user choices
/*
mailto:kaz380@hotmail.co.jp?subject=お問い合わせ&amp;body=改行と%0d%0aスペース%20スペース%20スペース%3f
*/
function createQuestionElement(index) {
    var qElement = $('<div>', {
        class: 'message new'
    });
    var section = $('<section>');
    var radioButtons = createRadios(section,index);
    qElement.append(radioButtons);
    return qElement;
}
  

function radioClick(i,index,name){
    var el = document.getElementsByName(`${name}`);
    for(let j =0 ; j< el.length; j++){
        el[j].disabled = true;
    }
    var next_i = getQu(index).distination[i];
    if(next_i == -100){
      resetALL();
      return;
    }
    var info = getQu(index);
    global_msg += `${info.question}：：${info.selector[i]} <br>`;
    global_i = next_i;
    fakeMessage();
}
// Creates a list of the answer choices as radio inputs
function createRadios(radioList,index) {
    
    var item;
    var input = '';
    var q = getQu(index);
    var len = q.selector.length;
    var hascom =  q.comments.length == len;
    for (var i = 0; i < len; i++) {
        item = $('<div>');
        var id = index*10+i;
        var title = q.selector[i];
        var ID = `control_${id}`;
        
        if(index==-1){
            input = `<input type="radio" id="${ID}" name="select${index}" value=${i}" />`;
            if(i ==0){
                //input = `<label for="${ID}"><h2>${title}</h2><p><a href="mailto:info@example.com?subject=%96%e2%82%a2%8d%87%82%ed%82%b9&amp;body=%82%b2%8bL%93%fc%82%ad%82%be%82%b3%82%a2">メール</a></p></label>`;
                input = `<label for="${ID}"><h2>${title}</h2><p><a href="mailto:kaz3180@hotmail.co.jp">メール</a></p><p>${global_msg}</p></label>`;
            }else{
                input = `<label for="${ID}"><h2>${title}</h2><p>${q.comments[i]}</p></label>`;
            }
        }else if(index==3){
            input = `<input type="radio" id="${ID}" name="select${index}" value=${i}" />`;
            if(i==0){
              input = `<label for="${ID}"><h2>${title}</h2><p><a href="https://github.com/AgAmemnno/zakuro-hoikuen">link</a></p></label>`;
            }else if(i ==1){
              input = `<label for="${ID}"><h2>${title}</h2><p><a href="mailto:tiresimas@hotmail.com">メール</a></p></label>`;
            }
        }
        else{
            input = `<input type="radio" id="${ID}" name="select${index}" value=${i} onclick="radioClick(${i},${index},'select${index}')" />`;
            if(hascom){
                input += `<label for="${ID}"><h2>${title}</h2><p>${q.comments[i]}</p></label>`;
            }else{
                input += `<label for="${ID}"><h2>${title}</h2></label>`;
            }
        }
    
        item.append(input);
        radioList.append(item);
    }


    return radioList;
}
  
// Reads the user selection and pushes the value to an array
function choose() {
    selections[questionCounter] = +$('input[name="answer"]:checked').val();
}
  
  
// Computes score and returns a paragraph element to be displayed
function displayScore() {
var score = $('<p>',{id: 'question'});

var numCorrect = 0;
for (var i = 0; i < selections.length; i++) {
    if (selections[i] === questions[i].correctAnswer) {
    numCorrect++;
    }
}

score.append('You got ' + numCorrect + ' questions out of ' +
                questions.length + ' right!!!');
return score;
}

function fakeMessage() {
    if ($(".message-input").val() != "") {
      return false;
    }
    $(
      '<div class="message loading new"><div class="ball1"></div><div class="ball2"></div><div class="ball3"></div><figure class="avatar"><img src="img/logo.png" /></figure><span></span></div>'
    ).appendTo($(".mCSB_container"));
  
  
    updateScrollbar();
  
    setTimeout(function () {
      $(".loading").remove();
      if(global_i ==-100){
        return;
      }
      let q = createQuestionElement(global_i);
      $(
        '<div class="message new"><figure class="avatar"><img src="img/logo.png" /></figure>' +
         getQu(global_i).question +
        "</div>"
      )
        .appendTo($(".mCSB_container"))
        .addClass("new");
      setDate();
      updateScrollbar();
      q.appendTo($(".mCSB_container"));
    },  Math.random() * 20 );
}

function fakeMessage2() {
  if ($(".message-input").val() != "") {
    return false;
  }
  
  $(
    '<div class="message loading new"><div class="ball1"></div><div class="ball2"></div><div class="ball3"></div><figure class="avatar"><img src="resources/logo4.png" /></figure><span></span></div>'
  ).appendTo($(".mCSB_container"));


  updateScrollbar();

  setTimeout(function () {
    $(".loading").remove();
    $(
      '<div class="message new"><figure class="avatar"><img src="resources/logo4.png" /></figure>' +
        Fake[i] +
        "</div>"
    )
      .appendTo($(".mCSB_container"))
      .addClass("new");
    setDate();
    updateScrollbar();
    i++;
  },  Math.random() * 20 );
}