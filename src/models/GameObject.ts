import { vec3, mat4 } from 'gl-matrix';

export class GameObject {

    private _translation: mat4;

    constructor(
        public position: vec3,
        private _vertices: number[],
        private _indices: number[],
    ) {
        this._translation = mat4.create();
        this.move(position);
    }

    public move(vector: vec3): mat4 {
        this._translation = mat4.translate(this._translation, this._translation, vector);
        return this._translation;
    }

    public getVertices(): number[] {
        return this._vertices;
    }

    public getIndices(): number[] {
        return this._indices;
    }

    public getTranslation(): mat4 {
        return this._translation;
    }

}