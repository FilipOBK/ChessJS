class Tile {
    constructor(idx, p) {
        this.index = idx;
        this.piece = p === '' ? undefined : p;
        const row = Math.floor((63 - idx) / 8) + 1;
        if(row % 2 == 0) {
            this.color = idx % 2 == 0 ? "beige" : "brown";
        } else {
            this.color = idx % 2 == 0 ? "brown" : "beige";
        }
        this.possMove = false;
    }
};