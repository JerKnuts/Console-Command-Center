"""Audit default material variants in the packaged ARMO/WEAP catalog.
Reads source plugins only. Does not edit game files or establish visual parity.
Run: python scripts/audit-preview-variants.py DATA_DIRECTORY OUTPUT_DIRECTORY
Then run PreviewGeometryTests DATA --audit-variants OUTPUT/variant-rules.txt
  Starfield.esm ShatteredSpace.esm SFBGS050.esm SFBGS00D.esm
"""
import pathlib,struct,zlib,collections,json,sys
if len(sys.argv)!=3:raise SystemExit(__doc__)
outdir=pathlib.Path(sys.argv[2]);outdir.mkdir(parents=True,exist_ok=True)
root=pathlib.Path(__file__).resolve().parents[1];text=(root/'src/views/console.command-center/main/id-browser-data.ts').read_text();catalog=json.loads(text.split('String.raw`',1)[1].split('`)',1)[0]);sources=sorted(set(i.get('plugin','Starfield.esm') for i in catalog));data=pathlib.Path(sys.argv[1]);records={};errors=[]
def fields(b):
 at=0
 while at+6<=len(b):
  tag=b[at:at+4].decode();n=struct.unpack_from('<H',b,at+4)[0];at+=6
  if tag=='XXXX':n=struct.unpack_from('<I',b,at)[0];at+=10;tag=b[at-6:at-2].decode()
  if at+n>len(b):raise ValueError('field bounds')
  yield tag,b[at:at+n];at+=n
for plugin in sources:
 p=data/plugin
 if not p.exists():errors.append(plugin);continue
 masters=[]
 with p.open('rb') as f:
  while h:=f.read(24):
   if len(h)<24:break
   n=struct.unpack_from('<I',h,4)[0]
   if h[:4]==b'GRUP':
    if struct.unpack_from('<I',h,12)[0]==0 and h[8:12] not in [b'ARMO',b'WEAP',b'OMOD',b'LMSW',b'MTPT']:f.seek(n-24,1)
    continue
   typ=h[:4].decode();fid=struct.unpack_from('<I',h,12)[0]
   if typ not in ['TES4','ARMO','WEAP','OMOD','LMSW','MTPT']:f.seek(n,1);continue
   b=f.read(n)
   if struct.unpack_from('<I',h,8)[0]&0x40000:b=zlib.decompress(b[4:])
   fs=list(fields(b))
   if typ=='TES4':masters=[v.rstrip(b'\0').decode() for k,v in fs if k=='MAST'];continue
   def remap(raw):
    ordinal=raw>>24
    return (masters[ordinal] if ordinal<len(masters) else plugin if ordinal==len(masters) else '?').lower()+':'+f'{raw&0xffffff:06X}'
   # Audit the source record rather than allowing one DLC to replace another's baseline.
   key=remap(fid)
   if key.startswith(plugin.lower()+':'):records[key]={'type':typ,'fields':fs,'masters':masters,'plugin':plugin}

def template(v):
 if len(v)<18:raise ValueError('short OBTS')
 children,props=struct.unpack_from('<II',v);parent=v[15];offset=18+4*parent
 if parent>1 or children>128 or props>512 or offset+children*7+props*24>len(v):raise ValueError('template bounds')
 return [struct.unpack_from('<I',v,offset+i*7)[0] for i in range(children)], [struct.unpack_from('<6I',v,offset+children*7+i*24) for i in range(props)]
def collect(key,seen=None):
 seen=set() if seen is None else seen
 if key in seen or len(seen)>128:return []
 seen.add(key);r=records.get(key)
 if not r:return []
 def remap(raw):
  o=raw>>24;m=r['masters'];return (m[o] if o<len(m) else r['plugin'] if o==len(m) else '?').lower()+':'+f'{raw&0xffffff:06X}'
 result=[]
 for tag,v in r['fields']:
  if tag=='OBTS':
   try:children,props=template(v)
   except Exception as e:errors.append(key+': '+str(e));break
   for c in children:result+=collect(remap(c),seen)
   for prop in props:
    target=records.get(remap(prop[3]),{})
    if prop[0]==4 and prop[1]==0 and target.get('type')=='LMSW':result.append({'swap':remap(prop[3]),'property':prop[2],'route':'OBTS'})
   break
  if tag=='DATA' and r['type']=='OMOD':
   try:
    children,props=struct.unpack_from('<II',v);size=struct.unpack_from('<I',v,10)[0];offset=14+size+6;slots=struct.unpack_from('<I',v,offset)[0];offset+=8+slots*4
    if children>128 or props>512 or slots>128 or offset+children*7+props*24>len(v):continue
    for i in range(children):result+=collect(remap(struct.unpack_from('<I',v,offset+i*7)[0]),seen)
    offset+=children*7
    for i in range(props):
     prop=struct.unpack_from('<6I',v,offset+i*24);target=records.get(remap(prop[3]),{})
     if prop[0]==4 and prop[1]==0 and target.get('type')=='LMSW':result.append({'swap':remap(prop[3]),'property':prop[2],'route':'OMOD'})
   except Exception:continue
 return result
