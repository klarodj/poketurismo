const pilot=user=>({id:user.id,name:user.username,level:user.level,avatar:user.avatar||null});
const pair=(a,b)=>({OR:[{senderId:a,recipientId:b},{senderId:b,recipientId:a}]});
async function notifications(tx,userId){
 const [unread,latest,friendships]=await Promise.all([tx.meetMessage.count({where:{recipientId:userId,readAt:null}}),tx.meetMessage.findMany({where:{recipientId:userId,readAt:null},orderBy:[{createdAt:'desc'},{id:'desc'}],take:5,select:{id:true,createdAt:true,sender:{select:{id:true,username:true,level:true,avatar:true}}}}),require('./friendships').list(tx,userId,true)]);
 return {unread,friendRequests:friendships,latest:latest.map(row=>({id:row.id,createdAt:row.createdAt,sender:pilot(row.sender)}))};
}
async function inbox(tx,userId){
 const [messages,challenges,blocks,visible,unread,friendships]=await Promise.all([
  tx.meetMessage.groupBy({by:['senderId','recipientId'],where:{OR:[{senderId:userId},{recipientId:userId}]}}),
  tx.meetChallenge.findMany({where:{OR:[{senderId:userId},{recipientId:userId}]},select:{senderId:true,recipientId:true}}),
  tx.meetBlock.findMany({where:{OR:[{blockerId:userId},{blockedId:userId}]}}),
  tx.user.findMany({where:{id:{gt:0},progress:{showcaseGarageId:{not:null}}},select:{id:true,username:true,level:true,avatar:true,progress:{select:{showcaseGarageId:true}}}}),
  tx.meetMessage.count({where:{recipientId:userId,readAt:null}}),require('./friendships').list(tx,userId)
 ]);
 const garages=await tx.garage.findMany({where:{id:{in:visible.map(u=>u.progress.showcaseGarageId)}},select:{id:true,userId:true}});
 const publicPeople=visible.filter(user=>user.id!==userId&&garages.some(g=>g.id===user.progress.showcaseGarageId&&g.userId===user.id));
 const ids=[...new Set([...messages.map(m=>m.senderId===userId?m.recipientId:m.senderId),...challenges.map(m=>m.senderId===userId?m.recipientId:m.senderId),...blocks.map(b=>b.blockerId===userId?b.blockedId:b.blockerId),...publicPeople.map(p=>p.id),...friendships.map(f=>f.peer.id)])];
 const users=await tx.user.findMany({where:{id:{in:ids}},select:{id:true,username:true,level:true,avatar:true}});
 const contacts=users.filter(user=>user.id!==userId).map(user=>({...pilot(user),friendship:friendships.find(f=>f.peer.id===user.id)||null,canMessage:publicPeople.some(p=>p.id===user.id)||messages.some(m=>m.senderId===user.id||m.recipientId===user.id)||challenges.some(c=>c.senderId===user.id||c.recipientId===user.id)||friendships.some(f=>f.peer.id===user.id&&f.status==='accepted'),blocked:blocks.some(b=>b.blockerId===user.id||b.blockedId===user.id),blockedByMe:blocks.some(b=>b.blockerId===userId&&b.blockedId===user.id)})).sort((a,b)=>a.name.localeCompare(b.name,'it'));
 const peers=[...new Set(messages.map(m=>m.senderId===userId?m.recipientId:m.senderId))];
 const conversations=await Promise.all(peers.flatMap(id=>{const peer=contacts.find(p=>p.id===id);return peer?[(async()=>({peer,lastMessage:await tx.meetMessage.findFirst({where:pair(userId,id),orderBy:[{createdAt:'desc'},{id:'desc'}]}),unread:await tx.meetMessage.count({where:{senderId:id,recipientId:userId,readAt:null}})}))()]:[];}));
 conversations.sort((a,b)=>+new Date(b.lastMessage.createdAt)-+new Date(a.lastMessage.createdAt)||b.lastMessage.id.localeCompare(a.lastMessage.id));
 return {unread,contacts,conversations,friendships};
}
module.exports={notifications,inbox};
