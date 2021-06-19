import { vec3 } from 'gl-matrix';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Icon from './Icon';
import Mouse from '../Utils/mouse';
import Camera from '../Utils/camera';
import Keyboard from '../Utils/keyboard';

import { clear } from '../Utils/webgl';
import { PlyModel } from '../Utils/plymodel';
import { DefaultShader } from '../Utils/shader';

export default class PlyPlayer extends Component {
  constructor(props) {
    super(props);

    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl');

    if (this.gl === null) {
      alert(
        'Unable to initialize WebGL. Your browser or machine may not support it.'
      );
      return;
    }

    this.shader = new DefaultShader(this.gl);
    this.model = null;
    this.animation = null;
    this.camera = new Camera({
      fov: 90,
      aspect: this.props.width / this.props.height,
      zNear: 0.1,
      zFar: 100.0,
      position: vec3.fromValues(0, 0, 15),
      speed: 0.5,
    });
    this.mouse = new Mouse();
    this.keyboard = new Keyboard();

    this.mouse.mouseMoveListeners.push(
      this.camera.onMouseMove.bind(this.camera)
    );
    window.addEventListener(
      'keydown',
      this.keyboard.onKeyDown.bind(this.keyboard)
    );
    window.addEventListener('keyup', this.keyboard.onKeyUp.bind(this.keyboard));

    this.state = {
      error: false,
      loading: true,
      url: this.props.url,
    };
  }

  moveCamera() {
    if (this.keyboard.isKeyPressed('KeyW')) {
      this.camera.moveForward();
    } else if (this.keyboard.isKeyPressed('KeyS')) {
      this.camera.moveBack();
    }

    if (this.keyboard.isKeyPressed('KeyA')) {
      this.camera.moveLeft();
    } else if (this.keyboard.isKeyPressed('KeyD')) {
      this.camera.moveRight();
    }
  }

  drawScene() {
    clear(this.gl);

    if (this.model) {
      this.shader.use();
      this.shader.setCamera(this.camera);

      this.model.render(this.gl, this.shader);
    }
  }

  updateViewport() {
    this.canvas.width = this.props.width;
    this.canvas.height = this.props.height;
    this.gl.viewport(0, 0, this.props.width, this.props.height);
  }

  gameLoop() {
    cancelAnimationFrame(this.animation);

    const loop = () => {
      this.moveCamera();
      this.camera.calculateMatrix();
      this.drawScene();
      this.animation = requestAnimationFrame(loop);
    };

    this.animation = requestAnimationFrame(loop);
  }

  async loadModel() {
    this.setState({
      loading: true
    });
    this.model = await PlyModel.loadModel(this.gl, this.props.url);
    this.setState({
      loading: false
    });
  }

  async componentDidMount() {
    this.canvas.addEventListener(
      'mousedown',
      this.mouse.onMouseDown.bind(this.mouse)
    );
    this.canvas.addEventListener(
      'mouseup',
      this.mouse.onMouseUp.bind(this.mouse)
    );
    this.canvas.addEventListener(
      'mousemove',
      this.mouse.onMouseMove.bind(this.mouse)
    );

    requestAnimationFrame(this.loadModel.bind(this));

    this.updateViewport();
    this.gameLoop();
    this.mount.appendChild(this.canvas);
  }

  componentDidUpdate() {
    if (this.props.url !== this.state.url) {
      requestAnimationFrame(this.loadModel.bind(this));
    }

    this.updateViewport();
  }

  render() {
    return (
      <div ref={ref => this.mount = ref} className='player'>
        {(this.state.loading) &&
          <div className='loading'>
            <Icon name='spinner' size='3x' spin={true} />
          </div>
        }
        {(this.state.error) &&
          <div className='error'>
            <div className='mb-2'><Icon name='exclamation-circle' size='3x'></Icon></div>
            <h5>Error occurred while loading.</h5>
          </div>
        }
      </div>
    );
  }
}

PlyPlayer.propTypes = {
  url: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
};
