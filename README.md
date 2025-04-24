Implementation Details
	•	Uses a Cell class to manage individual cell states.
	•	World class handles the grid, neighbor calculations, rendering, and ticking.
	•	Wraps edges (toroidal array), meaning the grid behaves like a continuous surface.
	•	Uses a render buffer (cellBuffer) to efficiently draw updates.
	•	Automatically scales based on window size.
