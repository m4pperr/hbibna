"use client";

import React, {
  useEffect,
  useRef,
  forwardRef,
  useState,
  useCallback,
  useMemo,
  useSyncExternalStore,
  memo,
} from "react";

var vertexShaderSource = `#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  // ===================================================

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  // ===================================================

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  v_patternUV *= .01;

  // ===================================================

  vec2 imageBoxSize;
  if (u_fit == 1.) {
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) {
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`;

var DEFAULT_MAX_PIXEL_COUNT = 1920 * 1080 * 4;

var ShaderMount = class {
  parentElement: HTMLElement;
  canvasElement: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  program: WebGLProgram | null = null;
  uniformLocations: Record<string, WebGLUniformLocation | null> = {};
  fragmentShader: string;
  rafId: number | null = null;
  lastRenderTime = 0;
  currentFrame = 0;
  speed = 0;
  currentSpeed = 0;
  providedUniforms: Record<string, any>;
  mipmaps: string[] = [];
  hasBeenDisposed = false;
  resolutionChanged = true;
  textures = new Map<string, WebGLTexture>();
  minPixelRatio: number;
  maxPixelCount: number;
  isSafari = isSafari();
  uniformCache: Record<string, any> = {};
  textureUnitMap = new Map<string, number>();

  renderScale = 1;
  parentWidth = 0;
  parentHeight = 0;
  parentDevicePixelWidth = 0;
  parentDevicePixelHeight = 0;
  devicePixelsSupported = false;
  resizeObserver: ResizeObserver | null = null;

  constructor(
    parentElement: HTMLElement,
    fragmentShader: string,
    uniforms: Record<string, any>,
    webGlContextAttributes?: WebGLContextAttributes,
    speed = 0,
    frame = 0,
    minPixelRatio = 2,
    maxPixelCount = DEFAULT_MAX_PIXEL_COUNT,
    mipmaps: string[] = []
  ) {
    if (parentElement instanceof HTMLElement) {
      this.parentElement = parentElement;
    } else {
      throw new Error("Paper Shaders: parent element must be an HTMLElement");
    }
    if (!document.querySelector("style[data-paper-shader]")) {
      const styleElement = document.createElement("style");
      styleElement.innerHTML = defaultStyle;
      styleElement.setAttribute("data-paper-shader", "");
      document.head.prepend(styleElement);
    }
    const canvasElement = document.createElement("canvas");
    this.canvasElement = canvasElement;
    this.parentElement.prepend(canvasElement);
    this.fragmentShader = fragmentShader;
    this.providedUniforms = uniforms;
    this.mipmaps = mipmaps;
    this.currentFrame = frame;
    this.minPixelRatio = minPixelRatio;
    this.maxPixelCount = maxPixelCount;
    const gl = canvasElement.getContext("webgl2", webGlContextAttributes);
    if (!gl) {
      throw new Error("Paper Shaders: WebGL is not supported in this browser");
    }
    this.gl = gl;
    this.initProgram();
    this.setupPositionAttribute();
    this.setupUniforms();
    this.setUniformValues(this.providedUniforms);
    this.setupResizeObserver();
    window.visualViewport?.addEventListener("resize", this.handleVisualViewportChange);
    this.setSpeed(speed);
    this.parentElement.setAttribute("data-paper-shader", "");
    (this.parentElement as any).paperShaderMount = this;
    document.addEventListener("visibilitychange", this.handleDocumentVisibilityChange);
  }

  initProgram = () => {
    const program = createProgram(this.gl, vertexShaderSource, this.fragmentShader);
    if (!program) return;
    this.program = program;
  };

  setupPositionAttribute = () => {
    const positionAttributeLocation = this.gl.getAttribLocation(this.program!, "a_position");
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(positionAttributeLocation);
    this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
  };

  setupUniforms = () => {
    const uniformLocations: Record<string, WebGLUniformLocation | null> = {
      u_time: this.gl.getUniformLocation(this.program!, "u_time"),
      u_pixelRatio: this.gl.getUniformLocation(this.program!, "u_pixelRatio"),
      u_resolution: this.gl.getUniformLocation(this.program!, "u_resolution"),
    };
    Object.entries(this.providedUniforms).forEach(([key, value]) => {
      uniformLocations[key] = this.gl.getUniformLocation(this.program!, key);
      if (typeof window !== "undefined" && value instanceof HTMLImageElement) {
        const aspectRatioUniformName = `${key}AspectRatio`;
        uniformLocations[aspectRatioUniformName] = this.gl.getUniformLocation(
          this.program!,
          aspectRatioUniformName
        );
      }
    });
    this.uniformLocations = uniformLocations;
  };

  setupResizeObserver = () => {
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (entry?.borderBoxSize[0]) {
        const physicalPixelSize = (entry as any).devicePixelContentBoxSize?.[0];
        if (physicalPixelSize !== void 0) {
          this.devicePixelsSupported = true;
          this.parentDevicePixelWidth = physicalPixelSize.inlineSize;
          this.parentDevicePixelHeight = physicalPixelSize.blockSize;
        }
        this.parentWidth = entry.borderBoxSize[0].inlineSize;
        this.parentHeight = entry.borderBoxSize[0].blockSize;
      }
      this.handleResize();
    });
    this.resizeObserver.observe(this.parentElement);
  };

  handleVisualViewportChange = () => {
    this.resizeObserver?.disconnect();
    this.setupResizeObserver();
  };

  handleResize = () => {
    let targetPixelWidth = 0;
    let targetPixelHeight = 0;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const pinchZoom = window.visualViewport?.scale ?? 1;
    if (this.devicePixelsSupported) {
      const scaleToMeetMinPixelRatio = Math.max(1, this.minPixelRatio / dpr);
      targetPixelWidth = this.parentDevicePixelWidth * scaleToMeetMinPixelRatio * pinchZoom;
      targetPixelHeight = this.parentDevicePixelHeight * scaleToMeetMinPixelRatio * pinchZoom;
    } else {
      let targetRenderScale = Math.max(dpr, this.minPixelRatio) * pinchZoom;
      if (this.isSafari) {
        const zoomLevel = bestGuessBrowserZoom();
        targetRenderScale *= Math.max(1, zoomLevel);
      }
      targetPixelWidth = Math.round(this.parentWidth) * targetRenderScale;
      targetPixelHeight = Math.round(this.parentHeight) * targetRenderScale;
    }
    const maxPixelCountHeadroom =
      Math.sqrt(this.maxPixelCount) / Math.sqrt(Math.max(1, targetPixelWidth * targetPixelHeight));
    const scaleToMeetMaxPixelCount = Math.min(1, maxPixelCountHeadroom);
    const newWidth = Math.max(1, Math.round(targetPixelWidth * scaleToMeetMaxPixelCount));
    const newHeight = Math.max(1, Math.round(targetPixelHeight * scaleToMeetMaxPixelCount));
    const newRenderScale = newWidth / Math.max(1, Math.round(this.parentWidth));
    if (
      this.canvasElement.width !== newWidth ||
      this.canvasElement.height !== newHeight ||
      this.renderScale !== newRenderScale
    ) {
      this.renderScale = newRenderScale;
      this.canvasElement.width = newWidth;
      this.canvasElement.height = newHeight;
      this.resolutionChanged = true;
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      this.render(performance.now());
    }
  };

  render = (currentTime: number) => {
    if (this.hasBeenDisposed) return;
    if (this.program === null) return;
    const dt = currentTime - this.lastRenderTime;
    this.lastRenderTime = currentTime;
    if (this.currentSpeed !== 0) {
      this.currentFrame += dt * this.currentSpeed;
    }
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);
    if (this.uniformLocations.u_time) {
      this.gl.uniform1f(this.uniformLocations.u_time, this.currentFrame * 1e-3);
    }
    if (this.resolutionChanged) {
      if (this.uniformLocations.u_resolution) {
        this.gl.uniform2f(
          this.uniformLocations.u_resolution,
          this.gl.canvas.width,
          this.gl.canvas.height
        );
      }
      if (this.uniformLocations.u_pixelRatio) {
        this.gl.uniform1f(this.uniformLocations.u_pixelRatio, this.renderScale);
      }
      this.resolutionChanged = false;
    }
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    if (this.currentSpeed !== 0) {
      this.requestRender();
    } else {
      this.rafId = null;
    }
  };

  requestRender = () => {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(this.render);
  };

  setTextureUniform = (uniformName: string, image: HTMLImageElement) => {
    if (!image.complete || image.naturalWidth === 0) {
      return;
    }
    const existingTexture = this.textures.get(uniformName);
    if (existingTexture) {
      this.gl.deleteTexture(existingTexture);
    }
    if (!this.textureUnitMap.has(uniformName)) {
      this.textureUnitMap.set(uniformName, this.textureUnitMap.size);
    }
    const textureUnit = this.textureUnitMap.get(uniformName)!;
    this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
    const texture = this.gl.createTexture();
    if (!texture) return;
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      image
    );
    if (this.mipmaps.includes(uniformName)) {
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER,
        this.gl.LINEAR_MIPMAP_LINEAR
      );
    }
    this.textures.set(uniformName, texture);
    const location = this.uniformLocations[uniformName];
    if (location) {
      this.gl.uniform1i(location, textureUnit);
      const aspectRatioUniformName = `${uniformName}AspectRatio`;
      const aspectRatioLocation = this.uniformLocations[aspectRatioUniformName];
      if (aspectRatioLocation) {
        const aspectRatio = image.naturalWidth / image.naturalHeight;
        this.gl.uniform1f(aspectRatioLocation, aspectRatio);
      }
    }
  };

  areUniformValuesEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
      return a.every((val, i) => this.areUniformValuesEqual(val, b[i]));
    }
    return false;
  };

  setUniformValues = (updatedUniforms: Record<string, any>) => {
    if (!this.program) return;
    this.gl.useProgram(this.program);
    Object.entries(updatedUniforms).forEach(([key, value]) => {
      let cacheValue = value;
      if (typeof window !== "undefined" && value instanceof HTMLImageElement) {
        cacheValue = `${value.src.slice(0, 200)}|${value.naturalWidth}x${value.naturalHeight}`;
      }
      if (this.areUniformValuesEqual(this.uniformCache[key], cacheValue)) return;
      this.uniformCache[key] = cacheValue;
      const location = this.uniformLocations[key];
      if (!location) return;

      if (typeof window !== "undefined" && value instanceof HTMLImageElement) {
        this.setTextureUniform(key, value);
      } else if (Array.isArray(value)) {
        let flatArray: any = null;
        let valueLength: any = null;
        if (value[0] !== void 0 && Array.isArray(value[0])) {
          const firstChildLength = value[0].length;
          if (value.every((arr) => arr.length === firstChildLength)) {
            flatArray = value.flat();
            valueLength = firstChildLength;
          } else {
            return;
          }
        } else {
          flatArray = value;
          valueLength = flatArray.length;
        }
        switch (valueLength) {
          case 2:
            this.gl.uniform2fv(location, flatArray);
            break;
          case 3:
            this.gl.uniform3fv(location, flatArray);
            break;
          case 4:
            this.gl.uniform4fv(location, flatArray);
            break;
          case 9:
            this.gl.uniformMatrix3fv(location, false, flatArray);
            break;
          case 16:
            this.gl.uniformMatrix4fv(location, false, flatArray);
            break;
        }
      } else if (typeof value === "number") {
        this.gl.uniform1f(location, value);
      } else if (typeof value === "boolean") {
        this.gl.uniform1i(location, value ? 1 : 0);
      }
    });
  };

  setSpeed = (newSpeed = 1) => {
    this.speed = newSpeed;
    this.setCurrentSpeed(typeof document !== "undefined" && document.hidden ? 0 : newSpeed);
  };

  setCurrentSpeed = (newSpeed: number) => {
    this.currentSpeed = newSpeed;
    if (this.rafId === null && newSpeed !== 0) {
      this.lastRenderTime = performance.now();
      this.rafId = requestAnimationFrame(this.render);
    }
    if (this.rafId !== null && newSpeed === 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  setMaxPixelCount = (newMaxPixelCount = DEFAULT_MAX_PIXEL_COUNT) => {
    this.maxPixelCount = newMaxPixelCount;
    this.handleResize();
  };

  setMinPixelRatio = (newMinPixelRatio = 2) => {
    this.minPixelRatio = newMinPixelRatio;
    this.handleResize();
  };

  setUniforms = (newUniforms: Record<string, any>) => {
    this.setUniformValues(newUniforms);
    this.providedUniforms = { ...this.providedUniforms, ...newUniforms };
    this.render(performance.now());
  };

  handleDocumentVisibilityChange = () => {
    this.setCurrentSpeed(document.hidden ? 0 : this.speed);
  };

  dispose = () => {
    this.hasBeenDisposed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.gl && this.program) {
      this.textures.forEach((texture) => {
        this.gl.deleteTexture(texture);
      });
      this.textures.clear();
      this.gl.deleteProgram(this.program);
      this.program = null;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    window.visualViewport?.removeEventListener("resize", this.handleVisualViewportChange);
    document.removeEventListener("visibilitychange", this.handleDocumentVisibilityChange);
    this.uniformLocations = {};
    this.canvasElement.remove();
    delete (this.parentElement as any).paperShaderMount;
  };
};

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertexShaderSource2: string, fragmentShaderSource: string) {
  const format = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
  const precision = format ? format.precision : null;
  if (precision && precision < 23) {
    vertexShaderSource2 = vertexShaderSource2.replace(/precision\s+(lowp|mediump)\s+float;/g, "precision highp float;");
    fragmentShaderSource = fragmentShaderSource.replace(/precision\s+(lowp|mediump)\s+float/g, "precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g, "$1 highp $3");
  }
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource2);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  return program;
}

