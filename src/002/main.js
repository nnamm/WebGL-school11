import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

window.addEventListener(
  'DOMContentLoaded',
  () => {
    const wrapper = document.querySelector('#webgl');
    const app = new ThreeApp(wrapper);
    // app.prepare();
    app.render();
  },
  false
);

class ThreeApp {
  // カメラ
  // static CAMERA_PARAM = {
  //   fovy: 75,
  //   aspect: window.innerWidth / window.innerHeight,
  //   near: 0.1,
  //   far: 1000,
  //   position: new THREE.Vector3(4.0, -2.0, 4.0),
  //   lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  //   defaultRotateSpeed: 2.0,
  //   HighRotateSpeed: 4.0,
  // };
  // 切り取る空間の広さ
  static CAMERA_SCALE = 5.0;

  // レンダラー
  static RENDERER_PARAM = {
    clearColor: 0x333333,
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // 平行光源
  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 1.0,
    position: new THREE.Vector3(1.0, 1.0, 1.0),
  };

  // 環境光
  static AMBIENT_LIGHT_PARAM = {
    color: 0xffccff,
    intensity: 0.5,
  };

  // マテリアル
  static MATERIAL_PARAM1 = {
    color: 0xff8800,
    side: THREE.DoubleSide,
    wireframe: true,
  };
  static MATERIAL_PARAM2 = {
    color: 0x0088ff,
    side: THREE.DoubleSide,
    wireframe: true,
  };

  // アニメーション
  // static ANIME_PARAM = {
  //   defaultDuration: 300,
  //   highDuration: 50,
  // };

  renderer;
  scene;
  camera;
  directionalLight;
  ambientLight;
  planeGeometry;
  boxGeometory;
  ringGeometory1;
  ringGeometory2;
  ringGeometory3;
  capsuleGeometry;
  capsule;
  material1;
  material2;
  plane1;
  plane2;
  plane3;
  box1;
  box2;
  ring1;
  ring2;
  controls;
  isDown;
  axesHelper;
  group1;
  group2;
  group3;
  group4;

