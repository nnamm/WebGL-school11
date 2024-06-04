import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

window.addEventListener(
  'DOMContentLoaded',
  () => {
    const wrapper = document.querySelector('#webgl');
    const app = new ThreeApp(wrapper);
    app.prepare();
    app.render();
  },
  false
);

class ThreeApp {
  // カメラ
  static CAMERA_PARAM = {
    fovy: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    position: new THREE.Vector3(4.0, -2.0, 4.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    defaultRotateSpeed: 2.0,
    HighRotateSpeed: 4.0,
  };

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
  static MATERIAL_PARAM = {
    color: 0xff8800,
  };

  // アニメーション
  static ANIME_PARAM = {
    defaultDuration: 300,
    highDuration: 50,
  };

  renderer;
  scene;
  camera;
  directionalLight;
  ambientLight;
  boxGeometory;
  material;
  oBox;
  boxes;
  positions;
  controls;
  index;
  duration;
  startTime;
  isDown;

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
    this.camera = new THREE.PerspectiveCamera(
      ThreeApp.CAMERA_PARAM.fovy,
      ThreeApp.CAMERA_PARAM.aspect,
      ThreeApp.CAMERA_PARAM.near,
      ThreeApp.CAMERA_PARAM.far
    );
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position);
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);

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

    // ボックス
    this.boxGeometory = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    this.material = new THREE.MeshPhongMaterial(ThreeApp.MATERIAL_PARAM.color);
    this.oBox = new THREE.Mesh(this.boxGeometory, this.material);
    this.scene.add(this.oBox);

    // 軸コントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.autoRotate = true;
    this.controls.enableDamping = true;

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
  prepare() {
    // 指定半径、指定ポイント数に応じた位置情報を生成
    this.positions = this._createSphericalPoints(3, 15);

    // 各PositionにniBoxを追加
    this.boxes = [];
    for (let i = 0; i < this.positions.length; i++) {
      const box = this.oBox.clone();
      box.position.copy(box.position);
      this.scene.add(box);
      this.boxes.push(box);
    }

    // アニメーション用の初期値
    this.index = 0;
    this.duration = ThreeApp.ANIME_PARAM.defaultDuration;
    this.startTime = Date.now();
  }

  /**
   * 描画処理
   */
  render() {
    requestAnimationFrame(this.render);
    this.controls.update();

    // 原点から各Positionへアニメメーション制御
    const now = Date.now();
    const elapsed = now - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);

    if (this.index < this.boxes.length) {
      const currentBox = this.boxes[this.index];
      this.scene.add(currentBox);

      const targetPosition = this.positions[this.index];
      const easedProgress = this._easeOutBack(progress);
      currentBox.position.lerpVectors(new THREE.Vector3(0.0, 0.0, 0.0), targetPosition, easedProgress);

      if (progress === 1) {
        this.index++;
        this.startTime = now;
      }
    }

    // スペースキー押下でスピード変更
    if (this.isDown === true) {
      this.controls.autoRotateSpeed = ThreeApp.CAMERA_PARAM.HighRotateSpeed;
      this.duration = ThreeApp.ANIME_PARAM.highDuration;
      this.oBox.rotation.x += 0.05;
      this.oBox.rotation.y += 0.05;
      this.boxes.forEach((box) => {
        box.rotation.x += 0.05;
        box.rotation.y += 0.05;
      });
    } else {
      this.controls.autoRotateSpeed = ThreeApp.CAMERA_PARAM.defaultRotateSpeed;
      this.duration = ThreeApp.ANIME_PARAM.defaultDuration;
      this.oBox.rotation.x += 0.01;
      this.oBox.rotation.y += 0.01;
      this.boxes.forEach((box) => {
        box.rotation.x += 0.01;
        box.rotation.y += 0.01;
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  _createSphericalPoints(radius, count) {
    const points = [];
    const phi_step = Math.PI / (count + 1);
    const theta_step = (2 * Math.PI) / count;

    for (let i = 1; i <= count; i++) {
      for (let j = 0; j < count; j++) {
        const phi = i * phi_step;
        const theta = j * theta_step;

        const point = new THREE.Vector3().setFromSphericalCoords(radius, phi, theta);
        points.push(point);
      }
    }
    return points;
  }

  _easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
}