var defaultStyle = `@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;

    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
    }
  }
}`;

function isSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("safari") && !ua.includes("chrome") && !ua.includes("android");
}

function bestGuessBrowserZoom() {
  if (typeof window === "undefined") return 1;
  const viewportScale = window.visualViewport?.scale ?? 1;
  const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  const innerWidth = viewportScale * viewportWidth + scrollbarWidth;
  const ratio = window.outerWidth / innerWidth;
  return ratio;
}

var defaultObjectSizing = {
  fit: "contain",
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  originX: 0.5,
  originY: 0.5,
  worldWidth: 0,
  worldHeight: 0
};

var defaultPatternSizing = {
  fit: "none",
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  originX: 0.5,
  originY: 0.5,
  worldWidth: 0,
  worldHeight: 0
};

var ShaderFitOptions: Record<string, number> = {
  none: 0,
  contain: 1,
  cover: 2
};

var declarePI = `
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`;

var proceduralHash11 = `
  float hash11(float p) {
    p = fract(p * 0.3183099) + 0.1;
    p *= p + 19.19;
    return fract(p * p);
  }
`;

var proceduralHash21 = `
  float hash21(vec2 p) {
    p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }
`;

var simplexNoise = `
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

var ditheringFragmentShader = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

uniform float u_pxSize;
uniform vec4 u_colorBack;
uniform vec4 u_colorFront;
uniform float u_shape;
uniform float u_type;

out vec4 fragColor;

${simplexNoise}
${declarePI}
${proceduralHash11}
${proceduralHash21}

float getSimplexNoise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));
  return noise;
}

const int bayer2x2[4] = int[4](0, 2, 3, 1);
const int bayer4x4[16] = int[16](
0, 8, 2, 10,
12, 4, 14, 6,
3, 11, 1, 9,
15, 7, 13, 5
);

const int bayer8x8[64] = int[64](
0, 32, 8, 40, 2, 34, 10, 42,
48, 16, 56, 24, 50, 18, 58, 26,
12, 44, 4, 36, 14, 46, 6, 38,
60, 28, 52, 20, 62, 30, 54, 22,
3, 35, 11, 43, 1, 33, 9, 41,
51, 19, 59, 27, 49, 17, 57, 25,
15, 47, 7, 39, 13, 45, 5, 37,
63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(fract(uv / float(size)) * float(size));
  int index = pos.y * size + pos.x;

  if (size == 2) {
    return float(bayer2x2[index]) / 4.0;
  } else if (size == 4) {
    return float(bayer4x4[index]) / 16.0;
  } else if (size == 8) {
    return float(bayer8x8[index]) / 64.0;
  }
  return 0.0;
}

void main() {
  float t = .5 * u_time;

  float pxSize = u_pxSize * u_pixelRatio;
  vec2 pxSizeUV = gl_FragCoord.xy - .5 * u_resolution;
  pxSizeUV /= pxSize;
  vec2 canvasPixelizedUV = (floor(pxSizeUV) + .5) * pxSize;
  vec2 normalizedUV = canvasPixelizedUV / u_resolution;

  vec2 ditheringNoiseUV = canvasPixelizedUV;
  vec2 shapeUV = normalizedUV;

  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * PI / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 boxSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  
  if (u_shape > 3.5) {
    vec2 objectBoxSize = vec2(0.);
    objectBoxSize.x = min(boxSize.x, boxSize.y);
    if (u_fit == 1.) {
      objectBoxSize.x = min(u_resolution.x, u_resolution.y);
    } else if (u_fit == 2.) {
      objectBoxSize.x = max(u_resolution.x, u_resolution.y);
    }
    objectBoxSize.y = objectBoxSize.x;
    vec2 objectWorldScale = u_resolution.xy / objectBoxSize;

    shapeUV *= objectWorldScale;
    shapeUV += boxOrigin * (objectWorldScale - 1.);
    shapeUV += vec2(-u_offsetX, u_offsetY);
    shapeUV /= u_scale;
    shapeUV = graphicRotation * shapeUV;
  } else {
    vec2 patternBoxSize = vec2(0.);
    patternBoxSize.x = patternBoxRatio * min(boxSize.x / patternBoxRatio, boxSize.y);
    float patternWorldNoFitBoxWidth = patternBoxSize.x;
    if (u_fit == 1.) {
      patternBoxSize.x = patternBoxRatio * min(u_resolution.x / patternBoxRatio, u_resolution.y);
    } else if (u_fit == 2.) {
      patternBoxSize.x = patternBoxRatio * max(u_resolution.x / patternBoxRatio, u_resolution.y);
    }
    patternBoxSize.y = patternBoxSize.x / patternBoxRatio;
    vec2 patternWorldScale = u_resolution.xy / patternBoxSize;

    shapeUV += vec2(-u_offsetX, u_offsetY) / patternWorldScale;
    shapeUV += boxOrigin;
    shapeUV -= boxOrigin / patternWorldScale;
    shapeUV *= u_resolution.xy;
    shapeUV /= u_pixelRatio;
    if (u_fit > 0.) {
      shapeUV *= (patternWorldNoFitBoxWidth / patternBoxSize.x);
    }
    shapeUV /= u_scale;
    shapeUV = graphicRotation * shapeUV;
    shapeUV += boxOrigin / patternWorldScale;
    shapeUV -= boxOrigin;
    shapeUV += .5;
  }

  float shape = 0.;
  if (u_shape < 1.5) {
    shapeUV *= .001;
    shape = 0.5 + 0.5 * getSimplexNoise(shapeUV, t);
    shape = smoothstep(0.3, 0.9, shape);
  } else if (u_shape < 2.5) {
    shapeUV *= .003;
    for (float i = 1.0; i < 6.0; i++) {
      shapeUV.x += 0.6 / i * cos(i * 2.5 * shapeUV.y + t);
      shapeUV.y += 0.6 / i * cos(i * 1.5 * shapeUV.x + t);
    }
    shape = .15 / max(0.001, abs(sin(t - shapeUV.y - shapeUV.x)));
    shape = smoothstep(0.02, 1., shape);
  } else if (u_shape < 3.5) {
    shapeUV *= .05;
    float stripeIdx = floor(2. * shapeUV.x / TWO_PI);
    float rand = hash11(stripeIdx * 10.);
    rand = sign(rand - .5) * pow(.1 + abs(rand), .4);
    shape = sin(shapeUV.x) * cos(shapeUV.y - 5. * rand * t);
    shape = pow(abs(shape), 6.);
  } else if (u_shape < 4.5) {
    shapeUV *= 4.;
    float wave = cos(.5 * shapeUV.x - 2. * t) * sin(1.5 * shapeUV.x + t) * (.75 + .25 * cos(3. * t));
    shape = 1. - smoothstep(-1., 1., shapeUV.y + wave);
  } else if (u_shape < 5.5) {
    float dist = length(shapeUV);
    float waves = sin(pow(dist, 1.7) * 7. - 3. * t) * .5 + .5;
    shape = waves;
  } else if (u_shape < 6.5) {
    float l = length(shapeUV);
    float angle = 6. * atan(shapeUV.y, shapeUV.x) + 4. * t;
    float twist = 1.2;
    float offset = 1. / pow(max(l, 1e-6), twist) + angle / TWO_PI;
    float mid = smoothstep(0., 1., pow(l, twist));
    shape = mix(0., fract(offset), mid);
  } else {
    shapeUV *= 2.;
    float d = 1. - pow(length(shapeUV), 2.);
    vec3 pos = vec3(shapeUV, sqrt(max(0., d)));
    vec3 lightPos = normalize(vec3(cos(1.5 * t), .8, sin(1.25 * t)));
    shape = .5 + .5 * dot(lightPos, pos);
    shape *= step(0., d);
  }

  int type = int(floor(u_type));
  float dithering = 0.0;

  switch (type) {
    case 1: {
      dithering = step(hash21(ditheringNoiseUV), shape);
    } break;
    case 2:
    dithering = getBayerValue(pxSizeUV, 2);
    break;
    case 3:
    dithering = getBayerValue(pxSizeUV, 4);
    break;
    default :
    dithering = getBayerValue(pxSizeUV, 8);
    break;
  }

  dithering -= .5;
  float res = step(.5, shape + dithering);

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  fragColor = vec4(color, opacity);
}
`;

