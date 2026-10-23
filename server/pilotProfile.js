const{fail,positiveId,publicPlayer}=require('./gameRules');
const{isAvatarId}=require('../shared/avatarCatalog.mjs');
async function changeAvatar(tx,userId,body,params){
 if(positiveId(params.id)!==userId)fail(403,'Questo profilo appartiene a un altro giocatore');
 if(Object.keys(body).length!==1||!isAvatarId(body.avatar))fail(400,'Scegli uno degli avatar disponibili');
 const player=await tx.user.update({where:{id:userId},data:{avatar:body.avatar}});
 return {player:publicPlayer(player)};
}
module.exports={changeAvatar};
