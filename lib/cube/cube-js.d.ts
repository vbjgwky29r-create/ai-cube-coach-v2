declare module 'cubejs' {
  class Cube {
    constructor(cube?: Cube)
    move(move: string): Cube
    asString(): string
    toJSON(): { ep: number[]; eo: number[]; [key: string]: any }
    static fromString(state: string): Cube
    isSolved(): boolean
  }
  export default Cube
}