var DitheringShapes: Record<string, number> = {
  simplex: 1,
  warp: 2,
  dots: 3,
  wave: 4,
  ripple: 5,
  swirl: 6,
  sphere: 7
};

var DitheringTypes: Record<string, number> = {
  "random": 1,
  "2x2": 2,
  "4x4": 3,
  "8x8": 4
};

function getShaderColorFromString(colorString: any) {
  if (Array.isArray(colorString)) {
    if (colorString.length === 4) return colorString;
    if (colorString.length === 3) return [...colorString, 1];
    return fallbackColor;
  }
  if (typeof colorString !== "string") {
    return fallbackColor;
  }
  let r = 0, g = 0, b = 0, a = 1;
  if (colorString.startsWith("#")) {
    [r, g, b, a] = hexToRgba(colorString);
  } else if (colorString.startsWith("rgb")) {
    [r, g, b, a] = parseRgba(colorString);
  } else if (colorString.startsWith("hsl")) {
    [r, g, b, a] = hslaToRgba(parseHsla(colorString));
  } else {
    return fallbackColor;
  }
  return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)];
}

function hexToRgba(hex: string): [number, number, number, number] {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map((char) => char + char).join("");
  }
  if (hex.length === 6) {
    hex = hex + "ff";
  }
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const a = parseInt(hex.slice(6, 8), 16) / 255;
  return [r, g, b, a];
}

