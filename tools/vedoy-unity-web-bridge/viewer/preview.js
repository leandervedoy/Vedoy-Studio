import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const $ = id => document.getElementById(id);
const renderer = new THREE.WebGLRenderer({canvas: $('viewport'), antialias: true, alpha: true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0c171a');
scene.add(new THREE.HemisphereLight('#dffff0', '#526375', 2));
const sunlight = new THREE.DirectionalLight('#fefefe', 2);
sunlight.position.set(3, 8, 6); scene.add(sunlight);
const grid = new THREE.GridHelper(60, 60, '#3b786b', '#203839'); scene.add(grid);
const camera = new THREE.PerspectiveCamera(55, 1, .1, 2000);
camera.position.set(6, 5, 9);
const controls = new OrbitControls(camera, $('viewport'));
controls.enableDamping = true; controls.target.set(0, .5, 0);
let manifest = null, activeScene = null, metadata = new Map(), activeObjects = new Map();
let behaviors = [], currentGlb = null, glbUrl = null, currentModel = null;
const neutralColor = '#8dd1b5';
const size = new THREE.Vector2();
const temp = document.createElement('div');

function resetScene() {
  for (const object of activeObjects.values()) {
    if (object.parent) object.parent.remove(object);
    object.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
    });
  }
  activeObjects.clear(); behaviors = [];
  if (currentModel) { scene.remove(currentModel); currentModel = null; }
}

