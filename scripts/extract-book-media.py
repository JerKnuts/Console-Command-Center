"""Offline book/slate classification from installed ESMs; no audio or model assets are copied."""
import argparse,json,struct,zlib
from pathlib import Path

def fields(data):
 at=0
 while at+6<=len(data):
  tag=data[at:at+4];size=struct.unpack_from('<H',data,at+4)[0];at+=6
  if tag==b'XXXX':
   if size!=4 or at+10>len(data):raise ValueError('Invalid extended field')
   size=struct.unpack_from('<I',data,at)[0];at+=4;tag=data[at:at+4];at+=6
  if size>len(data)-at:raise ValueError('Truncated record field')
  yield tag,data[at:at+size];at+=size

def extract(path):
 books={};statics={}
 with path.open('rb') as f:
  end=f.seek(0,2);f.seek(0);header=f.read(24);n=struct.unpack_from('<I',header,4)[0];masters=[v.rstrip(b'\0').decode()for k,v in fields(f.read(n))if k==b'MAST'];pos=24+n
  while pos+24<=end:
   f.seek(pos);h=f.read(24);typ=h[:4];n,flags,fid=struct.unpack_from('<III',h,4)
   if typ==b'GRUP':
    if h[8:12]not in [b'BOOK',b'STAT']:pos+=n;continue
    pos+=24;continue
   pos+=24+n
   if typ not in [b'BOOK',b'STAT']or flags&0x20:continue
   data=f.read(n)
   if flags&0x40000:data=zlib.decompress(data[4:])
   values=dict(fields(data));model=values.get(b'MODL',b'').rstrip(b'\0').decode(errors='replace').replace('\\','/').lower()
   if typ==b'STAT':statics[fid]=model;continue
   if fid>>24!=len(masters):continue
   dn=values.get(b'DNAM',b'');kind=struct.unpack_from('<I',dn,13)[0]if len(dn)>=17 else 0
   books[f'{fid&0xffffff:06X}']={'slateType':kind,'worldModel':model,'inventoryArt':struct.unpack('<I',values[b'INAM'])[0]if len(values.get(b'INAM',b''))==4 else 0}
 return books,statics,masters

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('data',type=Path);parser.add_argument('output',type=Path);args=parser.parse_args();result={};allstats={};parsed=[]
 for name in ['Starfield.esm','ShatteredSpace.esm','SFBGS00D.esm','SFBGS050.esm']:
  if not(args.data/name).exists():continue
  books,stats,masters=extract(args.data/name);parsed.append((name,books,masters));allstats[name.lower()]=stats
 for name,books,masters in parsed:
  for local,record in books.items():
   art=record.pop('inventoryArt');owner=(masters+[name])[art>>24]if art and art>>24<=len(masters)else name
   model=allstats.get(owner.lower(),{}).get(art if owner==name else art&0xffffff,'')
   record['inventoryModel']=model
   result[name.lower()+':'+local]=record
 args.output.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print('Book/slate records:',len(result))