  /** コンストラクタ
   * @constructor
   * @param {HTMLElement} wrapper - canvas 要素を append する親要素
   */
  constructor(wrapper) {
    // レンダラー
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(color);
    this.renderer.setSize(ThreeApp.RENDERER_PARAM.width, ThreeApp.RENDERER_PARAM.height);
    wrapper.appendChild(this.renderer.domElement);

    // シーン
    this.scene = new THREE.Scene();

    // カメラ
    // this.camera = new THREE.PerspectiveCamera(
    //   ThreeApp.CAMERA_PARAM.fovy,
    //   ThreeApp.CAMERA_PARAM.aspect,
    //   ThreeApp.CAMERA_PARAM.near,
    //   ThreeApp.CAMERA_PARAM.far,
    // );
    // this.camera.position.copy(ThreeApp.CAMERA_PARAM.position);
    // this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);
    const cameraParameters = this.calcCameraParameters(ThreeApp.CAMERA_SCALE);
    this.camera = new THREE.OrthographicCamera(
      cameraParameters.left,
      cameraParameters.right,
      cameraParameters.top,
      cameraParameters.bottom,
      cameraParameters.near,
      cameraParameters.far
    );
    this.camera.position.copy(cameraParameters.position);
    this.camera.lookAt(cameraParameters.lookAt);

    // 平行光源
    this.directionalLight = new THREE.DirectionalLight(
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity
    );
    this.directionalLight.position.copy(ThreeApp.DIRECTIONAL_LIGHT_PARAM.position);
    this.scene.add(this.directionalLight);

    // 環境光
    this.ambientLight = new THREE.AmbientLight(
      ThreeApp.AMBIENT_LIGHT_PARAM.color,
      ThreeApp.AMBIENT_LIGHT_PARAM.intensity
    );
    this.scene.add(this.ambientLight);

    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    // Material
    this.material1 = new THREE.MeshBasicMaterial(ThreeApp.MATERIAL_PARAM1);
    this.material2 = new THREE.MeshBasicMaterial(ThreeApp.MATERIAL_PARAM2);

    // Planes - Stage
    this.planeGeometry = new THREE.PlaneGeometry(3, 3);

    this.plane1 = new THREE.Mesh(this.planeGeometry, this.material1);
    this.plane1.rotation.x = Math.PI / 2;
    this.plane2 = new THREE.Mesh(this.planeGeometry, this.material1);
    this.plane2.position.set(0.0, 1.5, -1.5);
    this.plane3 = new THREE.Mesh(this.planeGeometry, this.material1);
    this.plane3.rotation.y = Math.PI / 2;
    this.plane3.position.set(-1.5, 1.5, 0.0);

    this.group1 = new THREE.Group();
    this.group1.add(this.plane1);
    this.group1.add(this.plane2);
    this.group1.add(this.plane3);
    this.scene.add(this.group1);

    // Rings
    this.ringGeometory1 = new THREE.RingGeometry(1.0, 0.2, 1.0, 1.0, 0.0, 1.0);
    this.ringGeometory2 = new THREE.RingGeometry(1.0, 0.2, 1.0, 1.0, 2.0, 1.0);
    this.ringGeometory3 = new THREE.RingGeometry(1.0, 0.2, 1.0, 1.0, 4.0, 1.0);
    this.capsuleGeometry = new THREE.CapsuleGeometry(0.3,0.3,2,8);

    this.ring1 = new THREE.Mesh(this.ringGeometory1, this.material2);
    this.ring2 = new THREE.Mesh(this.ringGeometory2, this.material2);
    this.ring3 = new THREE.Mesh(this.ringGeometory3, this.material2);
    this.capsule = new THREE.Mesh(this.capsuleGeometry, this.material2);
    this.capsule.rotation.x = Math.PI / 2;

    this.group2 = new THREE.Group();
    this.group2.add(this.ring1);
    this.group2.add(this.ring2);
    this.group2.add(this.ring3);
    this.group2.add(this.capsule);
    this.scene.add(this.group2);

    const axesBarLength = 5.0;
    this.axesHelper = new THREE.AxesHelper(axesBarLength);
    this.scene.add(this.axesHelper);

    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

    // 軸コントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.autoRotate = true;
    // this.controls.enableDamping = true;

    // バインド
    this.render = this.render.bind(this);

    // キー押下フラグとキー用のイベントリスナー
    this.isDown = false;
    window.addEventListener(
      'keydown',
      (KeyEvent) => {
        switch (KeyEvent.key) {
          case ' ':
            this.isDown = true;
            break;
          default:
        }
      },
      false
    );
    window.addEventListener(
      'keyup',
      (KeyEvent) => {
        this.isDown = false;
      },
      false
    );

    // リサイズイベント
    window.addEventListener(
      'resize',
      () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        // おまじない
        this.camera.updateProjectionMatrix();
      },
      false
    );
  }

  /**
   * 描画準備処理
   */
  // prepare() {
  //   // 指定半径、指定ポイント数に応じた位置情報を生成
  //   this.positions = this._createSphericalPoints(3, 15);
  //
  //   // 各PositionにniBoxを追加
  //   this.boxes = [];
  //   for (let i = 0; i < this.positions.length; i++) {
  //     const box = this.oBox.clone();
  //     box.position.copy(box.position);
  //     this.scene.add(box);
  //     this.boxes.push(box);
  //   }
  //
  //   // アニメーション用の初期値
  //   this.index = 0;
  //   this.duration = ThreeApp.ANIME_PARAM.defaultDuration;
  //   this.startTime = Date.now();
  // }

  /**
   * 描画処理
   */
  render() {
    requestAnimationFrame(this.render);
    this.controls.update();

    // スペースキー押下でスピード変更
    if (this.isDown === true) {
      // this.group1.rotation.z += 0.2;
      this.group1.visible = false;
      this.group2.rotation.z += 0.15;
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * OrthographicCameraの設定処理
   */
  calcCameraParameters(scale) {
    const aspect = window.innerWidth / window.innerHeight;
    const horizontal = scale * aspect;
    const vertical = scale;
    return {
      left: -horizontal,
      right: horizontal,
      top: vertical,
      bottom: -vertical,
      near: 0.1,
      far: 50.0,
      position: new THREE.Vector3(0.0, 0.0, 20.0),
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    };
  }
}
