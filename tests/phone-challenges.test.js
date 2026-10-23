import{test}from'node:test';import assert from'node:assert/strict';
import{challengeCarAllowed,challengeContacts}from'../src/logic/meetChallenges.mjs';
test('phone and piazzale use the same model or IP admission checks',()=>{
 assert.equal(challengeCarAllowed({format:'model',modelId:3},{modelId:3,performanceIndex:1}),true);assert.equal(challengeCarAllowed({format:'model',modelId:3},{modelId:4}),false);
 for(const ip of[50,59])assert.equal(challengeCarAllowed({format:'ip',minIP:50,maxIP:59},{performanceIndex:ip}),true);assert.equal(challengeCarAllowed({format:'ip',minIP:50,maxIP:59},{performanceIndex:60}),false);assert.equal(challengeCarAllowed({format:'model',modelId:3},null),false);
});
test('phone challenge picker excludes own, blocked and not-yet-reachable contacts',()=>{
 const contacts=[{id:1,canMessage:true},{id:2,blocked:true,canMessage:true},{id:3,canMessage:false},{id:4,canMessage:true},{id:5}];assert.deepEqual(challengeContacts(contacts,1).map(c=>c.id),[4,5]);assert.equal(contacts.length,5);
});
