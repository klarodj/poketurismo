"""Cache real photographer references privately; never draw or edit game images."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urlencode
import json, subprocess, re, html
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
CAT=json.loads((ROOT/'tools/race-conversions/catalogue.json').read_text())
BASE=Path('/home/klaro/.backups/poketurismo/race-conversions-2026-10-27/references')
BASE.mkdir(parents=True,exist_ok=True)
OUT=ROOT/'tools/race-conversions/commons'
OUT.mkdir(exist_ok=True)
clean=lambda s: html.unescape(re.sub('<[^>]*>',' ',s or '')).strip()
overrides={'gtv':'Alfa Romeo GTV 916 racing','cooper':'Mini Miglia','minit':'Innocenti Mini Turbo','850t':'Volvo 850 BTCC estate','gt1':'Porsche 911 GT1 1998','s2':'Audi S2 rally','seven':'Caterham Seven racing','nb':'Mazda MX-5 NB racing','na':'Spec Miata','93':'Saab Viggen Pikes Peak','speed12':'TVR Cerbera Speed 12','leon':'SEAT Leon Supercopa','e30':'BMW M3 E30 DTM','145':'Alfa Romeo 145 racing','33':'Alfa Romeo 33 racing'}
def fetch(url,target,seconds=22):
    r=subprocess.run(['curl','--http1.1','--compressed','-fLsS','--connect-timeout','8','--max-time',str(seconds),'-A','PoketurismoAssetResearch/1.0',url,'-o',str(target)],capture_output=True)
    return r.returncode==0
def job(m):
    out=OUT/(m['key']+'.json')
    if out.exists():
        saved=json.loads(out.read_text())
        if saved.get('selected'):return {'key':m['key'],'cached':True}
    query=overrides.get(m['key'],m['brand']+' '+re.sub(r'Gruppo|Superturismo|·|del club',' ',m['candidate']))
    params={'action':'query','generator':'search','gsrsearch':query,'gsrnamespace':6,'gsrlimit':8,'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':640,'format':'json'}
    url='https://commons.wikimedia.org/w/api.php?'+urlencode(params)
    tmp=BASE/(m['key']+'-api.json');selected=[];candidates=[]
    if fetch(url,tmp):
        try:
            data=json.loads(tmp.read_text())
            for page in data.get('query',{}).get('pages',{}).values():
                i=(page.get('imageinfo')or[{}])[0];meta=i.get('extmetadata',{});desc=clean(meta.get('ImageDescription',{}).get('value',''));title=page.get('title','')
                if re.search(r'\b(model|diecast|miniature|Forza|Assetto|Gran Turismo)\b',title,re.I):continue
                score=5*bool(re.search(r'rac|rally|dtm|btcc|wrc|jgtc|group|gruppo|kit.?car|cup|miglia|motorsport|procar|GT1|GT2|challenge|superturismo',title+' '+desc,re.I))
                if re.search(r'rear|back',title+' '+desc,re.I):score+=1
                candidates.append({'title':title,'url':i.get('url'),'thumbnail':i.get('thumburl'),'page':i.get('descriptionurl'),'description':desc,'artist':clean(meta.get('Artist',{}).get('value','')),'license':meta.get('LicenseShortName',{}).get('value',''),'score':score})
        except (ValueError,KeyError):pass
    candidates.sort(key=lambda c:c['score'],reverse=True)
    for index,c in enumerate(candidates[:5]):
        if len(selected)>=2:break
        if c['score']<5:continue
        target=BASE/(m['key']+'-commons-'+str(index)+'.img')
        if not fetch(c.get('thumbnail')or c['url'],target):continue
        try:
            image=Image.open(target);image.load()
            if image.width<200 or image.height<100 or image.format not in ['JPEG','PNG','WEBP']:continue
            c={**c,'file':str(target),'width':image.width,'height':image.height};selected.append(c)
        except Exception:continue
    record={'key':m['key'],'query':query,'api':url,'candidates':candidates,'selected':selected}
    out.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
    return {'key':m['key'],'candidates':len(candidates),'photos':len(selected)}
models=[m for m in CAT['models'] if m['classification']!='club']
with ThreadPoolExecutor(max_workers=3)as pool:
    for result in pool.map(job,models):print(json.dumps(result),flush=True)