function uniqueName(objects, name) { return objects.filter(o => o.name === name); }
function buildPlaceholder(node) {
  const group = new THREE.Group(); group.name = node.name;
  const comp = node.components || [];
  const hasMesh = comp.some(c => c.kind === 'MeshFilter' || c.kind === 'SkinnedMeshRenderer');
  if (hasMesh) {
    const material = new THREE.MeshStandardMaterial({color: neutralColor, roughness:.68, metalness:.05});
    group.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material));
  }
  if (comp.some(c => c.kind === 'Light')) {
    const light = new THREE.PointLight('#d2f7ff', 8, 25); group.add(light);
  }
  const [x,y,z] = node.position || [0,0,0]; group.position.set(x,y,-z);
  const [qx,qy,qz,qw] = node.rotation || [0,0,0,1];
  group.quaternion.set(-qx,-qy,qz,qw);
  group.scale.fromArray(node.scale || [1,1,1]);
  group.visible = node.active !== false;
  group.userData.unityObjectId = node.id;
  return group;
}
function updateTree(nodes) {
  const list = $('tree'); list.replaceChildren();
  if (!nodes.length) {list.textContent = 'This scene contains no directly serialized GameObjects.';return;}
  const byId = new Map(nodes.map(n=>[n.id,n]));
  const depth = node => {let i=0, parent=node.parentId; const visited=new Set([node.id]); while(parent&&byId.has(parent)&&i<15&&!visited.has(parent)){visited.add(parent);i++;parent=byId.get(parent).parentId;}return i;};
  for (const node of nodes) {
    const button = document.createElement('button');button.type='button';
    const scripts=(node.components||[]).filter(c=>c.kind==='MonoBehaviour');
    button.textContent = `${node.components?.some(c=>c.kind==='MeshFilter')?'◈':'◇'} ${node.name}${scripts.length?'  ⌁':''}`;
    button.style.paddingLeft = `${10 + depth(node)*13}px`;
    button.title = node.id; button.addEventListener('click',()=>selectObject(node,button));
    list.appendChild(button);
  }
}
function addProperty(parent,key,value) {
  const wrapper=document.createElement('div');wrapper.className='property';
  const label=document.createElement('span'); label.textContent=key;
  const data=document.createElement('code'); data.textContent=typeof value==='string'?value:JSON.stringify(value);
  wrapper.append(label,data);parent.append(wrapper);
}
function selectObject(node,button) {
  for(const item of $('tree').querySelectorAll('button'))item.classList.remove('active');
  button.classList.add('active'); const box=$('inspector');box.replaceChildren();
  const name=document.createElement('h3');name.textContent=node.name;box.append(name);
  addProperty(box,'Unity fileID',node.unityFileId);
  addProperty(box,'Local position',node.position);
  addProperty(box,'Local rotation',node.rotation);
  const comp=(node.components||[]);
  for (const c of comp) {
    const h=document.createElement('div');h.className='property';
    const badge=document.createElement('span');badge.className='pill'+(c.kind==='MonoBehaviour'&&c.runtime!=='vedoyscript'?' warning':'');
    badge.textContent = c.kind==='MonoBehaviour' ? `${c.scriptName||'Unknown C#'} · ${c.runtime === 'vedoyscript' ? 'Web-adapted' : 'Unity only'}` : c.kind;
    h.append(badge);box.append(h);
    if (c.kind === 'MonoBehaviour') {
      addProperty(box,'Script source',c.script?.assetPath||'Unresolved GUID');
      addProperty(box,'GUID',c.script?.guid||'Unknown');
      addProperty(box,'Serialized fields',c.serializedFields||{});
    }
  }
}
function runStart(object,commands) {
  for (const command of commands||[]) {
    if (command.op==='color' && /^#[0-9a-fA-F]{6}$/.test(command.value)) {
      object.traverse(o => {if(o.isMesh && o.material?.color) o.material.color.set(command.value);});
    }
  }
}
function createBehaviors(node, target) {
  for (const c of node.components || []) {
    if (c.kind==='MonoBehaviour' && c.enabled && c.runtime==='vedoyscript' && c.program) {
      runStart(target,c.program.onStart);
      for (const command of c.program.onUpdate || []) {
        if (!['rotate','move'].includes(command.op))continue;
        if (!['x','y','z'].includes(command.axis) || !Number.isFinite(command.rate))continue;
        behaviors.push({object:target,command});
      }
    }
  }
}
function displayScene(selected) {
  resetScene(); activeScene=selected; const nodes=selected.nodes||[];
  metadata=new Map(nodes.map(n=>[n.id,n]));
  const objects=nodes.map(n=>[n.id,buildPlaceholder(n)]);
  for(const [id,object] of objects)activeObjects.set(id,object);
  for(const [id,object] of objects) {
    const node=metadata.get(id);
    const parent=activeObjects.get(node.parentId);
    if (parent && parent !== object) parent.add(object); else scene.add(object);
    createBehaviors(node,object);
  }
  updateTree(nodes);$('count').textContent=`${nodes.length} objects`;
  if (currentGlb) applyGlb(currentGlb);
}
function applyGlb(gltf) {
  if (currentModel) scene.remove(currentModel);
  currentModel = gltf.scene.clone(true);
  const nodes=activeScene?.nodes||[];
  // Do not bind by ambiguous names: class names or duplicate object names are not stable IDs.
  const glbNamed=[];currentModel.traverse(o=>{if(o.name)glbNamed.push(o);});
  const warning=[];
  for(const node of nodes) {
    const matches = glbNamed.filter(o=>o.name===node.name);
    if(matches.length===1 && uniqueName(nodes,node.name).length===1) {
      const native=activeObjects.get(node.id);
      if(native) native.visible = false;
      createBehaviors(node,matches[0]);
    } else if((node.components||[]).some(c=>c.kind==='MonoBehaviour'&&c.runtime==='vedoyscript')){
      warning.push(`Unable to safely bind script to GLB object '${node.name}': missing or duplicate names. Export stable IDs to glTF extras in a future build.`);
    }
  }
  scene.add(currentModel);
  if(warning.length)renderDiagnostics((manifest?.diagnostics||[]).concat(warning.map(message=>({severity:'warning',message}))));
}
function renderDiagnostics(items) {
  const box=$('diagnostics');box.replaceChildren();
  if (!items.length) {const li=document.createElement('li');li.textContent='No reported diagnostics (this does not guarantee Unity feature parity).';box.appendChild(li);return;}
  for (const entry of items.slice(0,250)) {
    const li=document.createElement('li');li.textContent=`[${entry.severity||'info'}] ${entry.scene||entry.file||''} ${entry.object||''} — ${entry.message||String(entry)}`;box.append(li);
  }
}
function loadManifest(data) {
  if(data.schema!=='vedoy.unity.scene.v1'||!Array.isArray(data.scenes))throw Error('Not a Vedoy Unity v1 manifest');
  manifest=data;const selector=$('scene');selector.replaceChildren();
  data.scenes.forEach((s,index)=>{const option=document.createElement('option');option.value=String(index);option.textContent=s.path;selector.appendChild(option);});
  selector.disabled=!data.scenes.length;
  if(data.scenes.length)displayScene(data.scenes[0]);else resetScene();
  renderDiagnostics(data.diagnostics||[]);$('status').textContent=`${data.scenes.length} scene(s) · ${(data.diagnostics||[]).length} diagnostic(s)`;
}
$('manifest').addEventListener('change', async event => {
  const file=event.target.files?.[0];if(!file)return;
  if(file.size>32*1024*1024){$('status').textContent='Manifest too large';return;}
  try {loadManifest(JSON.parse(await file.text()));}
  catch(error) {$('status').textContent=`Import failed: ${error.message}`;}
});
$('demo').addEventListener('click',async()=>{
  try {const response=await fetch('./demo.scene.vedoy.json');if(!response.ok)throw Error('Demo unavailable');
    loadManifest(await response.json());}catch(error){$('status').textContent=error.message;}
});
$('scene').addEventListener('change',event=>{const next=manifest?.scenes[Number(event.target.value)];if(next)displayScene(next);});
$('glb').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  if(file.size>100*1024*1024){$('status').textContent='GLB exceeds 100 MiB preview limit';return;}
  try {
    if(glbUrl)URL.revokeObjectURL(glbUrl);
    glbUrl=URL.createObjectURL(file);
    currentGlb=await new GLTFLoader().loadAsync(glbUrl);
    if(activeScene)displayScene(activeScene);
    $('status').textContent='GLB imported; check bindings and diagnostics';
  } catch(error) {$('status').textContent=`Unable to load GLB: ${error.message}`;}
});
const clock=new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  const delta=Math.min(clock.getDelta(),.05);
  for(const {object,command} of behaviors) {
    // Axis is Unity's local axis; Z and X handedness need translation in native mode.
    const axis = command.axis;
    const sign = axis==='z' ? -1 : 1;
    const value=(command.rate*delta)*sign;
    if(command.op==='rotate')object.rotation[axis]+=THREE.MathUtils.degToRad(value);
    if(command.op==='move')object.position[axis]+=value;
  }
  const rect=$('viewport').getBoundingClientRect();
  if(rect.width>0&&rect.height>0) {
    size.set(Math.floor(rect.width),Math.floor(rect.height));
    renderer.setSize(size.x,size.y,false);
    camera.aspect=size.x/size.y;camera.updateProjectionMatrix();
  }
  controls.update();renderer.render(scene,camera);
}
frame();
