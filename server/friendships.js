const {fail,positiveId}=require('./gameRules');
const pair=(a,b)=>({lowId:Math.min(a,b),highId:Math.max(a,b)});
const requestKey=row=>`${row.lowId}-${row.highId}-${+new Date(row.createdAt)}`;
const own=userId=>({OR:[{lowId:userId},{highId:userId}]});
const pilot=u=>({id:u.id,name:u.username,level:u.level,avatar:u.avatar||null});
async function list(tx,userId,incomingOnly=false){
 const rows=await tx.meetFriendship.findMany({where:{...own(userId),status:incomingOnly?'pending':{in:['pending','accepted']},...(incomingOnly?{requestedBy:{not:userId}}:{})},include:{low:{select:{id:true,username:true,level:true,avatar:true}},high:{select:{id:true,username:true,level:true,avatar:true}}},orderBy:{createdAt:'desc'}});
 const blocks=await tx.meetBlock.findMany({where:{OR:[{blockerId:userId},{blockedId:userId}]}});
 return rows.flatMap(row=>{const peer=row.lowId===userId?row.high:row.low;if(blocks.some(b=>b.blockerId===peer.id||b.blockedId===peer.id))return[];return[{peer:pilot(peer),status:row.status,direction:row.requestedBy===userId?'outgoing':'incoming',createdAt:row.createdAt,key:requestKey(row),number:row.status==='accepted'?`PT-${String(peer.id).padStart(5,'0')}`:null}];});
}
async function change(tx,userId,body){
 if(Object.keys(body).some(k=>!['peerId','action','requestKey'].includes(k))||!['request','accept','decline','cancel','remove'].includes(body.action))fail(400,'Operazione rubrica non valida');
 const peerId=positiveId(body.peerId);if(peerId===userId)fail(400,'Scegli un altro pilota');
 if(!await tx.user.findUnique({where:{id:peerId},select:{id:true}}))fail(404,'Pilota inesistente');
 const ids=pair(userId,peerId),where={lowId_highId:ids};
 const row=await tx.meetFriendship.findUnique({where});
 const blocked=await tx.meetBlock.findFirst({where:{OR:[{blockerId:userId,blockedId:peerId},{blockerId:peerId,blockedId:userId}]}});
 if(blocked)fail(403,'Contatto non disponibile');
 const action=body.action;
 if(action==='request'){
  // Crossing invitations never bypass consent: the recipient explicitly accepts.
  if(row?.status==='accepted'||row?.status==='pending')return{friendshipStatus:row.status};
  await require('./meetSocial').contact(tx,userId,peerId);
  if(row&&Date.now()-+new Date(row.updatedAt)<86400000)fail(429,'Aspetta 24 ore prima di chiedere nuovamente il numero a questo pilota');
  if(await tx.meetFriendship.count({where:{requestedBy:userId,createdAt:{gte:new Date(Date.now()-3600000)}}})>=10||await tx.meetFriendship.count({where:{requestedBy:userId,status:'pending'}})>=30)fail(429,'Troppe richieste di contatto: attendi una risposta');
  const data={requestedBy:userId,status:'pending',createdAt:new Date()};
  await tx.meetFriendship.upsert({where,create:{...ids,...data},update:data});
 }else{
  if(!row)fail(404,'Richiesta non disponibile');
  if(body.requestKey!==requestKey(row))fail(409,'La richiesta è cambiata. Aggiorna la rubrica prima di rispondere');
  if(action==='accept'||action==='decline'){
   if(row.requestedBy===userId)fail(403,'Solo il destinatario può rispondere');
   if(row.status!=='pending')fail(409,'La richiesta non è più in attesa');
  }else if(action==='cancel'){
   if(row.requestedBy!==userId)fail(403,'Puoi ritirare solo le tue richieste');
   if(row.status!=='pending')fail(409,'La richiesta non è più in attesa');
  }else if(row.status!=='accepted')fail(409,'Numero non presente in rubrica');
  await tx.meetFriendship.update({where,data:{status:{accept:'accepted',decline:'declined',cancel:'cancelled',remove:'removed'}[action]}});
 }
 return{friendshipStatus:action==='request'?'pending':{accept:'accepted',decline:'declined',cancel:'cancelled',remove:'removed'}[action]};
}
async function disconnect(tx,a,b){await tx.meetFriendship.updateMany({where:{...pair(a,b),status:{in:['pending','accepted']}},data:{status:'removed'}});}
module.exports={pair,own,list,change,disconnect};
