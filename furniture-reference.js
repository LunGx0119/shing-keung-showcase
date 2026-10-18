/* Furniture-specific filters and grouped albums, based on the current app.js. */
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
  const selected=filterButtons.find(b=>b.dataset.filter===category||b.dataset.filterAlias===category)||filterButtons.find(b=>b.dataset.filter==='全部');
  category=selected.dataset.filter;
  filterButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
  let n=0;gallery.querySelectorAll('[data-category]').forEach(card=>{const show=category==='全部'||(card.dataset.categories||card.dataset.category).split('|').includes(category);card.hidden=!show;if(show)n++;});
  count.textContent=`${selected.textContent.trim()} · ${n} 組參考`;
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
const viewerStage=lightbox.querySelector('.lightbox-image');
const viewerStatus=document.createElement('p');
viewerStatus.className='lightbox-status';viewerStatus.setAttribute('role','status');viewerStatus.setAttribute('aria-live','polite');viewerStatus.hidden=true;viewerStage.append(viewerStatus);
viewerImage.decoding='async';
let visiblePhotos=[],photoIndex=0,originButton=null,photoRequest=0;
function showPhoto(index){
 if(!visiblePhotos.length)return;
 photoIndex=(index+visiblePhotos.length)%visiblePhotos.length;
 const button=visiblePhotos[photoIndex];
 const request=++photoRequest;
 viewerImage.hidden=true;viewerImage.removeAttribute('src');viewerImage.alt=button.dataset.title;
 viewerStatus.textContent='相片載入中…';viewerStatus.hidden=false;viewerStage.setAttribute('aria-busy','true');
 const loadingImage=new Image();loadingImage.decoding='async';
 loadingImage.onload=async()=>{
  if(typeof loadingImage.decode==='function'){try{await loadingImage.decode();}catch{}}
  if(request!==photoRequest)return;
  viewerImage.src=loadingImage.src;viewerImage.hidden=false;viewerStatus.hidden=true;viewerStage.setAttribute('aria-busy','false');
 };
 loadingImage.onerror=()=>{
  if(request!==photoRequest)return;
  viewerStatus.textContent='相片暫時無法載入，請稍後再試，或查看其他相片。';viewerStage.setAttribute('aria-busy','false');
 };
 loadingImage.src=button.dataset.full;
 viewerTitle.textContent=button.dataset.title;viewerCaption.textContent=button.dataset.caption;
 viewerCount.textContent=`${photoIndex+1} / ${visiblePhotos.length}`;
 inquiry.href=`https://wa.me/85291568082?text=${encodeURIComponent('Anson，你好！我想查詢「'+button.dataset.title+'」的設計／工程。')}`;
 previous.disabled=next.disabled=visiblePhotos.length<2;
}
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{
 originButton=button;
 const album=button.closest('[data-furniture-album]');
 if(album){
  visiblePhotos=JSON.parse(album.dataset.furnitureAlbum).map(photo=>({dataset:photo}));
  showPhoto(Number(button.dataset.albumIndex||0));
 }else{
  visiblePhotos=[...document.querySelectorAll('[data-photo]')].filter(b=>!b.closest('[hidden]')&&!b.closest('[data-furniture-album]'));
  showPhoto(visiblePhotos.indexOf(button));
 }
 lightbox.showModal();
}));
previous.addEventListener('click',()=>showPhoto(photoIndex-1));
next.addEventListener('click',()=>showPhoto(photoIndex+1));
function closeViewer(){lightbox.close();originButton?.focus({preventScroll:true});}
lightbox.querySelector('[data-close]').addEventListener('click',closeViewer);
lightbox.addEventListener('click',e=>{if(e.target===lightbox){const r=lightbox.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeViewer();}});
lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(photoIndex-1);}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+1);}if(e.key==='Escape'){e.preventDefault();closeViewer();}});
lightbox.addEventListener('close',()=>{if(lightbox.open)return;photoRequest++;viewerImage.hidden=true;viewerImage.removeAttribute('src');viewerStatus.hidden=true;viewerStage.setAttribute('aria-busy','false');touchStart=null;originButton?.focus({preventScroll:true});});
let touchStart=null;
viewerImage.addEventListener('touchstart',e=>{touchStart={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};},{passive:true});
viewerImage.addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)showPhoto(photoIndex+(dx<0?1:-1));touchStart=null;},{passive:true});
