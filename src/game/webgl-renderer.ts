import { mat4 } from "gl-matrix";

export class WebGLRenderer {
  private _gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this._gl = gl;
  }

  public render(
    vertices: number[],
    indices: number[],
    translation: mat4,
    program: WebGLProgram
  ) {
    const bufferData = this.initBuffers(
      vertices,
      indices,
      translation,
      program
    );
    this.draw(indices, bufferData);
  }

  private initBuffers(
    vertices: number[],
    indices: number[],
    translation: mat4,
    program: WebGLProgram
  ): BufferData {
    // Create VAO instance
    const squareVAO = this._gl.createVertexArray();
    // Bind it so we can work on it
    this._gl.bindVertexArray(squareVAO);

    // Setting up the VBO
    const squareVertexBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, squareVertexBuffer);
    this._gl.bufferData(
      this._gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      this._gl.STATIC_DRAW
    );

    // Provide instructions for VAO to use data later in draw
    this._gl.enableVertexAttribArray(program["aVertexPosition"]);
    this._gl.vertexAttribPointer(
      program["aVertexPosition"],
      3,
      this._gl.FLOAT,
      false,
      0,
      0
    );

    // Setting up the IBO
    const squareIndexBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, squareIndexBuffer);
    this._gl.bufferData(
      this._gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      this._gl.STATIC_DRAW
    );

    // Clean
    this._gl.bindVertexArray(null);
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, null);

    // Set up the translation matrix
    this._gl.uniformMatrix4fv(program["uModelViewMatrix"], false, translation);

    return {
      squareVAO,
      squareIndexBuffer
    };
  }

  private draw(indices: number[], bufferData: BufferData) {
    // Clear the scene
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
    this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);

    // Bind the VAO
    this._gl.bindVertexArray(bufferData.squareVAO);

    this._gl.bindBuffer(
      this._gl.ELEMENT_ARRAY_BUFFER,
      bufferData.squareIndexBuffer
    );

    // Draw to the scene using triangle primitives
    this._gl.drawElements(
      this._gl.TRIANGLES,
      indices.length,
      this._gl.UNSIGNED_SHORT,
      0
    );

    // Clean
    this._gl.bindVertexArray(null);
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, null);
  }
}

interface BufferData {
  squareVAO: WebGLVertexArrayObject;
  squareIndexBuffer: WebGLBuffer;
}
