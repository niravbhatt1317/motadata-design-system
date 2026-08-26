// Empty PostCSS config — isolates this sub-build from the parent UI project's Tailwind/PostCSS
// (Vite walks up the tree for config; without this it picks up ../../postcss.config and warns).
export default {}
