var $messages = $(".messages-content"),
  d,
  h,
  m;
var global_i = 0;
var global_msg = "";
console.log(273618273186, $messages);

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
  $messages.mCustomScrollbar("update").mCustomScrollbar("scrollTo", "bottom", {
    //scrollInertia: 10,
    timeout: 0
  });
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
  }, 1000 + Math.random() * 20 * 100);
}

$(".message-submit").click(function () {
  insertMessage();
});
$(".message-reset").click(function () {
    global_msg = "";
    global_i = 0;
    $(".message").each( function() {
        $(this).remove();
    });
    fakeMessage();
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
        question:    "ここでは、お答えできません。連絡してね。",
        selector:    ["Mail","Tel"],
        comments:    ["mailを作成します。","お電話での問い合わせは午前１０時ちょうどにしてください。"],
        distination: []
    }, 
    {
        id      :    0,
        question:    "質問グループを選択してください.",
        selector:    ["園内", "就職", "Page","その他"],
        comments:    ["保育園の日常業務に関すること","保育士採用情報","バグや不具合など",""],
        distination: [1, 2, 3, -1]
    }, 
    {
        id      :    1,
        question:    "保育園のどのようなことですか？",
        selector:    ["行事","生活","進路"],
        comments:    ["年中行事に関すること","給食など","小学校に関すること"],
        distination: [4, 5, 6]
    }, 
    {
        id      :    2,
        question:    "うんこのことですか？",
        selector:    ["保育士","給食","習い事"],
        comments:    ["保育士採用に関すること","栄養士採用に関すること","保育園で習い事を行いたい方"],
        distination: [7, 8, 9]
    }, 
    {
        id      :    3,
        question:    "おかしな動きがありましたか？",
        selector:    ["Design","Animation","Vulnerability"],
        comments:    ["デザインに関すること","動作に関すること","脆弱性に関すること"],
        distination: [10, 11, 12]
    }, 
    {
        id      :    4,
        question:    "行事について",
        selector:    ["春","夏","秋","冬"],
        comments:    ["笑い門","ドラえもん","どざえもん","もんもん"],
        distination: [-1,-2,-1,-1]
    }, 
    {
        id      :    5,
        question:    "生活のどんなことですか？",
        selector:    ["給食","自殺","恋愛"],
        comments:    ["もりもりたべなさい。","まだ死ぬことはないでしょう。","色気づくには早すぎます。"],
        distination: [-2, -1, -1]
    }, 
    {
        id      :    6,
        question:    "いまから進路の悩みですか？",
        selector:    ["小学校","中学校","高校","大学","政治家に立候補","野球界"],
        comments:    ["近所に行きましょう。","となりの中学校にはいかないように","少し遠くに行くでしょう","聖学院があります","立憲民主党にだまされるな","西武は消えてなくなるのか。"],
        distination: [-2, -2, -2,-2,-2,-2]
    }, 

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
  

function radioClick(i,index){
    var info = getQu(index);
    global_msg += `${info.question}：：${info.selector[i]} <br>`;
    global_i = getQu(index).distination[i];
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
        }else{
            input = `<input type="radio" id="${ID}" name="select${index}" value=${i} onclick="radioClick(${i},${index})" />`;
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
    }, 500 + Math.random() * 20 * 100);
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
  }, 2000 + Math.random() * 20 * 100);
}