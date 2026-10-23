export function smsParts(text){return Math.max(1,Math.ceil((text||'').length/160));}
export function notificationState(previous,data){
 const newer=message=>!previous.watermark||+new Date(message.createdAt)>+new Date(previous.watermark.createdAt)||+new Date(message.createdAt)===+new Date(previous.watermark.createdAt)&&message.id>previous.watermark.id;
 const seen=new Set(previous.seen||[]),fresh=(data.latest||[]).filter(message=>!seen.has(message.id)&&(!previous.initialized||newer(message)));
 const top=data.latest?.[0],watermark=top&&newer(top)?{id:top.id,createdAt:top.createdAt}:previous.watermark||null;
 for(const message of data.latest||[])seen.add(message.id);
 let notice=previous.notice;
 if(fresh.length&&data.unread>0)notice={id:fresh[0].id,peer:fresh[0].sender,count:data.unread,backlog:!previous.initialized};
 else if(!data.unread||notice&&!(data.latest||[]).some(m=>m.id===notice.id))notice=null;
 return {unread:data.unread,watermark,seen:[...seen].slice(-500),initialized:true,notice,beep:!!previous.initialized&&fresh.length>0};
}
export function mergeSms(previous,next){const messages=new Map();for(const message of [...previous,...next])messages.set(message.id,message);return [...messages.values()].sort((a,b)=>+new Date(a.createdAt)-+new Date(b.createdAt)||a.id.localeCompare(b.id));}
