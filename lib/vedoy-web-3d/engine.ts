import * as THREE from "three";

/** Framework-independent Vedoy Web 3D Engine runtime. */
export type VedoyObject = {
  id: string;
  shape: "box" | "sphere" | "cylinder";
  color?: string;
  position?: [number, number, number];
  action?: { kind: "link" | "event"; value: string };
};
export type VedoyScene = { background?: string; objects: VedoyObject[] };
export class VedoyWeb3DEngine {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(65, 1, 0.1, 500);
  readonly renderer: THREE.WebGLRenderer;
  private observer: ResizeObserver;
  private frame = 0;
  private objects = new Map<string, THREE.Mesh>();
  private actions = new Map<string, VedoyObject["action"]>();
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private disposed = false;
  constructor(private element: HTMLElement, private onAction?: (id: string, action: NonNullable<VedoyObject["action"]>) => void) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    element.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
    this.camera.position.set(0, 2, 8);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(element);
    this.renderer.domElement.addEventListener("click", this.click);
    this.resize();
  }
  private click = (event: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects([...this.objects.values()])[0];
    const action = hit && this.actions.get(hit.object.name);
    if (action && hit) this.onAction?.(hit.object.name, action);
  };
  load(data: VedoyScene) {
    this.clear();
    this.scene.background = new THREE.Color(data.background ?? "#bfe6ee");
    for (const obj of data.objects) {
      if (this.objects.has(obj.id)) throw new Error("Duplicate object ID: " + obj.id);
      const geometry = obj.shape === "sphere" ? new THREE.SphereGeometry(0.6, 16, 12)
        : obj.shape === "cylinder" ? new THREE.CylinderGeometry(0.4, 0.5, 2, 12)
        : new THREE.BoxGeometry();
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: obj.color ?? "#64a96b" }));
      mesh.name = obj.id;
      mesh.position.set(...(obj.position ?? [0, 0, 0]));
      this.scene.add(mesh);
      this.objects.set(obj.id, mesh);
      if (obj.action) this.actions.set(obj.id, obj.action);
    }
    this.render();
  }
  setScrollProgress(value: number, start: THREE.Vector3, end: THREE.Vector3) {
    this.camera.position.copy(start).lerp(end, THREE.MathUtils.clamp(value, 0, 1));
    this.render();
  }
  start(update?: (deltaSeconds: number) => void) {
    this.stop();
    const clock = new THREE.Clock();
    const tick = () => {
      this.frame = requestAnimationFrame(tick);
      update?.(Math.min(clock.getDelta(), 0.1));
      this.render();
    };
    tick();
  }
  stop() { cancelAnimationFrame(this.frame); this.frame = 0; }
  render() { if (!this.disposed) this.renderer.render(this.scene, this.camera); }
  resize() {
    const w = Math.max(1, this.element.clientWidth), h = Math.max(1, this.element.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.render();
  }
  clear() {
    for (const mesh of this.objects.values()) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach(m => m.dispose());
    }
    this.objects.clear();
    this.actions.clear();
  }
  dispose() {
    if (this.disposed) return;
    this.stop();
    this.observer.disconnect();
    this.renderer.domElement.removeEventListener("click", this.click);
    this.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.disposed = true;
  }
}
