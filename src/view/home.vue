<!-- home -->
<script setup>
import { ref,onMounted, onUpdated,onBeforeMount, onUnmounted,watch } from "vue"
import { useRouter } from "vue-router";
import Popup from "vant/es/popup";
import "vant/es/popup/style";

import Loading from "vant/es/loading";
import "vant/es/loading/style";
import { Toast } from "vant/es";

const router = useRouter();

let show = ref(false);
let userData =ref([]);
let start = ref(false);
let code = ref('');

let headImg= [];
function getImageUrl(name) {
  return new URL(`../assets/images/${name}.jpeg`, import.meta.url).href
}
for (let i = 0; i < 4; i++) {
  const url = getImageUrl(i+1);
  headImg.push(url); 
}


const ws = new WebSocket("ws://192.168.30.244:5050/prepare");
 ws.onopen =  async ()=> {
  console.log("链接成功");
}

const gotoUrl = ()=>{
  router.replace({
    path:'/game',
    query:{
      code:code.value,
      actNum:userData.value.length
    }
  });
  ws.close();
}

const unlink = ()=>{
  ws.send(JSON.stringify({
    close:true
  }));
}

ws.onmessage = async (mes)=>{
  if(!show.value)return
  let data = JSON.parse(mes.data);
  console.log(data)
  if(data?.played){
    Toast('游戏已经开始了，下一局吧')
    show.value=false;
    return
  }

  if(data?.play && code.value){
    gotoUrl();
    return
  }

  if(data.links > 4 && !code.value){
    Toast('满员了')
    show.value=false;
    unlink();
  }else{
    if(data.links > 4)return
    code.value = code.value?code.value:data.links;
    // console.log(code.value)
    userData.value=[];
    for (let i = 0; i < data.links; i++) {
      userData.value.push(headImg[i]);
    }
  }
}

const prepareClick = () =>{
  show.value=true;
  ws.send(JSON.stringify({
    prepare:true
  }))
}
const popClose = ()=>{
  show.value=false;
  unlink();
  console.log('关闭弹窗了')
}

const playGame = ()=>{
  ws.send(JSON.stringify({
    play:true
  }));
}


watch(userData,(newValue,oldValue)=>{
  if((newValue.length ==4) && code.value == 1){
    start.value= true;
  }else{
    start.value=false;
  }
})


const outLogin = ()=>{
  if(!code.value)return
  unlink();
  ws.close();
}
 onMounted(() => {

 })
 onUpdated(() => {

 })
 onBeforeMount( () => {
  window.addEventListener('unload',outLogin )
  });
 onUnmounted(() => {
 })
</script>

<template>
  <div class='page1'>
    <div class="page-main">
      <h1>推炸弹游戏</h1>
      <div class="ps">游戏规则：把炸弹向前移，移到自己的对面去，您就赢了</div>
      <div class="btn" @click="prepareClick">快速匹配</div>
    </div>
  </div>
  <Popup v-model:show="show" class="pop-box" @click-overlay="popClose">
    <div class="pop-pp">
      <div class="user-box">
        <div class="user-item" v-for="(item,index) in userData" :key="index">
          <img :src="item" alt="" srcset="">
        </div>
      </div>
      <Loading class="center" color="#1989fa" size="24">{{start?'准备完成':'匹配中...'}}</Loading>
      <div class="btn center" v-show="start" @click="playGame">开始游戏</div>
    </div>
  </Popup>
</template>

<style lang='scss'>
// @include gSetLine();
.page1{
  width: 100%;
  height: 100vh;
  overflow: hidden;
  
  @include gSetBg('../assets/images/bg.png');
  background-position: bottom;
  position: relative;
  .page-main{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    z-index: 10;
    h1{
      color: #fff;
      text-align: center;
      letter-spacing: 0.05rem;
    }
    .ps{
      margin-top: 0.2rem;
      font-size: 0.24rem;
      color: #fff;
      width: 6rem;
      text-align: center;
    }
    .btn{
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
}
body .van-overlay{
  background-color: rgba(0, 0,0,0.9);
}
.pop-box{
  background: none;
  .pop-pp{
    width: 6rem;
    height: 5rem;
    .user-box{
      height: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
      .user-item{
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        overflow: hidden;
        margin: 0 0.1rem;
        border: 0.02rem solid yellow;
        img{
          display: block;
          width: 100%;
          height: 100%;
        }
      }
    }
    .btn{
      width: 3rem;
      height: 0.8rem;
      background-color: #fff;
      margin: 0 auto;
      border-radius: 0.1rem;
      margin-top: 0.6rem;
    }
  }
}

</style>