function parseRgba(rgba: string): [number, number, number, number] {
  const match = rgba.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i);
  if (!match) return [0, 0, 0, 1];
  return [
    parseInt(match[1] ?? "0") / 255,
    parseInt(match[2] ?? "0") / 255,
    parseInt(match[3] ?? "0") / 255,
    match[4] === void 0 ? 1 : parseFloat(match[4])
  ];
}

function parseHsla(hsla: string): [number, number, number, number] {
  const match = hsla.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i);
  if (!match) return [0, 0, 0, 1];
  return [
    parseInt(match[1] ?? "0"),
    parseInt(match[2] ?? "0"),
    parseInt(match[3] ?? "0"),
    match[4] === void 0 ? 1 : parseFloat(match[4])
  ];
}

function hslaToRgba([h, s, l, a]: [number, number, number, number]): [number, number, number, number] {
  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = lDecimal;
  } else {
    const hue2rgb = (p2: number, q2: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
      if (t < 1 / 2) return q2;
      if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6;
      return p2;
    };
    const q = lDecimal < 0.5 ? lDecimal * (1 + sDecimal) : lDecimal + sDecimal - lDecimal * sDecimal;
    const p = 2 * lDecimal - q;
    r = hue2rgb(p, q, hDecimal + 1 / 3);
    g = hue2rgb(p, q, hDecimal);
    b = hue2rgb(p, q, hDecimal - 1 / 3);
  }
  return [r, g, b, a];
}

var clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
var fallbackColor = [0, 0, 0, 1];

function useMergeRefs(refs: any[]) {
  const cleanupRef = useRef<any>(void 0);
  const refEffect = useCallback((instance: any) => {
    const cleanups = refs.map((ref) => {
      if (ref == null) return;
      if (typeof ref === "function") {
        const refCallback = ref;
        const refCleanup = refCallback(instance);
        return typeof refCleanup === "function" ? refCleanup : () => refCallback(null);
      }
      ref.current = instance;
      return () => {
        ref.current = null;
      };
    });
    return () => {
      cleanups.forEach((refCleanup) => refCleanup?.());
    };
  }, refs);
  return useMemo(() => {
    if (refs.every((ref) => ref == null)) return null;
    return (value: any) => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = void 0;
      }
      if (value != null) {
        cleanupRef.current = refEffect(value);
      }
    };
  }, refs);
}

var ShaderMount2 = forwardRef(function ShaderMountImpl(
  {
    fragmentShader,
    uniforms: uniformsProp,
    webGlContextAttributes,
    speed = 0,
    frame = 0,
    width,
    height,
    minPixelRatio,
    maxPixelCount,
    mipmaps,
    style,
    ...divProps
  }: any,
  forwardedRef
) {
  const [isInitialized, setIsInitialized] = useState(false);
  const divRef = useRef<any>(null);
  const shaderMountRef = useRef<any>(null);
  const webGlContextAttributesRef = useRef(webGlContextAttributes);

  useEffect(() => {
    const initShader = async () => {
      if (divRef.current && !shaderMountRef.current) {
        shaderMountRef.current = new ShaderMount(
          divRef.current,
          fragmentShader,
          uniformsProp,
          webGlContextAttributesRef.current,
          speed,
          frame,
          minPixelRatio,
          maxPixelCount,
          mipmaps
        );
        setIsInitialized(true);
      }
    };
    initShader();
    return () => {
      shaderMountRef.current?.dispose();
      shaderMountRef.current = null;
    };
  }, [fragmentShader]);

  useEffect(() => {
    if (isInitialized && shaderMountRef.current) {
      shaderMountRef.current.setUniforms(uniformsProp);
    }
  }, [uniformsProp, isInitialized]);

  useEffect(() => {
    shaderMountRef.current?.setSpeed(speed);
  }, [speed, isInitialized]);

  const mergedRef = useMergeRefs([divRef, forwardedRef]);

  return (
    <div
      ref={mergedRef}
      style={{
        width: typeof width === "string" && !isNaN(+width) ? +width : width,
        height: typeof height === "string" && !isNaN(+height) ? +height : height,
        ...style,
      }}
      {...divProps}
    />
  );
});
ShaderMount2.displayName = "ShaderMount";

var defaultPreset = {
  name: "Default",
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    scale: 0.6,
    colorBack: "#000000",
    colorFront: "#FFE600",
    shape: "wave",
    type: "4x4",
    size: 2
  }
};

var Dithering = memo(function DitheringImpl({
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colorFront = defaultPreset.params.colorFront,
  shape = defaultPreset.params.shape,
  type = defaultPreset.params.type,
  pxSize,
  size = pxSize === void 0 ? defaultPreset.params.size : pxSize,
  fit = defaultPreset.params.fit,
  scale = defaultPreset.params.scale,
  rotation = defaultPreset.params.rotation,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  ...props
}: any) {
  const uniforms = {
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorFront: getShaderColorFromString(colorFront),
    u_shape: DitheringShapes[shape] ?? 4,
    u_type: DitheringTypes[type] ?? 3,
    u_pxSize: size,
    u_fit: ShaderFitOptions[fit] ?? 1,
    u_scale: scale,
    u_rotation: rotation,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight
  };
  return <ShaderMount2 {...props} speed={speed} frame={frame} fragmentShader={ditheringFragmentShader} uniforms={uniforms} />;
});

var REF = 741;
var TICKET_GEOMETRY = {
  aspect: 741 / 425,
  cornerRadius: 25 / REF,
  notchRadius: 21 / REF,
  perforation: 562 / REF
};

var TICKET_LAYOUT = {
  padding: 57 / REF,
  labelTop: 58 / REF,
  labelSize: 19.72 / REF,
  labelLead: 28 / REF,
  labelTracking: 0.016,
  nameTop: 175 / REF,
  nameSize: 62 / REF,
  nameLead: 62 / REF,
  nameTracking: -0.01,
  footerTop: 348 / REF,
  footerSize: 19.72 / REF,
  footerTracking: 0.016,
  stubSize: 67.61 / REF,
  stubTracking: 0,
  stubOpacity: 0.88,
  watermarkSize: 130 / REF,
  watermarkOpacity: 0.5,
  watermarkColor: "#FFE600",
  inkColor: "#FFFFFF"
};

