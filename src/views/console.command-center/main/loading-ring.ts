export function loadingRingHtml(size:'small'|'normal'='normal'):string {
  return `<span class="ccc-loading-ring${size==='small'?' ccc-loading-ring--small':''}" aria-hidden="true"><span class="ccc-loading-ring-track model-preview-loading-ring"></span><span>CCC</span></span>`;
}
export function createLoadingRing(size:'small'|'normal'='normal'):HTMLElement {
  const holder=document.createElement('span');holder.innerHTML=loadingRingHtml(size);return holder.firstElementChild as HTMLElement;
}
