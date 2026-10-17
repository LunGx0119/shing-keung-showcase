'use strict';
const comicZoom=document.querySelector('.comic-zoom');
const comicSheet=document.querySelector('#comic-sheet');
if(comicZoom&&comicSheet){
 comicZoom.hidden=false;
 comicZoom.addEventListener('click',()=>{
  const enlarged=!comicSheet.classList.contains('is-enlarged');
  comicSheet.classList.toggle('is-enlarged',enlarged);
  comicZoom.setAttribute('aria-pressed',String(enlarged));
  comicZoom.textContent=enlarged?'還原大小':'放大文字';
  comicSheet.scrollLeft=0;
 });
}
