"""Original chiptune / drum and bass racing soundtrack. No external samples.
Requires NumPy and ffmpeg (libmp3lame). Run with /usr/bin/python3.
Score, arrangement, synths and mastering are deterministic and kept here.
"""
import math, pathlib, json, subprocess, hashlib
import numpy as np
ROOT=pathlib.Path(__file__).resolve().parents[2]
SR=32000
SONGS=[
 ('tangenziale','Tangenziale, ore 22',172,[40,36,43,38],[7,12,10,7,3,7,14,12,10,7,5,3,5,7,10,7]),
 ('ultimo-gettone','Ultimo gettone',176,[45,41,48,43],[12,15,19,15,12,10,7,10,12,19,17,15,14,10,7,10]),
 ('passo-notturno','Passo notturno',168,[38,34,41,36],[0,7,10,12,14,12,10,7,5,3,7,10,12,10,7,5]),
]
def frequency(midi):return 440*2**((midi-69)/12)
def pan(signal,p):return np.column_stack((signal*math.sqrt((1-p)/2),signal*math.sqrt((1+p)/2))).astype(np.float32)
def oscillator(t,f,kind,brightness=8):
 # Additive band-limited oscillators avoid naive square/saw aliasing.
 out=np.zeros_like(t)
 for h in range(1,min(brightness,int(SR*.45/f))+1):
  if kind=='pulse':out+=np.sin(2*np.pi*f*h*t)*np.sin(np.pi*.32*h)/h
  elif kind=='triangle':
   if h%2:out+=(-1)**((h-1)//2)*np.sin(2*np.pi*f*h*t)/(h*h)
  else:out+=np.sin(2*np.pi*f*h*t)/h
 return out
manifest=[];analysis=[]
for number,(slug,title,bpm,roots,hook) in enumerate(SONGS):
 rng=np.random.default_rng(2001+number);beat=60/bpm;bars=56;duration=bars*4*beat;frames=round(duration*SR)
 synth=np.zeros((frames,2),np.float32);drums=np.zeros_like(synth);duck=np.ones(frames,np.float32)
 def add(bus,start,signal,p=0):
  at=round(start*SR)
  if at>=frames:return
  data=pan(signal,p);size=min(len(data),frames-at);bus[at:at+size]+=data[:size]
 def note(start,length,midi,amp,kind,p=0):
  t=np.arange(round(length*SR),dtype=np.float32)/SR;f=frequency(midi)
  env=np.minimum(t/.006,1)*np.minimum((length-t)/.035,1)
  if kind=='bass':
   wave=.6*np.sin(2*np.pi*f*t)+.14*oscillator(t,f*1.003,'saw',5)+.14*oscillator(t,f*.997,'saw',5)
   env*=np.exp(-t*1.2)
  elif kind=='pad':
   wave=.4*oscillator(t,f*.998,'triangle',7)+.4*oscillator(t,f*1.002,'triangle',7)
   env=np.minimum(t/.1,1)*np.minimum((length-t)/.22,1)
  else:
   wave=oscillator(t,f,'pulse' if kind=='lead' else 'triangle',9)
   env*=np.exp(-t*(3 if kind=='lead' else 12))
   if kind=='lead':wave*=1+.07*np.sin(2*np.pi*5*t)
  signal=amp*env*wave;add(synth,start,signal,p)
  if kind=='lead':
   add(synth,start+beat*.75,signal*.22,-p)
   add(synth,start+beat*1.5,signal*.09,p)
 def kick(start,amp=1):
  t=np.arange(round(SR*.24))/SR;phase=2*np.pi*(47*t+105*.022*(1-np.exp(-t/.022)))
  signal=.65*np.sin(phase)*np.exp(-t*20)+rng.uniform(-1,1,len(t))*.07*np.exp(-t*250)
  add(drums,start,amp*signal)
  at=round(start*SR);n=min(round(beat*.65*SR),frames-at)
  if n>0:duck[at:at+n]=np.minimum(duck[at:at+n],.52+.48*np.minimum(np.arange(n)/(beat*.5*SR),1))
 def snare(start,amp=1):
  t=np.arange(round(SR*.19))/SR;noise=rng.uniform(-1,1,len(t));bright=noise-np.roll(noise,1)*.65
  signal=.33*bright*np.exp(-t*22)+.19*np.sin(2*np.pi*182*t)*np.exp(-t*28)+.07*np.sin(2*np.pi*332*t)*np.exp(-t*40)
  add(drums,start,amp*signal,.06)
 def hat(start,opened=False,amp=1):
  t=np.arange(round(SR*(.16 if opened else .045)))/SR;noise=rng.uniform(-1,1,len(t));high=noise-np.roll(noise,1)
  signal=.065*high*np.exp(-t*(28 if opened else 100));add(drums,start,amp*signal,-.38 if opened else .32)
 def crash(start):
  t=np.arange(SR)/SR;noise=rng.uniform(-1,1,len(t));add(drums,start,.08*(noise-np.roll(noise,1)*.8)*np.exp(-t*5),-.25)
 for bar in range(bars):
  # 8 intro, 16 first drop, 8 breakdown, 20 second drop, 4 outro.
  intro=bar<8;breakdown=24<=bar<32;outro=bar>=52;drop=not(intro or breakdown or outro)
  root=roots[(bar//2)%4];start=bar*4*beat;variant=(bar+number)%4
  if bar in [8,16,32,40,48]:crash(start)
  # Broken 16th-note drums with backbeats, syncopation and quiet ghost snares.
  if not breakdown or bar>=30:
   kicks=([0,10] if variant==0 else [0,7,10] if variant==1 else [0,6,11] if variant==2 else [0,10,14])
   if intro and bar<4:kicks=[0]
   for step in kicks:kick(start+step*beat/4,.9 if drop else .65)
   for step in [4,12]:snare(start+step*beat/4,.95 if drop else .5)
   if drop:
    for step in ([3,11,15] if variant%2 else [7,10]):snare(start+step*beat/4,.22)
   for step in range(16):
    if step%2==0 or drop and step in [3,7,11,15]:hat(start+step*beat/4,step in [6,14] and drop,.7 if step%2 else 1)
   if bar in [7,23,31,47,51]:
    for step in [13,14,15]:snare(start+step*beat/4,.35+(step-13)*.16)
  # Warm minor harmony gives the chip leads a musical foundation.
  if bar%2==0:
   for interval in [0,3,7,10]:note(start,beat*7.8,root+12+interval,.045 if breakdown else .025,'pad',-.2+interval/25)
  if not breakdown and not(intro and bar<4):
   for step,offset in [(0,0),(3,0),(6,12),(8,0),(10,0),(13,7),(15,12)]:
    if intro and step not in [0,8]:continue
    note(start+step*beat/4,beat*(.68 if step in [0,8] else .31),root-12+offset,.23 if drop else .14,'bass')
  # Two 8-bar melodic phrases; last four bars respond in a higher register.
  if drop or breakdown or intro and bar>=4:
   for hit in range(8):
    if (intro or breakdown) and hit%2:continue
    interval=hook[((bar%4)*4+hit//2+number*2)%len(hook)]
    octave=12 if bar%8>=6 else 0
    if hit%2==0 or bar%4==3:
     note(start+hit*beat/2,beat*(.4 if hit%2 else .82),root+24+interval+octave,.105 if drop else .065,'lead',-.15)
  if drop and bar%8>=4 or breakdown:
   chord=[0,7,12,15,19,15,12,7]
   for step in range(16):note(start+step*beat/4,beat*.22,root+24+chord[(step+bar)%8],.052,'arp',-.65 if step%2 else .65)
  if outro:
   for hit in [0,3,6]:note(start+hit*beat/2,beat*.8,root+24+hook[hit],.055,'lead',.2)
 # Bus ducking, subtle stereo ambience, gentle soft limiting.
 mix=synth*duck[:,None]+drums
 delay=round(beat*.375*SR);mix[delay:]+=synth[:-delay]*.065
 mix=np.tanh(mix*1.25)
 fade=np.minimum(1,np.arange(frames)/(SR*.04))*np.minimum(1,(frames-1-np.arange(frames))/(beat*2*SR))
 mix*=fade[:,None];mix*=.89/max(float(np.abs(mix).max()),.001)
 pcm=(mix*32767).astype('<i2').tobytes();output=ROOT/'public/audio/radio'/f'{slug}-chip-dnb-v2.mp3'
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','s16le','-ar',str(SR),'-ac','2','-i','pipe:0','-c:a','libmp3lame','-q:a','4','-metadata',f'title={title}','-metadata','artist=Club Motori del Nord',str(output)],input=pcm,check=True)
 row={'id':slug,'title':title,'artist':'Club Motori del Nord','src':'/audio/radio/'+output.name,'bpm':bpm,'duration':round(duration,2),'style':'Chiptune / drum and bass','revision':2};manifest.append(row)
 analysis.append({**row,'bars':bars,'sampleRate':SR,'channels':2,'peakDbFS':round(20*math.log10(float(np.abs(mix).max())),2),'rmsDbFS':round(20*math.log10(float(np.sqrt(np.mean(mix*mix)))),2),'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'bytes':output.stat().st_size})
 print(json.dumps(analysis[-1]),flush=True)
(ROOT/'shared/radioTracks.mjs').write_text('// Original synthesized chiptune / drum and bass; no external samples.\nexport const RADIO_TRACKS = '+json.dumps(manifest,ensure_ascii=False,indent=2)+';\n')
(ROOT/'tools/radio-music/manifest.json').write_text(json.dumps(analysis,ensure_ascii=False,indent=2)+'\n')
