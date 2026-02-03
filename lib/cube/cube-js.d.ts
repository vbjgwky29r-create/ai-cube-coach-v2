declare module 'cube-js' {
  export class Cube {
    constructor()
    move(move: string): void
    asString(): string
    fromString(state: string): Cube
    isSolved(): boolean
  }
}
