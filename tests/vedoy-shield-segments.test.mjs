import test from 'node:test';
import assert from 'node:assert/strict';
import {createSegmentSecret, sealSegment, openSegment, sealMessageParts} from '../lib/vedoy-shield-segments.mjs';
const c='thread01', m='message01';
const keyA=createSegmentSecret(), keyB=createSegmentSecret();
function open(seg,key,partId){return openSegment(seg,key,{conversationId:c,messageId:m,partId});}
test('separate secrets can unlock only their own message parts',()=>{
  const parts=sealMessageParts(c,m,[
    {partId:'public',text:'Hei',secret:keyA},
    {partId:'private',text:'Dette er en privat del',secret:keyB}
  ]);
  assert.equal(open(parts[0],keyA,'public'),'Hei');
  assert.equal(open(parts[1],keyB,'private'),'Dette er en privat del');
  assert.throws(()=>open(parts[1],keyA,'private'));
  assert.throws(()=>open(parts[0],keyB,'public'));
});
test('tampered ciphertext and tag do not decrypt',()=>{
  const part=sealSegment({conversationId:c,messageId:m,partId:'p',text:'hei',secret:keyA});
  assert.throws(()=>open({...part,ciphertext:'AAAA'},keyA,'p'));
  assert.throws(()=>open({...part,tag:'AAAAAAAAAAAAAAAAAAAAAA'},keyA,'p'));
});
test('context binding prevents replay into another field or message',()=>{
  const p=sealSegment({conversationId:c,messageId:m,partId:'p',text:'secret',secret:keyA});
  assert.throws(()=>openSegment(p,keyA,{conversationId:c,messageId:m,partId:'q'}));
  assert.throws(()=>openSegment(p,keyA,{conversationId:c,messageId:'message02',partId:'p'}));
});
test('duplicate parts, invalid key, and oversized data fail',()=>{
  assert.throws(()=>sealMessageParts(c,m,[{partId:'a',text:'1',secret:keyA},{partId:'a',text:'2',secret:keyB}]));
  assert.throws(()=>sealSegment({conversationId:c,messageId:m,partId:'a',text:'text',secret:Buffer.alloc(8)}));
  assert.throws(()=>sealSegment({conversationId:c,messageId:m,partId:'a',text:'x'.repeat(40_000),secret:keyA}));
});