var TICKET_TEXTURE = {
  engine: "generative",
  colorBack: "#000000",
  colorFront: "#FFE600",
  colorHighlight: "#FFFFFF",
  shape: "wave",
  type: "4x4",
  size: 1.5,
  colorSteps: 4,
  originalColors: true,
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  speed: 0.4
};

var TICKET_GRADIENT = {
  centreX: 0.62,
  centreY: 0.3,
  radius: 0.58,
  midStop: 0.45,
  colorLight: "#FFE600",
  colorMid: "#FACC15",
  colorDark: "#000000"
};

var TICKET_STYLE = {
  texture: TICKET_TEXTURE,
  gradient: TICKET_GRADIENT
};

var SHAPES = ["simplex", "warp", "dots", "wave", "ripple", "swirl", "sphere"];
var TYPES = ["random", "2x2", "4x4", "8x8"];

function ticketClipPath(width: number, height: number, geometry = TICKET_GEOMETRY) {
  const r = geometry.cornerRadius * width;
  const n = geometry.notchRadius * width;
  const p = geometry.perforation * width;
  return [
    `M ${r} 0`,
    `L ${p - n} 0`,
    `A ${n} ${n} 0 0 0 ${p + n} 0`,
    `L ${width - r} 0`,
    `A ${r} ${r} 0 0 0 ${width} ${r}`,
    `L ${width} ${height - r}`,
    `A ${r} ${r} 0 0 0 ${width - r} ${height}`,
    `L ${p + n} ${height}`,
    `A ${n} ${n} 0 0 0 ${p - n} ${height}`,
    `L ${r} ${height}`,
    `A ${r} ${r} 0 0 0 0 ${height - r}`,
    `L 0 ${r}`,
    `A ${r} ${r} 0 0 0 ${r} 0`,
    "Z"
  ].join(" ");
}

function splitName(name: string, max = 3) {
  const clean = name.trim().replace(/\s+/g, " ").toUpperCase();
  if (!clean) return [];
  const lines: string[] = [];
  for (const word of clean.split(" ")) {
    if (lines.length < max) lines.push(word);
    else lines[lines.length - 1] = `${lines[lines.length - 1]} ${word}`;
  }
  return lines;
}

function fitScale(lines: string[], opts: any) {
  if (lines.length === 0) return 1;
  const { availableWidth, availableHeight, fontSize, lineHeight, tracking } = opts;
  if (fontSize <= 0 || availableWidth <= 0) return 1;
  const longest = Math.max(...lines.map((l) => l.length));
  const charWidth = (0.6 + tracking) * fontSize;
  const block = lines.length * lineHeight;
  return Math.max(
    0.05,
    Math.min(
      1,
      charWidth > 0 ? availableWidth / (longest * charWidth) : 1,
      block > 0 && availableHeight > 0 ? availableHeight / block : 1
    )
  );
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false),
    () => false
  );
}

