'use strict';
const KEY='pharmacy_quiz_web_v1';
const $=id=>document.getElementById(id);
let data=load(), activeId=null, current=0, draft={};
function load(){try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&o.version===1&&Array.isArray(o.quizzes))return o;}catch(e){}return {version:1,quizzes:[]};}
function save(){try{localStorage.setItem(KEY,JSON.stringify(data));return true;}catch(e){alert('Storage is full or not available. Please export a backup.');return false;}}
function toast(msg){$('toast').textContent=msg;$('toast').classList.remove('hidden');setTimeout(()=>$('toast').classList.add('hidden'),3500);}
function el(tag,props={},...children){const node=document.createElement(tag);for(const [k,v] of Object.entries(props)){if(k==='class')node.className=v;else if(k==='text')node.textContent=v;else if(k==='onclick')node.addEventListener('click',v);else node.setAttribute(k,v);}for(const c of children)node.append(c);return node;}
function quiz(){return data.quizzes.find(q=>q.id===activeId);}
function displayHome(){activeId=null;$('quizPage').classList.add('hidden');$('homePage').classList.remove('hidden');renderHome();window.scrollTo(0,0);}
function renderHome(){let list=$('testList');list.replaceChildren();if(!data.quizzes.length){list.append(el('p',{class:'muted',text:'No tests yet. Add Word documents to your GitHub quizzes folder or select Import Word for a private quiz.'}));return;}
 for(const q of [...data.quizzes].reverse()){const answers=q.answers||{},attempted=Object.keys(answers).length,correct=q.questions.filter((x,i)=>answers[i]&&same(answers[i],x.correct)).length;
 const card=el('div',{class:'test-card'},el('div',{class:'test-info'},el('strong',{text:q.title}),el('p',{class:'muted',text:q.source==='github'?'GitHub shared quiz':'Imported on this device'}),el('p',{text:`${q.questions.length} questions  •  ${attempted} attempted  •  ${correct} correct`})),el('button',{class:'button primary',text:attempted?'Continue':'Start Quiz',onclick:()=>startQuiz(q.id)}),...(q.source==='github'?[]:[el('button',{class:'button delete',text:'Delete',onclick:()=>deleteQuiz(q.id)})]));list.append(card);}}
function deleteQuiz(id){const q=data.quizzes.find(x=>x.id===id);if(!q)return;if(confirm(`Permanently delete "${q.title}" and all its answers?\n\nYour original Word document will not be deleted.`)){data.quizzes=data.quizzes.filter(x=>x.id!==id);save();renderHome();}}
function startQuiz(id){activeId=id;current=0;draft={};$('homePage').classList.add('hidden');$('quizPage').classList.remove('hidden');$('quizTitle').textContent=quiz().title;showQuestion();window.scrollTo(0,0);}
function same(a,b){return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every(x=>b.includes(x));}
function showQuestion(){const q=quiz(),item=q.questions[current],answered=q.answers&&q.answers[current],selected=answered||draft[current]||[];
 $('questionCount').textContent=`Question ${current+1} of ${q.questions.length}`;$('questionType').textContent=item.type==='SATA'?'SATA • Select all that apply':'MCQ • Select one';$('questionText').textContent=item.text;let options=$('answersForm');options.className='option-list';options.replaceChildren();
 for(const o of item.options){let input=el('input',{type:item.type==='SATA'?'checkbox':'radio',name:'answer',value:o.letter});input.checked=selected.includes(o.letter);input.disabled=!!answered;const label=el('label',{class:'option'+(input.checked?' selected':'')+(answered?' locked':'')+(answered&&item.correct.includes(o.letter)?' correct-option':'')+(answered&&selected.includes(o.letter)&&!item.correct.includes(o.letter)?' chosen-wrong':'' )},input,el('span',{},el('span',{class:'option-letter',text:o.letter+'. '}),document.createTextNode(o.text)));input.addEventListener('change',()=>{const picks=[...options.querySelectorAll('input:checked')].map(x=>x.value);draft[current]=picks;options.querySelectorAll('.option').forEach(l=>l.classList.toggle('selected',l.querySelector('input').checked));});options.append(label);}
 $('submitBtn').classList.toggle('hidden',!!answered);const feedback=$('feedback');feedback.replaceChildren();feedback.classList.toggle('hidden',!answered);
 if(answered){const correct=same(answered,item.correct);const title=el('div',{class:'result '+(correct?'good':'bad')},el('span',{class:'result-icon',text:correct?'✔':'✘'}),el('strong',{text:correct?'Correct!':'Incorrect'}));const answerLine=item.correct.map(letter=>{const opt=item.options.find(o=>o.letter===letter);return opt?`${letter}. ${opt.text}`:letter;}).join('  •  ');feedback.append(title,el('div',{class:'correct-line',text:`Correct answer${item.correct.length>1?'s':''}: ${answerLine}`}));if(item.explanation)feedback.append(el('div',{class:'explanation-label',text:'Explanation:'}),el('div',{class:'explanation',text:item.explanation}));}
 $('previousBtn').disabled=current===0;$('nextBtn').disabled=current===q.questions.length-1;renderSidebar();}
