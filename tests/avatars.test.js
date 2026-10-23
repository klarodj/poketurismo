import{test}from'node:test';import assert from'node:assert/strict';import{readFileSync,existsSync}from'node:fs';
import{AVATARS,DEFAULT_AVATAR,LEGACY_AVATARS,avatarInfo,isAvatarId,isCreationAvatarId}from'../shared/avatarCatalog.mjs';
test('twenty distinct local portraits cover men and women without gameplay bonuses',()=>{
 assert.equal(AVATARS.length,20);assert.equal(AVATARS.filter(a=>a.gender==='uomo').length,10);assert.equal(AVATARS.filter(a=>a.gender==='donna').length,10);assert.equal(new Set(AVATARS.map(a=>a.id)).size,20);assert.ok(isAvatarId(DEFAULT_AVATAR));
 for(const a of AVATARS){assert.equal(avatarInfo(a.id),a);assert.deepEqual(Object.keys(a).sort(),['description','gender','id','image','name']);assert.ok(existsSync('public'+a.image));const png=readFileSync('public'+a.image);assert.equal(png.readUInt32BE(16),64);assert.equal(png.readUInt32BE(20),64);assert.ok(png.length<25000);}
 for(const old of LEGACY_AVATARS){assert.equal(isCreationAvatarId(old),true);assert.equal(isAvatarId(old),false);assert.equal(avatarInfo(old),null);}for(const bad of [null,{},'../../etc/passwd','https://evil.invalid/p.png','unknown'])assert.equal(isAvatarId(bad),false);
});
