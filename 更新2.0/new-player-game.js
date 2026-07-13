(() => {
  const KEY = 'wealth-script-new-player-v1';
  const fresh = () => ({month:1,round:2,pos:1,stage:1,cash:10000,salary:8000,living:6300,passive:600,side:0,life:55,debt:0,assets:0,history:[],waiting:true,guided:true,transitioning:false,ended:false,streak:0,lastResult:'请先选择当前副业机会；完成后即可继续掷骰子。'});
  let G;
  try { G = {...fresh(), ...JSON.parse(localStorage.getItem(KEY)||'{}')}; } catch (_) { G=fresh(); }
  // 迁移早期预览存档：当首个事件还没有做出选择时，允许直接点击选项。
  if(G.month===1 && G.round===2 && (!G.history || G.history.length===0)) G.waiting=true;
  if(G.month>1 && G.guided===undefined) G.guided=false;
  if(!G.stage) G.stage=G.month>=7?4:G.month>=4?3:G.month>=2?2:1;
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const money=n=>'¥'+Math.round(n).toLocaleString('zh-CN');
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(G))}catch(_){}};
  const events=[
    {type:'🛠️ 副业机会',title:'朋友邀请你周末一起摆摊',desc:'比较前期投入和以后每月能增加的收入。',choices:[['✨ 小额尝试','支付 ¥300 · 每月收入 +¥200','约两个月回本',()=>{G.cash-=300;G.side+=200;G.life-=1}],['🚀 认真投入','支付 ¥1,000 · 每月收入 +¥500','收益更高，占用更多现金',()=>{G.cash-=1000;G.side+=500;G.life-=3}],['👋 这次不参加','不花钱 · 不增加收入','保留现金和周末时间',()=>{G.life+=1}]]},
    {type:'🛍️ 消费选择',title:'喜欢的电子产品正在限时促销',desc:'消费能改善当下体验，但会减少现金缓冲。',choices:[['🧾 理性购买','支付 ¥800','生活状态 +4',()=>{G.cash-=800;G.life+=4}],['💳 分期升级','获得更好的型号 · 新增负债 ¥2,000','生活状态 +7',()=>{G.debt+=2000;G.cash-=300;G.life+=7}],['🌿 暂时不买','现金不变','生活状态 −1',()=>{G.life-=1}]]},
    {type:'📚 成长机会',title:'公司提供一门职业技能课程',desc:'学习会占用现金和精力，但可能提高未来工资。',choices:[['📖 报名学习','支付 ¥600','下月工资 +¥300',()=>{G.cash-=600;G.salary+=300;G.life-=2}],['🏆 强化训练','支付 ¥1,500','下月工资 +¥700',()=>{G.cash-=1500;G.salary+=700;G.life-=4}],['稍后再说','不产生变化','保留当前节奏',()=>{}]]},
    {type:'💰 收入事件',title:'本月项目顺利完成',desc:'你获得了一笔额外奖励，可以储蓄或改善生活。',choices:[['🏦 存下奖金','现金 +¥1,200','增强现金缓冲',()=>{G.cash+=1200}],['🎉 奖励自己','现金 +¥500','生活状态 +6',()=>{G.cash+=500;G.life+=6}],['🌱 买入资产','资产 +¥1,200','每月被动收入 +¥20',()=>{G.assets+=1200;G.passive+=20}]]},
    {type:'🌱 投资机会',title:'发现一项小额稳健投资',desc:'投资会把现金转成资产，并可能带来持续收入。',choices:[['🌱 小额投入','现金 −¥1,000 · 资产 +¥1,000','每月被动收入 +¥35',()=>{G.cash-=1000;G.assets+=1000;G.passive+=35}],['📈 加大投入','现金 −¥3,000 · 资产 +¥3,000','每月被动收入 +¥120',()=>{G.cash-=3000;G.assets+=3000;G.passive+=120}],['先观察','不产生变化','没有投资风险',()=>{}]]},
    {type:'🏥 意外事件',title:'身体不适，需要休息和治疗',desc:'现金和生活状态会受到影响，保留缓冲很重要。',choices:[['🏥 及时治疗','支付 ¥900','生活状态 +3',()=>{G.cash-=900;G.life+=3}],['🛌 居家休息','支付 ¥200','生活状态 −3',()=>{G.cash-=200;G.life-=3}],['继续工作','现金不变','生活状态 −8',()=>{G.life-=8}]]},
    {type:'🎁 好运事件',title:'旧物转卖遇到了合适买家',desc:'一次意外的小收入到账了。',choices:[['💰 收下收入','现金 +¥800','无额外影响',()=>{G.cash+=800}],['🌱 用于投资','资产 +¥800','每月被动收入 +¥25',()=>{G.assets+=800;G.passive+=25}],['🤝 请朋友聚餐','现金 +¥300','生活状态 +5',()=>{G.cash+=300;G.life+=5}]]},
    {type:'🏕️ 生活选择',title:'周末有一个短途放松机会',desc:'平衡生活状态，也是在保护未来的赚钱能力。',choices:[['🏕️ 出发','支付 ¥500','生活状态 +7',()=>{G.cash-=500;G.life+=7}],['☕ 城市休息','支付 ¥120','生活状态 +3',()=>{G.cash-=120;G.life+=3}],['💼 继续副业','现金 +¥300','生活状态 −4',()=>{G.cash+=300;G.life-=4}]]},
    {type:'🚀 新的起点',title:'你重新审视了这个月的目标',desc:'选择更适合自己的财务节奏。',choices:[['💰 优先储蓄','现金 +¥300','生活状态 −1',()=>{G.cash+=300;G.life-=1}],['⚖️ 保持平衡','现金和状态不变','稳步前进',()=>{}],['🌈 优先体验','支付 ¥300','生活状态 +4',()=>{G.cash-=300;G.life+=4}]]}
  ];
  const style=document.createElement('style');style.textContent=`
  .mission{margin-bottom:12px;padding:14px 16px;display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;background:#edf4ef;border:1px solid #c9ddd2;border-radius:14px}.mission-icon{width:38px;height:38px;border-radius:12px;background:#315c4c;color:#fff;display:grid;place-items:center;font-size:20px}.mission b,.mission small{display:block}.mission small{margin-top:4px;color:#64716b;font-size:10px}.mission-score{font-weight:800;color:#315c4c}.mission-track{height:5px;background:#dce7e1;border-radius:9px;overflow:hidden;margin-top:7px}.mission-fill{height:100%;background:#d59a42;border-radius:9px;transition:width .45s ease}.feedback{position:fixed;left:50%;top:48%;z-index:100;min-width:230px;max-width:88vw;padding:18px 22px;border-radius:18px;background:#263a32;color:#fff;text-align:center;box-shadow:0 18px 55px rgba(20,35,28,.3);opacity:0;transform:translate(-50%,-30%) scale(.85);pointer-events:none}.feedback.show{animation:feedbackPop 1.65s ease forwards}.feedback strong{display:block;font-size:22px;margin-bottom:6px}.feedback small{color:#d9e8e1;line-height:1.5}@keyframes feedbackPop{0%{opacity:0;transform:translate(-50%,-25%) scale(.8)}15%,72%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-70%) scale(.96)}}.shake{animation:shake .35s ease}@keyframes shake{25%{transform:translateX(-5px)}50%{transform:translateX(5px)}75%{transform:translateX(-3px)}}.ending{position:fixed;inset:0;z-index:200;background:rgba(25,38,32,.65);display:grid;place-items:center;padding:18px}.ending-card{width:min(460px,100%);background:#fffdfa;border-radius:24px;padding:28px;text-align:center;box-shadow:0 25px 80px rgba(0,0,0,.25)}.ending-emoji{font-size:52px}.ending-card h2{margin:10px 0 6px}.ending-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:18px 0}.ending-stats div{background:#f4f2ec;border-radius:12px;padding:10px;font-size:11px}.ending-stats b{display:block;font-size:15px;margin-top:4px}.ending-card button{border:0;border-radius:12px;background:#315c4c;color:#fff;padding:11px 24px;font-weight:750}.stage-flash{position:fixed;inset:0;z-index:150;display:grid;place-items:center;pointer-events:none;background:rgba(49,92,76,.12);animation:stageFade 1.8s forwards}.stage-flash b{font-size:26px;color:#fff;background:#315c4c;padding:18px 25px;border-radius:18px;box-shadow:0 14px 35px rgba(20,40,30,.25)}@keyframes stageFade{0%{opacity:0}20%,70%{opacity:1}100%{opacity:0}}@media(max-width:800px){.mission{grid-template-columns:auto 1fr}.mission-score{grid-column:1/-1;text-align:right}.feedback{top:43%}}
  `;document.head.appendChild(style);
  $('.board').insertAdjacentHTML('beforebegin','<div class="mission"><div class="mission-icon">🎯</div><div><b>本月任务</b><small class="mission-copy"></small><div class="mission-track"><div class="mission-fill"></div></div></div><div class="mission-score"></div></div>');
  document.body.insertAdjacentHTML('beforeend','<div class="feedback"><strong></strong><small></small></div>');
  function totalIncome(){return G.salary+G.passive+G.side}
  function surplus(){return totalIncome()-G.living}
  function mission(){const phase=(G.month-1)%3;if(phase===0)return{copy:'让本月结余达到 ¥2,500',now:surplus(),target:2500,label:(surplus()>=2500?'完成':'差 '+money(2500-surplus()))};if(phase===1)return{copy:'把现金缓冲提高到 2 个月',now:G.cash,target:G.living*2,label:(G.cash>=G.living*2?'完成':'差 '+money(G.living*2-G.cash))};return{copy:'让被动收入达到必要支出的 25%',now:G.passive,target:G.living*.25,label:Math.round(G.passive/G.living*100)+'%'}}
  function render(){
    $('.mode').textContent=G.guided?'🌱 引导模式':'🎯 正常模式';
    $('.mode').style.background=G.guided?'#eaf3ed':'#f7ead5';
    $('.person b').textContent=`上班族 · 第 ${G.month} 个月`;
    $('.person small').textContent=`第${G.month}个月 · ${G.round}/5轮`;
    const stageNames=['','新手起步','资产启蒙','现金流成长','自由冲刺'];
    $('.race-title').textContent=`🐭 ${stageNames[G.stage]} · ${G.stage===1?'先学会让每月有结余':G.stage===2?'认识资产与负债':G.stage===3?'建立持续现金流':'让被动收入覆盖支出'}`;
    $('.fill').style.width=clamp(G.passive/G.living*100,3,100)+'%';
    $('.race small').textContent=`被动收入 ${money(G.passive)} / 必要支出 ${money(G.living)} · ${G.month<3?'稳健条件将在第 3 个月解锁':'现金缓冲 '+(G.cash/G.living).toFixed(1)+' 个月'}`;
    $('.cash').textContent=money(G.cash); $('.twocol .stat:first-child b').textContent=(surplus()>=0?'+':'')+money(surplus());
    $('.twocol .stat:last-child b').textContent=`${G.life} / 100`; $('.mood-head span:last-child').textContent=G.life>=70?'良好':G.life>=40?'正常':'疲惫'; $('.mood-fill').style.width=G.life+'%';
    $$('.island').forEach((x,i)=>x.classList.toggle('active',i===G.pos));
    $('.board .eyebrow').textContent=`本月人生路线 · 第${G.round}站`; $('.board h2').textContent=`小鼠正在「${$('.island.active small').textContent}」`; $('.island .mouse')?.remove(); $('.island.active').insertAdjacentHTML('beforeend','<i class="mouse">🐭</i>');
    const rows=$$('.simple-row b'); [totalIncome(),G.living,surplus(),G.debt].forEach((v,i)=>{rows[i].textContent=(i===2&&v>=0?'+':'')+money(v)});
    $('.locked').style.display=G.stage>=4?'none':''; $$('.unlock').forEach((x,i)=>{const on=G.stage>=i+2;x.style.opacity=on?'1':'.45';x.firstElementChild.textContent=on?'✓':i+2});
    $('.lesson h3').textContent=G.stage===1?'为什么先隐藏专业报表？':G.stage===2?'已解锁：资产与负债':'本阶段财务提示'; $('.lesson p').textContent=G.stage===1?'完成新手毕业任务后，将进入第 2 个月并解锁资产与负债。':G.stage===2?`资产是能保留价值或带来收入的东西；负债则需要未来偿还。你目前的净资产是 ${money(G.cash+G.assets-G.debt)}。`:`你的净资产为 ${money(G.cash+G.assets-G.debt)}，现金可覆盖 ${(G.cash/G.living).toFixed(1)} 个月必要支出。`;
    const m=mission();$('.mission b').textContent=G.guided?'新手毕业任务':'本月任务';$('.mission-copy').textContent=m.copy;$('.mission-score').textContent=m.label;$('.mission-fill').style.width=clamp(m.now/m.target*100,0,100)+'%';
    $('.result').textContent=G.lastResult; $('.roll').disabled=G.waiting||G.ended; $('.roll').textContent=G.ended?'本局已结束':G.waiting?'请先做选择':'🎲 掷骰子'; save();
  }
  function showEvent(e){
    $('.story-badge').textContent=e.type+' · 新手教学'; $('.story h1').textContent=e.title; $('.story p').textContent=e.desc; const box=$('.choices'); box.innerHTML='';
    e.choices.forEach((c,i)=>{const b=document.createElement('button');b.className='choice'+(i===0?' recommend':'');b.innerHTML=`<b>${c[0]}</b><small>${c[1]}</small><em>${c[2]}</em>`; b.onclick=()=>choose(c,e);box.appendChild(b)});
  }
  function choose(c,e){
    if(!G.waiting)return; const before={cash:G.cash,life:G.life,passive:G.passive,side:G.side,salary:G.salary,assets:G.assets,debt:G.debt}; c[3](); G.cash=Math.max(0,G.cash);G.life=clamp(G.life,0,100); G.waiting=false;
    const delta=G.cash-before.cash, income=(G.passive+G.side+G.salary)-(before.passive+before.side+before.salary); G.lastResult=`已选择「${c[0].replace(/^\S+\s*/,'')}」：现金 ${delta>=0?'+':''}${money(delta)}${income?`，每月收入 +${money(income)}`:''}，生活状态 ${G.life-before.life>=0?'+':''}${G.life-before.life}。`;
    G.history.push({month:G.month,event:e.title,choice:c[0]}); feedback(delta,income,G.life-before.life);if(G.stage===1&&mission().now>=mission().target)finishGuide();if(G.round>=5&&!G.transitioning)settleMonth(); render();checkEnd();
  }
  function finishGuide(){if(G.transitioning||$('.guide-complete'))return;G.transitioning=true;save();setTimeout(()=>{document.body.insertAdjacentHTML('beforeend',`<div class="ending guide-complete"><div class="ending-card"><div class="ending-emoji">🎓</div><h2>第一阶段完成</h2><p>你已经学会比较投入、每月收入和现金缓冲。领取毕业奖励后，将直接进入第 2 个月并解锁“资产与负债”。</p><div class="ending-stats"><div>毕业奖励<b>+¥1,000</b></div><div>下一阶段<b>资产启蒙</b></div><div>当前结余<b>${money(surplus())}</b></div><div>已解锁<b>财务简报</b></div></div><button id="continueGame">领取奖励并进入下一阶段</button></div></div>`);$('#continueGame').onclick=enterStageTwo},500)}
  function enterStageTwo(){G.cash+=1000;G.month=2;G.round=0;G.stage=2;G.guided=false;G.transitioning=false;G.waiting=false;G.lastResult='第二阶段已解锁：从现在开始，选择会同时影响现金、资产和负债。点击掷骰子开始第 2 个月。';$('.guide-complete')?.remove();$('.story-badge').textContent='🔓 新阶段 · 资产启蒙';$('.story h1').textContent='学会区分资产与负债';$('.story p').textContent='接下来遇到投资和消费时，除了看现金，还要观察它会留下资产，还是增加需要偿还的负债。';$('.choices').innerHTML='<button class="choice recommend" id="stageStart"><b>🎲 开始第 2 个月</b><small>资产与负债内容已解锁</small><em>继续你的人生剧本</em></button>';$('#stageStart').onclick=roll;render();stage(1)}
  function feedback(cash,income,life){const f=$('.feedback');f.classList.remove('show');void f.offsetWidth;f.querySelector('strong').textContent=cash>=0?`现金 +${money(cash)}`:`现金 −${money(Math.abs(cash))}`;f.querySelector('small').textContent=`${income?`每月收入 +${money(income)} · `:''}生活状态 ${life>=0?'+':''}${life}`;f.style.background=cash<0?'#8b4e49':'#263a32';f.classList.add('show');if(cash<0){$('.story').classList.add('shake');setTimeout(()=>$('.story').classList.remove('shake'),400)}}
  function settleMonth(){const finished=G.month,net=surplus(),m=mission();G.cash=Math.max(0,G.cash+net);G.life=clamp(G.life+(net>2000?1:net<0?-5:-1),0,100);G.streak=(m.now>=m.target)?G.streak+1:0;G.month++;G.round=0;if(G.month===4)G.stage=3;if(G.month===7)G.stage=4;G.lastResult=`第 ${finished} 个月结束：结余 ${net>=0?'+':''}${money(net)} 已计入现金。${m.now>=m.target?'本月任务完成！':'本月任务未完成，下月继续努力。'}${G.month===4?' 已解锁“现金流成长”阶段。':G.month===7?' 已解锁“自由冲刺”阶段。':''}`;if(finished%3===0)stage(finished)}
  function stage(month){const d=document.createElement('div');d.className='stage-flash';d.innerHTML=`<b>🏁 完成第 ${month} 个月 · 新阶段解锁</b>`;document.body.appendChild(d);setTimeout(()=>d.remove(),1900)}
  function checkEnd(){if(G.ended)return;let title='',emoji='',desc='';if(G.life<=0){title='精疲力竭';emoji='🌧️';desc='你把赚钱放在了生活之前。休息并重新安排节奏，再试一次。'}else if(G.debt>G.cash+G.assets+30000){title='债务失控';emoji='🧯';desc='负债已经超过安全范围。下一局试着先建立现金缓冲。'}else if(G.passive>=G.living&&G.cash>=G.living*3){title='提前实现财务自由';emoji='🏆';desc='被动收入覆盖了必要支出，你不再必须依赖工资生活。'}else if(G.month>12){const score=Math.round((G.cash+G.assets-G.debt)/1000+G.passive/50+G.life);emoji=score>=220?'🌟':score>=140?'🌿':'📖';title=score>=220?'自由生活设计师':score>=140?'稳健成长者':'重新出发的人';desc=`十二个月的人生剧本已经写完。你的综合得分是 ${score}。`}if(title)ending(title,emoji,desc)}
  function ending(title,emoji,desc){G.ended=true;render();document.body.insertAdjacentHTML('beforeend',`<div class="ending"><div class="ending-card"><div class="ending-emoji">${emoji}</div><h2>${title}</h2><p>${desc}</p><div class="ending-stats"><div>净资产<b>${money(G.cash+G.assets-G.debt)}</b></div><div>每月结余<b>${money(surplus())}</b></div><div>被动收入<b>${money(G.passive)}</b></div><div>生活状态<b>${G.life}/100</b></div></div><button id="restartGame">再写一次人生</button></div></div>`);$('#restartGame').onclick=()=>{G=fresh();$('.ending').remove();showEvent(events[G.pos]);render()}}
  function roll(){if(G.waiting)return;G.round++;const n=1+Math.floor(Math.random()*6);G.pos=(G.pos+n)%9;G.waiting=true;$('.roll').textContent=`🎲 ${n}`;$('.roll').classList.add('rolling');setTimeout(()=>{$('.roll').classList.remove('rolling');showEvent(events[G.pos]);render()},420)}
  $('.roll').onclick=roll;
  $('.mode').title='双击可重新开始'; $('.mode').ondblclick=()=>{if(confirm('要清除当前进度并重新开始吗？')){G=fresh();showEvent(events[G.pos]);render()}};
  showEvent(events[G.pos]);
  if(G.stage===1&&mission().now>=mission().target)finishGuide();
  render();
})();