out=[];totals=collections.Counter()
for e in catalog:
 if e['type'] not in ['ARMO','WEAP']:continue
 k=e.get('plugin','Starfield.esm').lower()+':'+e.get('localFormId',e['value'])[-6:].upper();totals[e['type']]+=1
 variants=collect(k)
 if variants:out.append({'key':k,'name':e['label'],'type':e['type'],'category':e['category'],'variants':variants})
result={'scope':'Packaged catalog records from installed original source plugins; not a visual accuracy guarantee or an audit of user mod overrides.','sourcePlugins':sources,'missingOrMalformed':errors,'scanned':dict(totals),'affectedCount':len(out),'affected':out}
(outdir/'template-audit.json').write_text(json.dumps(result,indent=2));print({k:v for k,v in result.items() if k!='affected'});print(collections.Counter((v['route'],v['property']) for e in out for v in e['variants']));

def pairs(key):
 r=records.get(key);out=[]
 if not r:return out
 for tag,b in r['fields']:
  if tag!='REFL':continue
  at=0;strings=b'';lists=[]
  while at+8<=len(b):
   typ=b[at:at+4];n=struct.unpack_from('<I',b,at+4)[0];v=b[at+8:at+8+n];at+=8+n
   if typ==b'STRT':strings=v
   if typ==b'LIST':lists.append(v)
  for v in lists:
   if len(v)<8:continue
   off,count=struct.unpack_from('<II',v)
   if strings[off:].split(b'\0')[0]!=b'BGSLayeredMaterialSwap::Entry':continue
   at=8
   def short():
    nonlocal at
    n=struct.unpack_from('<H',v,at)[0];at+=2;s=v[at:at+n].rstrip(b'\0').decode();at+=n;return s
   for _ in range(count):
    old=short();typ,raw=struct.unpack_from('<II',v,at);at+=8;new=short()
    if raw:
     masters=r['masters'];o=raw>>24;k=(masters[o] if o<len(masters) else r['plugin']).lower()+':'+f'{raw&0xffffff:06X}';target=records.get(k,{})
     for tag,buf in target.get('fields',[]):
      q=0
      while tag=='REFL' and q+8<=len(buf):
       t=buf[q:q+4];n=struct.unpack_from('<I',buf,q+4)[0];p=buf[q+8:q+8+n];q+=8+n
       if t==b'OBJT' and len(p)>=6:old=p[6:6+struct.unpack_from('<H',p,4)[0]].rstrip(b'\0').decode()
    def norm(s):
     s=s.lower().replace('\\','/')
     if len(s)>2 and s[1:3]==':/' and '/data/materials/' in s:s=s.split('/data/',1)[1]
     s=s.removeprefix('data/').lstrip('/')
     return s if s.startswith('materials/') else 'materials/'+s
    if typ==0xffffff0d and old and new:out.append((norm(old),norm(new)))
 return out
plugins=['Starfield.esm','ShatteredSpace.esm','SFBGS050.esm','SFBGS00D.esm'];rules=[];empty=[]
for entry in out:
 ps=[p for variant in entry['variants'] for p in pairs(variant['swap'])]
 if not ps:empty.append(entry['key']);continue
 targets={}
 for source,_ in ps:
  target=source
  for old,new in ps:
   if target==old:target=new
  targets[source]=target
 plugin,local=entry['key'].split(':');index=[p.lower() for p in plugins].index(plugin);fid=index<<24|int(local,16)
 rules += [f'{fid:08X}|{source}|{target}' for source,target in targets.items()]
(outdir/'variant-rules.txt').write_text('\n'.join(rules)+'\n');print('Material rules',len(rules),'no rules',empty)
