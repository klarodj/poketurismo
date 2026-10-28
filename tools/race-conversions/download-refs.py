"""Download and validate real-photo reference files; no game image editing."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json, subprocess, re, hashlib
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
BASE=Path('/home/klaro/.backups/poketurismo/race-conversions-2026-10-27/references')
JOBS=json.loads((ROOT/'.preview/reference-jobs.json').read_text())
OUT=ROOT/'tools/race-conversions/selected-references';OUT.mkdir(exist_ok=True)
def job(j):
    existing=OUT/(j['key']+'.json')
    old=json.loads(existing.read_text()) if existing.exists() else {}
    if old.get('reviewed') and old.get('selected'):return {'key':j['key'],'cached':True}
    commons=ROOT/'tools/race-conversions/commons'/(j['key']+'.json')
    selected=[]
    candidates=j['images']
    for i,c in enumerate(candidates):
        if selected:break
        text=c['title']+' '+c.get('description','')
        if re.search(r'\bslot car\b|\bslotcar\b|1\s*/\s*(18|24|43|64|87)|\bmodelcar\b|\bscalextric\b',text,re.I):continue
        if c.get('score',0)<5:continue
        target=BASE/(j['key']+'-'+hashlib.sha256(c['url'].encode()).hexdigest()[:12]+'.img')
        prior=next((x for x in old.get('selected',[]) if x.get('url')==c['url'] and Path(x.get('file','')).is_file()),None)
        if prior:
            selected=[{**c,**prior}];break
        r=subprocess.run(['curl','--http1.1','--compressed','-fLsS','--connect-timeout','7','--max-time','22','--max-filesize','3500000','-A','Mozilla/5.0',c['url'],'-o',str(target)],capture_output=True)
        if r.returncode:continue
        try:
            im=Image.open(target);im.load()
            if im.width<200 or im.height<100 or im.format not in ['JPEG','PNG','WEBP']:continue
            selected=[{**c,'file':str(target),'width':im.width,'height':im.height}]
        except Exception:continue
    result={'key':j['key'],'selected':selected,'attempted':len(candidates),'previous':old.get('selected',[])}
    existing.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    return {'key':j['key'],'photos':len(selected)}
with ThreadPoolExecutor(max_workers=4)as pool:
    for result in pool.map(job,JOBS):print(json.dumps(result),flush=True)