function renderSidebar(){const q=quiz(),answers=q.answers||{},attempted=Object.keys(answers).length,correct=q.questions.filter((x,i)=>answers[i]&&same(answers[i],x.correct)).length;
 $('stats').replaceChildren();for(const [name,n] of [['Total',q.questions.length],['Attempted',attempted],['Correct',correct],['Incorrect',attempted-correct],['Remaining',q.questions.length-attempted]])$('stats').append(el('div',{class:'stat-row'},el('span',{text:name+':'}),el('strong',{text:String(n)})));
 $('questionNav').replaceChildren();q.questions.forEach((item,i)=>{const result=answers[i]?same(answers[i],item.correct)?'good':'bad':'';$('questionNav').append(el('button',{class:'nav-button '+result+(i===current?' active':''),text:String(i+1)+(result==='good'?' ✓':result==='bad'?' ✕':''),title:`Question ${i+1}: ${result==='good'?'correct':result==='bad'?'incorrect':'not attempted'}`,onclick:()=>{current=i;showQuestion();window.scrollTo(0,0);}}));});}
function submit(){const q=quiz();if(q.answers&&q.answers[current])return;const picks=draft[current]||[];if(!picks.length){toast('Select an answer first.');return;}if(!q.answers)q.answers={};q.answers[current]=picks;if(!save()){delete q.answers[current];return;}showQuestion();}
function restart(){const q=quiz();if(confirm(`Retake "${q.title}"?\n\nThis will clear the answers for this quiz.`)){q.answers={};draft={};current=0;save();showQuestion();window.scrollTo(0,0);}}
// Parse Word paragraphs in document order; supports the formatted quiz document generated earlier.
async function parseDocx(file){if(!window.JSZip)throw new Error('Word import library is missing.');const zip=await JSZip.loadAsync(await file.arrayBuffer());const entry=zip.file('word/document.xml');if(!entry)throw new Error('This file does not contain a Word document.');const xml=new DOMParser().parseFromString(await entry.async('string'),'application/xml');if(xml.getElementsByTagName('parsererror').length)throw new Error('Word document XML could not be read.');const paragraphs=Array.from(xml.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main','p'));
 const lines=paragraphs.map(p=>Array.from(p.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main','t')).map(t=>t.textContent).join('').trim()).filter(Boolean);
 const sections=[];let section=null;let number=null;for(const line of lines){const qm=/^Question\s+(\d+)\s*[:.)-]?\s*$/i.exec(line);if(qm){if(section)sections.push({number,lines:section});number=+qm[1];section=[];}else if(section){if(/^(Quick Review|Answer Summary|Answer Key)\s*:/i.test(line))break;section.push(line);}}if(section)sections.push({number,lines:section});if(!sections.length)throw new Error('No "Question 1" sections found. Use the formatted Word template.');
 return sections.map(({number,lines})=>{let mode='question',type='',stem=[],options=[],correctLine='',explanation=[];for(const line of lines){const t=/^Type\s*:\s*(MCQ|SATA)$/i.exec(line);const ans=/^(?:✅\s*)?Correct Answers?\s*:\s*(.+)$/i.exec(line);if(t&&mode==='question'){type=t[1].toUpperCase();}else if(/^Options\s*:\s*$/i.test(line)){mode='options';}else if(ans){correctLine=ans[1];mode='after_answer';}else if(/^Explanation\s*:/i.test(line)){mode='explanation';const rest=line.replace(/^Explanation\s*:/i,'').trim();if(rest)explanation.push(rest);}else if(mode==='question'){stem.push(line);}else if(mode==='options'){const om=/^([A-Ha-h])[.)]\s+(.+)$/.exec(line);if(!om)throw new Error(`Question ${number}: invalid option: ${line.slice(0,55)}`);options.push({letter:om[1].toUpperCase(),text:om[2].trim()});}else if(mode==='after_answer'||mode==='explanation')explanation.push(line);}
 const text=stem.join('\n').trim(),letters=options.map(o=>o.letter);if(!text||options.length<2||new Set(letters).size!==letters.length)throw new Error(`Question ${number}: missing question or options.`);if(!correctLine)throw new Error(`Question ${number}: missing Correct Answer.`);const letterPart=correctLine.split(/\b[A-Ha-h]\s*\.\s+[A-Za-z]/)[0];let correct=[...new Set((letterPart.match(/\b[A-Ha-h]\b/g)||[]).map(x=>x.toUpperCase()))];if(correct.length===0){const first=/^\s*([A-H])\s*[.)]/i.exec(correctLine);if(first)correct=[first[1].toUpperCase()];}if(!correct.length||correct.some(l=>!letters.includes(l)))throw new Error(`Question ${number}: answer letters do not match the options.`);
 type=type||((correct.length>1||/select all that apply/i.test(text))?'SATA':'MCQ');if(type==='MCQ'&&correct.length!==1||type==='SATA'&&correct.length<1)throw new Error(`Question ${number}: incorrect answer count for ${type}.`);return {number,type,text,options,correct,explanation:explanation.join('\n').trim()};});}