function getColorLuminance(color: string | any[]): number {
  if (!color) return 0;
  const [r, g, b] = getShaderColorFromString(color);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function TicketCard({
  name = "SARAH BENALI",
  presenter = "HBIBNA LOYALTY CLUB",
  event = "PASS FIDÉLITÉ VIP",
  venue = "ROASTERY 44 · ALGER",
  dates = "REMISE 15% · ACTIF",
  stubText = "HBIBNA PASS",
  watermark = "GOLD",
  width = REF,
  geometry = TICKET_GEOMETRY,
  layout = TICKET_LAYOUT,
  texture = TICKET_TEXTURE,
  className = ""
}: any) {
  const height = width / geometry.aspect;
  const perfX = geometry.perforation * width;
  const reduced = usePrefersReducedMotion();
  const lines = splitName(name);
  const scale = fitScale(lines, {
    availableWidth: perfX - layout.padding * width - 0.03 * width,
    availableHeight: layout.footerTop * width - layout.nameTop * width - 0.02 * width,
    fontSize: layout.nameSize * width,
    lineHeight: layout.nameLead * width,
    tracking: layout.nameTracking
  });

  const bgLum = getColorLuminance(texture.colorBack || "#000000");
  const isLight = bgLum > 0.42;
  const inkColor = isLight ? "#0a0a0a" : "#FFFFFF";
  const watermarkColor = isLight ? "#000000" : "#FFE600";
  const watermarkOpacity = isLight ? 0.16 : 0.42;

  const shaderStyle = {
    position: "absolute" as const,
    inset: 0,
    width,
    height
  };

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ width, height, clipPath: `path('${ticketClipPath(width, height, geometry)}')` }}
    >
      <div className="absolute inset-0" style={{ background: texture.colorBack }} />
      <Dithering
        colorBack={texture.colorBack}
        colorFront={texture.colorFront}
        shape={texture.shape}
        type={texture.type}
        size={texture.size}
        scale={texture.scale}
        rotation={texture.rotation}
        offsetX={texture.offsetX}
        offsetY={texture.offsetY}
        speed={reduced ? 0 : texture.speed}
        style={shaderStyle}
      />

      {/* Smart readability scrim: subtle gradient ensuring text stands out regardless of shader brightness */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isLight
            ? "linear-gradient(90deg, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.22) 65%, rgba(255,255,255,0.06) 100%)"
            : "linear-gradient(90deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.42) 60%, rgba(0,0,0,0.15) 100%)"
        }}
      />

      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          left: perfX,
          width: Math.max(1, 0.0022 * width),
          backgroundImage: `repeating-linear-gradient(to bottom, ${isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)"} 0 ${0.012 * width}px, transparent ${0.012 * width}px ${0.024 * width}px)`
        }}
      />
      <div
        className="pointer-events-none absolute grid place-items-center font-black tabular-nums"
        style={{
          left: perfX,
          top: 0,
          width: width - perfX,
          height,
          color: watermarkColor,
          opacity: watermarkOpacity
        }}
      >
        <span
          style={{
            writingMode: "vertical-rl",
            fontSize: layout.watermarkSize * width,
            lineHeight: 1,
            letterSpacing: "-0.04em"
          }}
        >
          {watermark}
        </span>
      </div>
      <div className="absolute inset-0" style={{ color: inkColor }}>
        {/* Top Header Badge & Event */}
        <div
          className="absolute whitespace-pre uppercase font-black"
          style={{
            left: layout.padding * width,
            top: layout.labelTop * width,
            fontSize: layout.labelSize * width,
            lineHeight: `${layout.labelLead * width}px`,
            letterSpacing: `${layout.labelTracking}em`
          }}
        >
          <div className="flex flex-col gap-1 items-start">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-md text-[0.85em] font-black tracking-wider ${
                isLight
                  ? "bg-black/15 text-black border border-black/20"
                  : "bg-black/60 text-[#FFE600] border border-[#FFE600]/30 shadow-xs backdrop-blur-xs"
              }`}
              style={{
                textShadow: isLight ? "0 1px 1px rgba(255,255,255,0.7)" : "0 1px 3px rgba(0,0,0,0.9)"
              }}
            >
              {presenter}
            </span>
            <span
              className="font-extrabold tracking-wide"
              style={{
                textShadow: isLight
                  ? "0 1px 2px rgba(255,255,255,0.9), 0 0 1px #fff"
                  : "0 2px 4px rgba(0,0,0,0.95), 0 4px 10px rgba(0,0,0,0.9), 0 0 2px #000"
              }}
            >
              {event}
            </span>
          </div>
        </div>

        {/* Member Name with Anti-Glare Multi-Layer Shadow */}
        <div
          className="absolute font-black tracking-tighter"
          style={{
            left: layout.padding * width,
            top: layout.nameTop * width,
            fontSize: layout.nameSize * width * scale,
            lineHeight: `${layout.nameLead * width * scale}px`,
            letterSpacing: `${layout.nameTracking}em`,
            textShadow: isLight
              ? "0 1px 3px rgba(255,255,255,0.9), 0 0 2px rgba(255,255,255,0.8)"
              : "0 2px 4px rgba(0,0,0,0.98), 0 4px 14px rgba(0,0,0,0.92), 0 0 3px #000000"
          }}
        >
          {lines.map((line, i) => (
            <div key={i} className="leading-none">{line}</div>
          ))}
        </div>

        {/* Footer info pill */}
        <div
          className="absolute whitespace-nowrap uppercase font-bold"
          style={{
            left: layout.padding * width,
            top: layout.footerTop * width,
            fontSize: layout.footerSize * width,
            letterSpacing: `${layout.footerTracking}em`
          }}
        >
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[0.92em] ${
              isLight
                ? "bg-black/90 text-white shadow-xs"
                : "bg-black/75 text-[#FFE600] border border-white/20 shadow-xs backdrop-blur-xs"
            }`}
            style={{
              textShadow: isLight ? "0 1px 2px rgba(0,0,0,0.5)" : "0 1px 3px rgba(0,0,0,0.9)"
            }}
          >
            {venue} · {dates}
          </span>
        </div>

        {/* Stub Right Side */}
        <div
          className="absolute grid place-items-center font-black whitespace-nowrap uppercase"
          style={{
            left: perfX,
            top: 0,
            width: width - perfX,
            height,
            fontSize: layout.stubSize * width,
            letterSpacing: `${layout.stubTracking}em`,
            opacity: layout.stubOpacity
          }}
        >
          <span
            style={{
              writingMode: "vertical-rl",
              textShadow: isLight
                ? "0 1px 2px rgba(255,255,255,0.85)"
                : "0 2px 6px rgba(0,0,0,0.95), 0 0 2px #000"
            }}
          >
            {stubText}
          </span>
        </div>
      </div>
    </div>
  );
}

