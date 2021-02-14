import { Color4 } from "@/models/Color4";
import { WebGLRenderer } from "./webgl-renderer";
import { GameObject } from "@/models/GameObject";

export class TowerClimb {
  private _canvas: HTMLCanvasElement;

  public gl: WebGL2RenderingContext;

  public program: WebGLProgram;
  public squareVertexBuffer: any;
  public indices: any;
  public squareVAO: any;
  public squareIndexBuffer: any;

  private _renderer: WebGLRenderer;

  pos = 0;
  sine = 0;

  private _vertexShader = `#version 300 es
    precision mediump float;

    // Supplied vertex position attribute
    in vec3 aVertexPosition;

    void main(void) {
      // Simply set the position in clipspace coordinates
      this.gl_Position = vec4(aVertexPosition, 1.0);
    }
  `;

  private _fragmentShader = `#version 300 es
        precision mediump float;

        // Color that is the result of this shader
        out vec4 fragColor;

        void main(void) {
        // Set the result as red
        fragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    `;

  constructor(wrapperElementId: string) {
    this._canvas = document.createElement("canvas");
    const wrapper = document.getElementById(wrapperElementId);
    if (wrapper) wrapper.append(this._canvas);

    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;
    window.addEventListener("resize", () => {
      this._canvas.width = window.innerWidth;
      this._canvas.height = window.innerHeight;
    });

    this.init();
    this.updateClearColor(new Color4(0, 0, 0, 1));
    document.addEventListener("keydown", event => {
      if (event.keyCode === 37) {
        this.pos -= 0.1;
      }
      if (event.keyCode === 39) {
        this.pos += 0.1;
      }
    });
    this.render();
  }

  public init(): void {
    this.gl = this._canvas.getContext("webgl2") as WebGL2RenderingContext;

    if (!this.gl) {
      throw new Error("WebGL is not supported in your current browser.");
    }
    this._renderer = new WebGLRenderer(this.gl);
    console.log("[WebGL] Context initiated! :)");
  }

  public updateClearColor(color: Color4): void {
    this.gl.clearColor(...color.toArray());
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.viewport(0, 0, 0, 0);
  }

  public render() {
    this.initProgram();

    const vertices = [0, 0, 0, 0, 0.5, 0, 0.5, 0.5, 0, 0.5, 0, 0];

    const indices = [0, 1, 2, 2, 3, 0];

    const go1 = new GameObject([0, 0, 0], vertices, indices);

    this.draws(go1);
    // this.initBuffers();
    // this.draw();
  }

  draws(gameObject: GameObject) {
    requestAnimationFrame(() => {
      // const translatedVertices = vertices.map(v => v + this.pos);
      gameObject.move([
        Math.sin((this.sine += 0.01)) / 1000,
        -Math.cos((this.sine += 0.01)) / 1000,
        0
      ]);

      this._renderer.render(
        gameObject.getVertices(),
        gameObject.getIndices(),
        gameObject.getTranslation(),
        this.program
      );
      this.draws(gameObject);
    });
  }

  public getShader(id: string): WebGLShader {
    const script = document.getElementById(id) as HTMLScriptElement;
    const shaderString = script.text.trim();

    // Assign shader depending on the type of shader≤
    let shader: WebGLShader;
    if (script.type === "x-shader/x-vertex") {
      shader = this.gl.createShader(this.gl.VERTEX_SHADER) as WebGLShader;
    } else if (script.type === "x-shader/x-fragment") {
      shader = this.gl.createShader(this.gl.FRAGMENT_SHADER) as WebGLShader;
    }

    this.gl.shaderSource(shader, shaderString);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      // console.error(^this.gl.getShaderInfoLog(shader));
      // return null;
    }

    return shader;
  }

  public initProgram(): void {
    const vertexShader = this.getShader("vertex-shader");
    const fragmentShader = this.getShader("fragment-shader");

    // Create a program
    this.program = this.gl.createProgram() as WebGLProgram;
    // Attach the shaders to this program
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error("Could not initialize shaders");
    }

    // Use this program instance
    this.gl.useProgram(this.program);
    // We attach the location of these shader values to the program instance
    // for easy access later in the code
    this.program["aVertexPosition"] = this.gl.getAttribLocation(
      this.program,
      "aVertexPosition"
    );

    this.program["uModelViewMatrix"] = this.gl.getUniformLocation(
      this.program,
      "uModelViewMatrix"
    );
  }

  public initBuffers() {
    /*
          V0                    V3
          (-0.5, 0.5, 0)        (0.5, 0.5, 0)
          X---------------------X
          |                     |
          |                     |
          |       (0, 0)        |
          |                     |
          |                     |
          X---------------------X
          V1                    V2
          (-0.5, -0.5, 0)       (0.5, -0.5, 0)
        */
    const vertices = [-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0];

    // Indices defined in counter-clockwise order
    this.indices = [0, 1, 2, 0, 2, 3];

    // Create VAO instance
    this.squareVAO = this.gl.createVertexArray();

    // Bind it so we can work on it
    this.gl.bindVertexArray(this.squareVAO);

    const squareVertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, squareVertexBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      this.gl.STATIC_DRAW
    );

    // Provide instructions for VAO to use data later in draw
    this.gl.enableVertexAttribArray(this.program["aVertexPosition"]);
    this.gl.vertexAttribPointer(
      this.program["aVertexPosition"],
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    // Setting up the IBO
    this.squareIndexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.squareIndexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.indices),
      this.gl.STATIC_DRAW
    );

    // Setting up the VBO
    // this.squareVertexBuffer = this.gl.createBuffer();
    // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareVertexBuffer);
    // this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

    // Clean
    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  public draw() {
    // Clear the scene
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    // Bind the VAO
    this.gl.bindVertexArray(this.squareVAO);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.squareIndexBuffer);

    // Draw to the scene using triangle primitives
    this.gl.drawElements(
      this.gl.POLYGON_OFFSET_FILL,
      this.indices.length,
      this.gl.UNSIGNED_SHORT,
      0
    );

    // Clean
    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }
}
