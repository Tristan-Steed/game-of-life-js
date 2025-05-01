# Conway's Game of Life – Interactive Canvas Simulation

This project is an interactive simulation of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) implemented using JavaScript and HTML5 Canvas. Users can activate cells by clicking on them, then start or stop the simulation with the spacebar. The simulation runs based on standard rules of cellular automata with color-coded visual feedback.

---

##  Features

- **Canvas-based rendering** for dynamic visual updates.
- **Color-coded cell states**:
  - 🟢 Lime Green: New births
  - 🔵 Blue: Surviving cells
  - 🔴 Red: Recently dead
  - ⚫ Black: Dead or empty
- **Interactive controls**:
  - Click and drag to activate cells
  - Press `SPACE` to start or stop the simulation
- **Optimized scanning**: Only updates relevant cells for performance.

---

##  Rules of the Game (Conway's Game of Life)

1. **Birth**: A dead cell with exactly 3 live neighbors becomes alive.
2. **Survival**: A live cell with 2 or 3 live neighbors stays alive.
3. **Death by Underpopulation or Overcrowding**: A live cell with fewer than 2 or more than 3 neighbors dies.

---

##  How to Use

1. **Open `index.html`** in a browser.
2. **Click** on cells to activate them (turn lime green).
3. **Press `SPACE`** to start or stop the simulation.
4. **Watch the animation** as cells evolve over time!