function TiltCard({
  children,
  clipPath,
  maxTilt = 12,
  scale = 1.04,
  glare = 0.22,
  className = ""
}: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const isInteractingRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const idleResumeTimeoutRef = useRef<any>(null);

  const updateTilt = useCallback(
    (clientX: number, clientY: number) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = Math.max(-0.6, Math.min(0.6, (clientX - rect.left) / rect.width - 0.5));
      const dy = Math.max(-0.6, Math.min(0.6, (clientY - rect.top) / rect.height - 0.5));
      el.style.transform = `perspective(1200px) rotateX(${-(dy * 2) * maxTilt}deg) rotateY(${dx * 2 * maxTilt}deg) scale(${scale})`;
      if (glareRef.current) {
        glareRef.current.style.background = `radial-gradient(42% 60% at ${(dx + 0.5) * 100}% ${(dy + 0.5) * 100}%, rgba(255,255,255,${glare}) 0%, rgba(255,255,255,0) 70%)`;
      }
    },
    [maxTilt, scale, glare]
  );

  const setInteractingState = useCallback((active: boolean) => {
    isInteractingRef.current = active;
    setIsInteracting(active);
    if (active) {
      if (idleResumeTimeoutRef.current) {
        clearTimeout(idleResumeTimeoutRef.current);
        idleResumeTimeoutRef.current = null;
      }
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setInteractingState(true);
      try {
        (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
      } catch {}
      updateTilt(e.clientX, e.clientY);
    },
    [setInteractingState, updateTilt]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      // Respond to mouse hover or active touch/drag
      if (e.pointerType === "mouse" || isInteractingRef.current) {
        setInteractingState(true);
        updateTilt(e.clientX, e.clientY);
      }
    },
    [setInteractingState, updateTilt]
  );

  const handlePointerLeave = useCallback(() => {
    setInteractingState(false);
    if (idleResumeTimeoutRef.current) clearTimeout(idleResumeTimeoutRef.current);
    idleResumeTimeoutRef.current = setTimeout(() => {
      if (!isInteractingRef.current && cardRef.current) {
        cardRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)";
      }
      if (glareRef.current) glareRef.current.style.background = "transparent";
    }, 400);
  }, [setInteractingState]);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      try {
        (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      } catch {}
      handlePointerLeave();
    },
    [handlePointerLeave]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches[0]) {
        setInteractingState(true);
        updateTilt(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [setInteractingState, updateTilt]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches[0]) {
        setInteractingState(true);
        updateTilt(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [setInteractingState, updateTilt]
  );

  // Subtle ambient 3D floating animation when idle (especially engaging on mobile)
  useEffect(() => {
    let start = performance.now();
    const animate = (t: number) => {
      if (!isInteractingRef.current && cardRef.current) {
        const elapsed = (t - start) * 0.0018;
        const rotX = Math.sin(elapsed) * (maxTilt * 0.4);
        const rotY = Math.cos(elapsed * 0.85) * (maxTilt * 0.5);
        cardRef.current.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1)`;
        if (glareRef.current) {
          const gx = 50 + Math.cos(elapsed * 0.85) * 32;
          const gy = 50 - Math.sin(elapsed) * 32;
          glareRef.current.style.background = `radial-gradient(42% 60% at ${gx.toFixed(1)}% ${gy.toFixed(1)}%, rgba(255,255,255,${(glare * 0.55).toFixed(2)}) 0%, rgba(255,255,255,0) 70%)`;
        }
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (idleResumeTimeoutRef.current) clearTimeout(idleResumeTimeoutRef.current);
    };
  }, [maxTilt, glare]);

  // Mobile Device Orientation (Gyroscope) support
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (isInteractingRef.current || !cardRef.current) return;
      if (e.gamma !== null && e.beta !== null) {
        const clampedGamma = Math.max(-30, Math.min(30, e.gamma));
        const clampedBeta = Math.max(15, Math.min(65, e.beta)) - 40;
        const rotY = (clampedGamma / 30) * maxTilt;
        const rotX = -(clampedBeta / 25) * maxTilt;
        cardRef.current.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.02)`;
      }
    };
    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleOrientation);
      return () => window.removeEventListener("deviceorientation", handleOrientation);
    }
  }, [maxTilt]);

  return (
    <div
      ref={cardRef}
      onPointerEnter={() => setInteractingState(true)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerLeave}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handlePointerLeave}
      onTouchCancel={handlePointerLeave}
      className={`relative w-fit will-change-transform select-none touch-none ${className}`}
      style={{
        transition: isInteracting ? "none" : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
        transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)",
        transformStyle: "preserve-3d",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none"
      }}
    >
      {children}
      {glare > 0 && (
        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            clipPath,
            transition: isInteracting ? "none" : "background 420ms ease-out"
          }}
        />
      )}
    </div>
  );
}

export function AdmitOneTicket({ tilt, ...props }: any) {
  const width = props.width ?? REF;
  const geometry = props.geometry ?? TICKET_GEOMETRY;
  if (tilt === false) return <TicketCard {...props} />;
  return (
    <TiltCard
      clipPath={`path('${ticketClipPath(width, width / geometry.aspect, geometry)}')`}
      {...tilt}
    >
      <TicketCard {...props} />
    </TiltCard>
  );
}

function hslToHex(h: number, s: number, l: number) {
  const sat = s / 100;
  const lig = l / 100;
  const a = sat * Math.min(lig, 1 - lig);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const v = lig - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * Math.max(0, Math.min(1, v))).toString(16).padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

var pick = (list: any[], rnd: any) => list[Math.floor(rnd() * list.length) % list.length];
var between = (min: number, max: number, rnd: any) => min + rnd() * (max - min);

export function remixTexture(prev: any, rnd = Math.random) {
  const hue = between(35, 55, rnd); // Warm gold / sunny yellow palette
  const dark = "#000000";
  const light = hslToHex(hue, 95, between(65, 85, rnd));
  const swap = rnd() < 0.3;
  return {
    ...prev,
    colorBack: swap ? light : dark,
    colorFront: swap ? dark : light,
    colorHighlight: hslToHex(hue, 90, 75),
    shape: pick(SHAPES, rnd),
    type: pick(TYPES, rnd),
    size: between(0.8, 2.5, rnd),
    colorSteps: Math.round(between(2, 5, rnd)),
    rotation: between(0, 360, rnd),
    scale: between(1.2, 2.0, rnd),
    offsetX: between(-0.2, 0.2, rnd),
    offsetY: between(-0.2, 0.2, rnd),
    speed: between(0.2, 0.6, rnd)
  };
}

export function remixTicketStyle(prev: any) {
  return {
    texture: remixTexture(prev.texture),
    gradient: prev.gradient
  };
}

var audioCtx: AudioContext | null = null;

function burst(ctx: AudioContext, at: number, opts: any) {
  const length = Math.ceil(0.05 * ctx.sampleRate);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = opts.frequency;
  filter.Q.value = opts.q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1e-4, at);
  gain.gain.exponentialRampToValueAtTime(opts.gain, at + 1e-3);
  gain.gain.exponentialRampToValueAtTime(1e-4, at + opts.decay);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(at);
  source.stop(at + opts.decay + 0.02);
}

export function playShutterSound({ volume = 0.35, gap = 0.045 } = {}) {
  const Ctor = typeof window !== "undefined" ? window.AudioContext || (window as any).webkitAudioContext : void 0;
  if (!Ctor) return;
  audioCtx = audioCtx || new Ctor();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  const now = audioCtx.currentTime;
  burst(audioCtx, now, { gain: volume, decay: 0.035, frequency: 3200, q: 1.1 });
  burst(audioCtx, now + gap, {
    gain: volume * 0.75,
    decay: 0.055,
    frequency: 1800,
    q: 0.9
  });
}

export {
  TICKET_GEOMETRY,
  TICKET_GRADIENT,
  TICKET_LAYOUT,
  TICKET_STYLE,
  TICKET_TEXTURE,
  TicketCard,
  TiltCard,
  ticketClipPath
};
export default AdmitOneTicket;