async function importWord(file){try{if(!file)return;const questions=await parseDocx(file);const title=file.name.replace(/\.docx$/i,'').replaceAll('_',' ');data.quizzes.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2),title,questions,answers:{}});if(!save()){data.quizzes.pop();return;}renderHome();toast(`Imported ${questions.length} questions from ${file.name}`);}catch(e){alert('Could not import Word document:\n\n'+e.message);}finally{$('wordInput').value='';}}
function exportBackup(){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='pharmacy-quiz-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
async function importBackup(file){if(!file)return;try{const incoming=JSON.parse(await file.text());if(incoming.version!==1||!Array.isArray(incoming.quizzes)||!incoming.quizzes.every(q=>typeof q.title==='string'&&Array.isArray(q.questions)&&q.questions.every(x=>typeof x.text==='string'&&Array.isArray(x.options)&&Array.isArray(x.correct))))throw new Error('Not a valid Pharmacy Quiz backup.');if(!confirm('Restore this backup? This will REPLACE all tests and progress currently stored on this device.'))return;const prev=data;data=incoming;if(!save()){data=prev;return;}renderHome();toast('Backup restored.');}catch(e){alert('Could not restore backup: '+e.message);}finally{$('backupInput').value='';}}
// Load public .docx files directly from the repository's /quizzes folder.
// GitHub Pages does not list folders, so use GitHub's public repository contents API.
function repoFromWebsite(){
 const hostname=location.hostname.toLowerCase();
 if(!hostname.endsWith('.github.io'))return null;
 const owner=hostname.slice(0,-'.github.io'.length);
 const repo=decodeURIComponent(location.pathname.split('/').filter(Boolean)[0]||'');
 return owner&&repo?{owner,repo}:null;
}
async function refreshGithubQuizzes(){
 const status=$('githubStatus'),refresh=$('refreshGithubBtn'),repo=repoFromWebsite();
 if(!repo){status.textContent='GitHub quizzes are available once this app is published at username.github.io/repository/';return;}
 refresh.disabled=true;status.textContent='Checking GitHub quizzes folder…';
 try{
  const url=`https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/contents/quizzes`;
  const result=await fetch(url,{cache:'no-store',headers:{Accept:'application/vnd.github+json'}});
  if(result.status===404){status.textContent='No quizzes folder found yet. Create quizzes/ in GitHub and upload .docx files.';return;}
  if(!result.ok)throw new Error('GitHub listing request failed (HTTP '+result.status+').');
  const entries=await result.json();if(!Array.isArray(entries))throw new Error('Expected a quizzes folder.');
  const docs=entries.filter(f=>f.type==='file'&&/\.docx$/i.test(f.name)).sort((a,b)=>a.name.localeCompare(b.name));
  if(!docs.length){status.textContent='Your GitHub quizzes folder has no Word documents yet.';return;}
  let loaded=0,failed=[];
  for(const entry of docs){
   const id='github:'+entry.path;
   const old=data.quizzes.find(q=>q.id===id);
   if(old&&old.sha===entry.sha){loaded++;continue;}
   try{
    const fileUrl='./'+entry.path.split('/').map(encodeURIComponent).join('/');
    const response=await fetch(fileUrl,{cache:'no-store'});
    if(!response.ok)throw new Error('HTTP '+response.status);
    const bytes=await response.blob();
    const questions=await parseDocx(new File([bytes],entry.name,{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}));
    const title=entry.name.replace(/\.docx$/i,'').replaceAll('_',' ');
    const updated={id,source:'github',path:entry.path,sha:entry.sha,title,questions,answers:{}};
    // Preserve answers if the document was republished without changing question structure.
    if(old&&old.questions.length===questions.length&&old.questions.every((q,i)=>q.text===questions[i].text&&JSON.stringify(q.options)===JSON.stringify(questions[i].options)&&JSON.stringify(q.correct)===JSON.stringify(questions[i].correct)))updated.answers=old.answers||{};
    if(old){data.quizzes[data.quizzes.indexOf(old)]=updated;}else data.quizzes.push(updated);
    loaded++;
   }catch(err){failed.push(`${entry.name}: ${err.message}`);}
  }
  // A deleted GitHub document disappears from the shared list after refresh.
  const available=new Set(docs.map(d=>'github:'+d.path));
  data.quizzes=data.quizzes.filter(q=>q.source!=='github'||available.has(q.id));
  save();renderHome();
  status.textContent=`GitHub: ${loaded} quiz${loaded===1?'':'zes'} available.`+(failed.length?` ${failed.length} document(s) could not be loaded: ${failed.join('; ')}`:'');
 }catch(err){status.textContent='Could not check GitHub: '+err.message+' Previously loaded quizzes remain available on this device.';}
 finally{refresh.disabled=false;}
}
$('wordInput').addEventListener('change',e=>importWord(e.target.files[0]));$('backupInput').addEventListener('change',e=>importBackup(e.target.files[0]));$('exportBtn').addEventListener('click',exportBackup);$('homeBtn').addEventListener('click',displayHome);$('submitBtn').addEventListener('click',submit);$('previousBtn').addEventListener('click',()=>{current=Math.max(0,current-1);showQuestion();window.scrollTo(0,0);});$('nextBtn').addEventListener('click',()=>{current=Math.min(quiz().questions.length-1,current+1);showQuestion();window.scrollTo(0,0);});$('retakeBtn').addEventListener('click',restart);renderHome();$('refreshGithubBtn').addEventListener('click',refreshGithubQuizzes);refreshGithubQuizzes();if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
