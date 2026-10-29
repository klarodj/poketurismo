"""Original short game instrumentals: deterministic notes + synthesis; no samples."""
import math,random,wave,array,pathlib,json
ROOT=pathlib.Path(__file__).resolve().parents[2]; SR=22050
SONGS=[('tangenziale','Tangenziale, ore 22',122,[45,41,48,43],[0,7,12,10,7,3,5,7]),('ultimo-gettone','Ultimo gettone',110,[50,46,53,48],[12,10,7,5,3,5,7,10]),('passo-notturno','Passo notturno',130,[40,43,38,45],[0,3,7,12,10,7,5,3])]
manifest=[]
for num,(slug,title,bpm,roots,melody) in enumerate(SONGS):
 beat=60/bpm; duration=beat*96; audio=[0.0]*int(duration*SR);rng=random.Random(1999+num)
 def note(start,dur,midi,amp,kind):
  f=440*2**((midi-69)/12);offset=int(start*SR)
  for j in range(min(int(dur*SR),len(audio)-offset)):
   t=j/SR;env=min(1,t/.008)*min(1,(dur-t)/.06)*math.exp(-t*(4 if kind=='lead' else 1.5));x=math.sin(2*math.pi*f*t)
   if kind=='lead':x=.75*x+.17*math.sin(4*math.pi*f*t)+.08*math.sin(6*math.pi*f*t)
   audio[offset+j]+=amp*env*x
 for step in range(192):
  start=step*beat/2;bar=step//8;root=roots[(bar//2)%4]
  note(start,beat*.43,root+(12 if step%4==2 else 0),.19,'bass')
  if bar>=4 and step%2==0:note(start,beat*.72,root+24+melody[(step//2+bar//4)%8],.115,'lead')
  if bar%2==0 and step%8==0:
   for interval in [0,3,7]:note(start,beat*3.6,root+12+interval,.045,'pad')
  # Original synthesized drum sounds
  for j in range(min(int(.18*SR),len(audio)-int(start*SR))):
   t=j/SR;v=0
   if step%2==0:v+=.36*math.sin(2*math.pi*(46*t+3*(1-math.exp(-t*32))))*math.exp(-t*24)
   if step%4==2:v+=rng.uniform(-1,1)*.15*math.exp(-t*32)
   v+=rng.uniform(-1,1)*.035*math.exp(-t*100)
   audio[int(start*SR)+j]+=v
 # Gentle end fades, peak below full scale, mono for small downloads.
 peak=max(abs(x) for x in audio); samples=array.array('h',(int(x/max(peak,1)*26000*min(1,i/(SR*.1),(len(audio)-i)/(SR*.3))) for i,x in enumerate(audio)))
 output=ROOT/'public/audio/radio'/f'{slug}.wav'
 with wave.open(str(output),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(samples.tobytes())
 manifest.append({'id':slug,'title':title,'artist':'Club Motori del Nord','src':f'/audio/radio/{slug}.wav','bpm':bpm,'duration':round(duration,2)})
(ROOT/'shared/radioTracks.mjs').write_text('// Original compositions synthesized by tools/radio-music/build.py; no external samples.\nexport const RADIO_TRACKS = '+json.dumps(manifest,ensure_ascii=False,indent=2)+';\n')
