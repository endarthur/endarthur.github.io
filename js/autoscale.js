/* global AFRAME, THREE */

AFRAME.registerComponent("autoscale", {
  schema: {type:"number", default: 1 },

  init: function () {
    var el = this.el;
    var self = this;
    this.el.addEventListener("model-loaded", function(){
      const box = new THREE.Box3().setFromObject(el.object3D);
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      el.object3D.scale.setScalar(self.data/sphere.radius);
    });
  },
});

AFRAME.registerComponent("autocenter", {
  schema: {type:"vec3", default: {x: 0, y: 0, z: 0} },

  init: function () {
    var el = this.el;
    var self = this;
    var offset = new THREE.Vector3();
    var box = new THREE.Box3();
    this.el.addEventListener("model-loaded", function(){
      box.setFromObject(el.object3D);
      box.getCenter(offset).setY(box.min.y).negate().add(self.data);
      el.object3D.position.add(offset);
    });
  },
});
