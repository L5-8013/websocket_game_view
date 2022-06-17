<!-- game -->
<script setup>
import { ref, onMounted, onUpdated, onUnmounted,computed,watch } from "vue";

import Toast from "vant/es/toast";
import "vant/es/toast/style";

import Popup from "vant/es/popup";
import "vant/es/popup/style";

import { useRoute,useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();


let show = ref(false);
let loseCode = ref('')

let codeNum = ref(route.query.code || 2);//第几人
let peopleNum = ref(route.query.actNum || 2);//游玩人数

let rotateCode = computed(()=>(codeNum.value-1)*(peopleNum.value>2?90:180));//旋转

let codeName = computed(()=>{
  let txt = '';
  switch (parseInt(codeNum.value)) {
    case 1:
      txt = '大雄'
      break;
    case 2:
      txt = '哆啦A梦'
      break;
    case 3:
      txt = '小夫'
      break;
    case 4:
      txt = '胖虎'
      break;
    default:
      break;
  }
  return txt
})

let speed = 2;
let stopIs = ref(false);
let time=null;

let locatIs = true;
let locat = ref(0);

let directionAll = peopleNum.value==2?['top','bottom']:['top','left','bottom','right'];
let chess = ref({x:2,y:2});//棋子
let direction = directionAll[codeNum.value-1];//当前用户的方向

let controlData = ref([1,1,1,1,1,1])//控制

let end =false;

const endGame = (data)=>{
  let obj = {
    code:0,
    txt:''
  }
  if(data.x<0){
    obj.code =3;
    obj.txt = '小夫失败，游戏结束！'
  }
  if(data.x>4){
    obj.code =1;
    obj.txt = '大雄失败，游戏结束！'
  }
  if(data.y>4){
    obj.code =2;
    obj.txt = '哆啦A梦失败，游戏结束！'
  }
  if(data.y<0){
    obj.code =4;
    obj.txt = '胖虎失败，游戏结束！'
  }
  return obj
}

const ws = new WebSocket("ws://192.168.30.244:5050/start");

ws.onopen =  async ()=> {
  console.log("链接成功");
  ws.send(JSON.stringify({
    start:true
  }))
}

ws.onmessage = async function (mes) {
  if(end)return
  let data = JSON.parse(mes.data);
  chess.value = data;
  if(data.x<0 || data.y<0 || data.x>4 || data.y>4){
    let obj = endGame(data);
    // console.log(data,obj)
    loseCode.value = obj.code;
    // Toast(obj.txt)
    show.value = true;
    end=true;
  }
  if (mes.data === "end") {
    ws.close();
  }
};


const getCode = (item)=>{
  return item<100?0:parseInt((item+10)/100);
}

const runGame = ()=>{
  controlData.value = controlData.value.sort(()=>Math.random() - 0.5);
  time = setInterval(()=>{
    if(locatIs){
      locat.value +=2
    }else{
      locat.value -=2
    }
  },speed)
}


let stoptd= false;
const stopclick = ()=>{
  if(stoptd)return;
  stoptd=true;
  if(!stopIs.value){
    runGame();
  }else{
    clearInterval(time);
    let code = getCode(locat.value);
    let obj = {
      bool:controlData.value[code],
      direction
    }
    ws.send(JSON.stringify(obj));
  }
  setTimeout(()=>{
    stoptd=false;
    stopIs.value=!stopIs.value;
  },500)
}



watch(locat,(newValue,oldValue)=>{
  if(newValue>600){
    locatIs=false;
  }
  if(newValue<0){
    locatIs=true;
  }
})
const unlink = ()=>{
  ws.send(JSON.stringify({
    close2:true
  }));
}
const outLogin = ()=>{
  console.log('关闭game')
  unlink();
  ws.close();
}
const returnPage =() =>{
  ws.send(JSON.stringify({
    end:true
  }));
  router.replace({
    path:'/home'
  })
}
onMounted(() => {
  // Toast('开始游戏')
});
onUpdated(() => {});
onUnmounted(() => {
  outLogin();
});
</script>

<template>
  <div class="page2">
    <div class="bt-txt">推炸弹游戏<br><span>当前角色：{{codeName}}</span></div>
    <div class="game-qipan">
      <div class="game-main" :style="{transform:`rotate(${rotateCode}deg)`}">
        <div class="item-code" v-for="(item,index) in 25" :key="index"></div>
        <div class="chess" :style="{top:`${chess.x}rem`,left:`${chess.y}rem`,transform:`rotate(-${rotateCode}deg)`}"></div>
      </div>
      <div class="game-user" :style="{transform:`rotate(${rotateCode}deg)`}">
        <div class="user user1" :style="{transform:`rotate(-${rotateCode}deg)`}"></div>
        <div class="user user2" v-if="peopleNum>2" :style="{transform:`rotate(-${rotateCode}deg)`}"></div>
        <div class="user user3" :style="{transform:`rotate(-${rotateCode}deg)`}"></div>
        <div class="user user4" v-if="peopleNum>2" :style="{transform:`rotate(-${rotateCode}deg)`}"></div>
      </div>
        
    </div>
    <div class="control">
      <div class="icon-pointer" :style="{left:`${locat/100}rem`}"></div>
      <div class="control-main">
        <div :class="['control-item',item?'active':'']" v-for="(item,index) in controlData" :key="index"></div>
      </div>
      <div class="btn" @click="stopclick()">{{stopIs?'停':'动'}}</div>
    </div>
  </div>
  <Popup v-model:show="show" class="pop-box" :close-on-click-overlay="false">
    <div class="pop-end">
      <p>{{loseCode == codeNum?'您输了':'您赢了！'}}</p>
      <div class="btn-return" @click="returnPage">返回准备页</div>
    </div>
  </Popup>
</template>

<style lang='scss'>
body{
  background-color: #183090;
}
.page2{
  position: relative;
  width: 100%;
  height: 100vh;
   @include gSetBg('../assets/images/bg.png');
  background-position: bottom;
  .bt-txt{
    width: 100%;
    font-size: 0.7rem;
    color: #fff;
    letter-spacing: 0.3rem;
    text-align: center;
    position: absolute;
    top: 1rem;
    left: 0;
    z-index: 9;
    span{
      font-size: 0.3rem;
      letter-spacing: 0.2rem;
    }
  }
  .game-qipan{
    width: 7rem;
    height: 6.97rem;
    @include gSetBg('../assets/images/qipan.png');
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    z-index: 10;
    .game-user{
      width: 5rem;
      height: 5rem;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -2.5rem;
      margin-top: -2.5rem;
      z-index: 9;
    }
    .user{
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      position: absolute;
      z-index: 15;
    }
    .user1{
      left: 50%;
      margin-left: -0.5rem;
      bottom: -1.1rem;
      @include gSetBg('../assets/images/1.jpeg');
    }
    .user2{
      top: 50%;
      margin-top: -0.5rem;
      right: -1.1rem;
      @include gSetBg('../assets/images/2.jpeg');
    }
    .user3{
      left: 50%;
      margin-left: -0.5rem;
      top: -1.1rem;
      @include gSetBg('../assets/images/3.jpeg');
    }
    .user4{
      top: 50%;
      margin-top: -0.5rem;
      left: -1.1rem;
      @include gSetBg('../assets/images/4.jpeg');
    }
  }
  .game-main{
    display: flex;
    width: 5rem;
    height: 5rem;
    margin: 0 auto;
    background-color: #000;
    flex-flow: wrap;
    border: 0.01rem solid #353a40;
    position: relative;
    overflow: hidden;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -2.5rem;
    margin-top: -2.5rem;
    z-index: 10;
    .item-code{
      width: 1rem;
      height: 1rem;
      @include gCenter();
      color: red;
      &:nth-child(2n+1){
        background: #fff;
      }
      &:nth-child(2n){
        background-color: #353a40;
      }
    }
    .chess{
      width: 1rem;
      height: 1rem;
      position: absolute;
      top: 2rem;
      left: 2rem;
      z-index: 10;
      transition: all 0.5s;
      @include gSetBg('../assets/images/icon.png');
      background-size: 100% 100%;
    }
  }
  .control{
    position: absolute;
    bottom: 0.5rem;
    width: 6rem;
    margin-left: -3rem;
    height: 2rem;
    left: 50%;
    z-index: 10;
    .icon-pointer{
      height: 0.5rem;
      width: 0.02rem;
      position: absolute;
      top: -0.2rem;
      left: 0;
      z-index: 100;
      background-color: red;
      // transition: all 0.1s;
    }
    .control-main{
      width: 100%;
      display: flex;
      align-items: center;
      .control-item{
        width: 1rem;
        height: 0.1rem;
        background-color: #cdcdcd;
        overflow: hidden;
        &.active{
          background-color:red;
        }
      }
    }
    .btn{
      width: 1.5rem;
      height: 1.5rem;
      background-color: red;
      border-radius: 50%;
      position: absolute;
      left: 50%;
      bottom: -0.1rem;
      margin-left: -.75rem;
      @include gCenter();
      font-size: 0.32rem;
      color: #fff;
      font-weight: bold;
    }
  }
}
.pop-box{
  background: none;
}
.pop-end{
  width: 5rem;
  p{
    font-size: 0.5rem;
    color: #fff;
    text-align: center;
  }
  .btn-return{
     width: 3rem;
      height: 0.8rem;
      @include gCenter();
      margin: 0 auto;
      margin-top: 0.5rem;
      background-color: #fff;
      color: #333;
      border-radius: 0.2rem;
  }
}

</style>