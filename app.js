'use strict';
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#site-nav');
function closeMenu(returnFocus=false){nav.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');menuButton.textContent='選單';if(returnFocus)menuButton.focus();}
menuButton.addEventListener('click',()=>{const open=!nav.classList.contains('is-open');nav.classList.toggle('is-open',open);menuButton.setAttribute('aria-expanded',String(open));menuButton.textContent=open?'關閉':'選單';});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open'))closeMenu(true);});
window.addEventListener('resize',()=>{if(window.innerWidth>1100)closeMenu();});

const gallery=document.querySelector('[data-gallery]');
const filterButtons=[...document.querySelectorAll('[data-filter]')];
const count=document.querySelector('#gallery-count');
function setFilter(category,changeHistory=false){
  if(!gallery)return;
  if(!filterButtons.some(b=>b.dataset.filter===category))category='全部';
  filterButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
  let n=0;gallery.querySelectorAll('[data-category]').forEach(card=>{const show=category==='全部'||card.dataset.category===category;card.hidden=!show;if(show)n++;});
  count.textContent=`${category==='全部'?'全部':category} · ${n} ${gallery.classList.contains('catalog')?'款':'張相片'}`;
  if(changeHistory){const url=new URL(location.href);if(category==='全部')url.searchParams.delete('category');else url.searchParams.set('category',category);history.pushState({},'',url);}
}
filterButtons.forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.filter,true)));
setFilter(new URL(location.href).searchParams.get('category')||'全部');
window.addEventListener('popstate',()=>setFilter(new URL(location.href).searchParams.get('category')||'全部'));

const lightbox=document.querySelector('#photo-viewer');
const viewerImage=lightbox.querySelector('img');
const viewerTitle=lightbox.querySelector('#viewer-title');
const viewerCaption=lightbox.querySelector('#viewer-caption');
const viewerCount=lightbox.querySelector('.lightbox-count');
const inquiry=lightbox.querySelector('.lightbox-inquiry');
const previous=lightbox.querySelector('[data-previous]');
const next=lightbox.querySelector('[data-next]');
let visiblePhotos=[],photoIndex=0,originButton=null;
function showPhoto(index){
 photoIndex=(index+visiblePhotos.length)%visiblePhotos.length;
 const button=visiblePhotos[photoIndex];
 viewerImage.src=button.dataset.full;viewerImage.alt=button.dataset.title;
 viewerTitle.textContent=button.dataset.title;viewerCaption.textContent=button.dataset.caption;
 viewerCount.textContent=`${photoIndex+1} / ${visiblePhotos.length}`;
 inquiry.href=`https://wa.me/85291568082?text=${encodeURIComponent('Anson，你好！我想查詢「'+button.dataset.title+'」的設計／工程。')}`;
 previous.disabled=next.disabled=visiblePhotos.length<2;
}
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{
 originButton=button;
 visiblePhotos=[...document.querySelectorAll('[data-photo]')].filter(b=>!b.closest('[hidden]'));
 showPhoto(visiblePhotos.indexOf(button));lightbox.showModal();
}));
previous.addEventListener('click',()=>showPhoto(photoIndex-1));
next.addEventListener('click',()=>showPhoto(photoIndex+1));
function closeViewer(){lightbox.close();originButton?.focus({preventScroll:true});}
lightbox.querySelector('[data-close]').addEventListener('click',closeViewer);
lightbox.addEventListener('click',e=>{if(e.target===lightbox){const r=lightbox.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeViewer();}});
lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(photoIndex-1);}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+1);}if(e.key==='Escape'){e.preventDefault();closeViewer();}});
lightbox.addEventListener('close',()=>{if(lightbox.open)return;viewerImage.removeAttribute('src');originButton?.focus({preventScroll:true});});
let touchStart=null;
viewerImage.addEventListener('touchstart',e=>{touchStart={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};},{passive:true});
viewerImage.addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)showPhoto(photoIndex+(dx<0?1:-1));touchStart=null;},{passive:true});
