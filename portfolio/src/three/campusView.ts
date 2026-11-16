import * as THREE from 'three'

// The campus map's own scene and camera. Campus.tsx fills them; Scene.tsx draws them into
// the on-screen rect of the campus placeholder element.
export const campusScene = new THREE.Scene()
export const campusCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
