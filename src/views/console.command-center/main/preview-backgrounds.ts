export const PREVIEW_BACKGROUNDS = [
  {id:'graphite',label:'Graphite gradient',css:'radial-gradient(ellipse at 50% 42%, #29353d 0%, #152129 48%, #091116 100%)'},
  {id:'blue',label:'Blue gradient',css:'radial-gradient(ellipse at 50% 42%, #25374c 0%, #152334 48%, #0a111d 100%)'},
  {id:'teal',label:'Teal gradient',css:'radial-gradient(ellipse at 50% 42%, #25403f 0%, #152a2b 48%, #0a1518 100%)'},
  {id:'warm',label:'Warm gradient',css:'radial-gradient(ellipse at 50% 42%, #40372e 0%, #29221e 48%, #161210 100%)'},
  {id:'plum',label:'Plum gradient',css:'radial-gradient(ellipse at 50% 42%, #3a3043 0%, #251e2d 48%, #130f1b 100%)'},
  {id:'pearl',label:'Pearl gradient (light)',css:'radial-gradient(ellipse at 50% 42%, #fafaf7 0%, #e6e9e8 48%, #cbd1d2 100%)'},
  {id:'mist',label:'Mist gradient (light)',css:'radial-gradient(ellipse at 50% 42%, #f4f8fa 0%, #dfe9ef 48%, #c2d1dc 100%)'},
  {id:'linen',label:'Linen gradient (light)',css:'radial-gradient(ellipse at 50% 42%, #fffaf0 0%, #eee4d4 48%, #d5c7b5 100%)'},
  {id:'sage',label:'Sage gradient (light)',css:'radial-gradient(ellipse at 50% 42%, #f4f9ef 0%, #e0e9da 48%, #c0d0bc 100%)'},
  {id:'lavender',label:'Lavender gradient (light)',css:'radial-gradient(ellipse at 50% 42%, #faf6fd 0%, #e9e2f0 48%, #cec2db 100%)'},
  {id:'charcoal',label:'Charcoal',css:'#151a1e'},
  {id:'black',label:'Black',css:'#05080b'},
] as const;
export type PreviewBackgroundId=typeof PREVIEW_BACKGROUNDS[number]['id'];
export function previewBackground(value:unknown,theme:'dark'|'light'='dark'){return PREVIEW_BACKGROUNDS.find(background=>background.id===value)??PREVIEW_BACKGROUNDS.find(background=>background.id===(theme==='light'?'pearl':'graphite'))!;}
