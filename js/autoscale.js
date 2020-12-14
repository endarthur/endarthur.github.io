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
