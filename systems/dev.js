import * as THREE from 'three';
import { setScoreLive, gameState } from './game.js';

let sceneRef = null;
let devUIBound = false;

function createAxisLabel(text, position, color = 'black', size = 64) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const font = `bold ${size}px Arial`;
    context.font = font;
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    const padding = 10;

    canvas.width = textWidth + padding * 2;
    canvas.height = size + padding * 2;

    context.fillStyle = 'rgba(255, 255, 255, 0.7)';
    context.beginPath();
    context.roundRect(0, 0, canvas.width, canvas.height, [15]);
    context.fill();

    context.font = font;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    
    sprite.scale.set(canvas.width * 0.01, canvas.height * 0.01, 1.0);

    return sprite;
}

function setCatchRegionVisible(flag) {
    if (!sceneRef) return;
    ['bear', 'showcase-bear'].forEach(name => {
        const b = sceneRef.getObjectByName(name);
        const net = b?.getObjectByName?.('net');
        if (net) net.material.visible = !!flag;
    });
}

export const devHelperGroup = new THREE.Group();

export function initDevTools(scene) {
    sceneRef = scene;
    const axesHelper = new THREE.AxesHelper(5);
    devHelperGroup.add(axesHelper);

    const axisDistance = 5.5;
    devHelperGroup.add(createAxisLabel('+X', new THREE.Vector3(axisDistance, 0, 0), '#ff0000'));
    devHelperGroup.add(createAxisLabel('-X', new THREE.Vector3(-axisDistance, 0, 0), '#ff0000'));
    devHelperGroup.add(createAxisLabel('+Y', new THREE.Vector3(0, axisDistance, 0), '#00ff00'));
    devHelperGroup.add(createAxisLabel('-Y', new THREE.Vector3(0, -axisDistance, 0), '#00ff00'));
    devHelperGroup.add(createAxisLabel('+Z', new THREE.Vector3(0, 0, axisDistance), '#0000ff'));
    devHelperGroup.add(createAxisLabel('-Z', new THREE.Vector3(0, 0, -axisDistance), '#0000ff'));

    devHelperGroup.visible = false;
    scene.add(devHelperGroup);
}

export function toggleDevTools(controls) {
    if (!controls) return;
    controls.enabled = !controls.enabled;
    const isEnabled = controls.enabled;
    const body = document.body;

    body.classList.toggle('dev-mode-active', isEnabled);

    devHelperGroup.visible = isEnabled;
    setCatchRegionVisible(isEnabled);
    const devConsoleButton = document.getElementById('dev-console-button');
    if (!devConsoleButton) return;
    const panel = document.getElementById('dev-score-panel');
    
    if (isEnabled) {
        devConsoleButton.classList.remove('hidden'); // Ensure button is visible
        devConsoleButton.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        devConsoleButton.style.borderColor = '#ff8080';
        if (panel) {
            panel.classList.remove('hidden');
            if (!devUIBound) {
                const input = document.getElementById('dev-score-input');
                const apply = document.getElementById('dev-score-apply');
                if (input) input.value = String(gameState.score || 0);
                apply?.addEventListener('click', () => setScoreLive(parseInt(input.value,10)||0));
                input?.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ setScoreLive(parseInt(input.value,10)||0); }});
                devUIBound = true;
            }
        }
    } else {
        devConsoleButton.classList.add('hidden');
        panel?.classList.add('hidden');
        // Reset button appearance to default if it was made visible by other means
        devConsoleButton.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        devConsoleButton.style.borderColor = 'white';
    }
}

export function resetDevTools(controls) {
    const devConsoleButton = document.getElementById('dev-console-button');
    if (!devConsoleButton) return;
    
    document.body.classList.remove('dev-mode-active');
    
    // Ensure controls are disabled and UI is hidden regardless of previous state
    if (controls) controls.enabled = false;
    devHelperGroup.visible = false;
    devConsoleButton.classList.add('hidden');
    
    // Reset button appearance
    devConsoleButton.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    devConsoleButton.style.borderColor = 'white';

    setCatchRegionVisible(false);
    const panel = document.getElementById('dev-score-panel');
    panel?.classList.add('hidden');
}