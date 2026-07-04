'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


function remapUVs(geometry, texX, texY, w, h, d) {
    const texWidth = 64;
    const texHeight = 64;

    const u0 = texX;
    const v0 = texY;

    const toUV = (x, y) => ({
        x: x / texWidth,
        y: 1 - (y / texHeight)
    });

    const right = { x: u0, y: v0 + d, w: d, h: h };
    const front = { x: u0 + d, y: v0 + d, w: w, h: h };
    const left = { x: u0 + d + w, y: v0 + d, w: d, h: h };
    const back = { x: u0 + d + w + d, y: v0 + d, w: w, h: h };
    const top = { x: u0 + d, y: v0, w: w, h: d };
    const bottom = { x: u0 + d + w, y: v0, w: w, h: d };

    const uvAttribute = geometry.attributes.uv;

    const setFace = (faceIndex, rect) => {
        const tl = toUV(rect.x, rect.y);
        const tr = toUV(rect.x + rect.w, rect.y);
        const bl = toUV(rect.x, rect.y + rect.h);
        const br = toUV(rect.x + rect.w, rect.y + rect.h);

        const offset = faceIndex * 4;
        uvAttribute.setXY(offset + 0, tl.x, tl.y);
        uvAttribute.setXY(offset + 1, tr.x, tr.y);
        uvAttribute.setXY(offset + 2, bl.x, bl.y);
        uvAttribute.setXY(offset + 3, br.x, br.y);
    };

    setFace(0, left);
    setFace(1, right);
    setFace(2, top);
    setFace(3, bottom);
    setFace(4, front);
    setFace(5, back);

    uvAttribute.needsUpdate = true;
}

export default function SkinViewer({ skinUrl, username = 'player' }) {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const modelGroupRef = useRef(null);
    const partsRef = useRef({ leftArm: null, rightArm: null, leftLeg: null, rightLeg: null });
    const materialRef = useRef(null);
    const animationIdRef = useRef(null);
    const clockRef = useRef(new THREE.Clock());
    const resizeObserverRef = useRef(null);
    const isWalkingRef = useRef(true);
    const isRotatingRef = useRef(true);

    const [isLoading, setIsLoading] = useState(true);
    const [, setIsWalking] = useState(true);
    const [, setIsRotating] = useState(true);


    const createSkinPart = (w, h, d, texX, texY, isOuter = false) => {
        const inflation = isOuter ? 0.25 : 0;
        const geometry = new THREE.BoxGeometry(w + inflation * 2, h + inflation * 2, d + inflation * 2);
        remapUVs(geometry, texX, texY, w, h, d);
        return new THREE.Mesh(geometry, materialRef.current);
    };

    const buildModel = (scene, modelGroup) => {
        if (modelGroup.children.length > 0) {
            modelGroup.clear();
        }

        modelGroup.position.y = -2;

        const armWidth = 4;
        const armOffset = 6;

        // HEAD
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 10, 0);
        const headInner = createSkinPart(8, 8, 8, 0, 0);
        headInner.position.set(0, 4, 0);
        const headOuter = createSkinPart(8, 8, 8, 32, 0, true);
        headOuter.position.set(0, 4, 0);
        headGroup.add(headInner, headOuter);
        modelGroup.add(headGroup);

        // BODY
        const bodyGroup = new THREE.Group();
        bodyGroup.position.set(0, 4, 0);
        bodyGroup.add(createSkinPart(8, 12, 4, 16, 16));
        bodyGroup.add(createSkinPart(8, 12, 4, 16, 32, true));
        modelGroup.add(bodyGroup);

        // RIGHT ARM
        partsRef.current.rightArm = new THREE.Group();
        partsRef.current.rightArm.position.set(-armOffset, 8, 0);
        const rArmPivot = new THREE.Group();
        rArmPivot.position.set(0, -4, 0);
        rArmPivot.add(createSkinPart(armWidth, 12, 4, 40, 16));
        rArmPivot.add(createSkinPart(armWidth, 12, 4, 40, 32, true));
        partsRef.current.rightArm.add(rArmPivot);
        modelGroup.add(partsRef.current.rightArm);

        // LEFT ARM
        partsRef.current.leftArm = new THREE.Group();
        partsRef.current.leftArm.position.set(armOffset, 8, 0);
        const lArmPivot = new THREE.Group();
        lArmPivot.position.set(0, -4, 0);
        lArmPivot.add(createSkinPart(armWidth, 12, 4, 32, 48));
        lArmPivot.add(createSkinPart(armWidth, 12, 4, 48, 48, true));
        partsRef.current.leftArm.add(lArmPivot);
        modelGroup.add(partsRef.current.leftArm);

        // RIGHT LEG
        partsRef.current.rightLeg = new THREE.Group();
        partsRef.current.rightLeg.position.set(-1.9, -2, 0);
        const rLegPivot = new THREE.Group();
        rLegPivot.position.set(0, -6, 0);
        rLegPivot.add(createSkinPart(4, 12, 4, 0, 16));
        rLegPivot.add(createSkinPart(4, 12, 4, 0, 32, true));
        partsRef.current.rightLeg.add(rLegPivot);
        modelGroup.add(partsRef.current.rightLeg);

        // LEFT LEG
        partsRef.current.leftLeg = new THREE.Group();
        partsRef.current.leftLeg.position.set(1.9, -2, 0);
        const lLegPivot = new THREE.Group();
        lLegPivot.position.set(0, -6, 0);
        lLegPivot.add(createSkinPart(4, 12, 4, 16, 48));
        lLegPivot.add(createSkinPart(4, 12, 4, 0, 48, true));
        partsRef.current.leftLeg.add(lLegPivot);
        modelGroup.add(partsRef.current.leftLeg);

        scene.add(modelGroup);
    };

    useEffect(() => {
        if (!containerRef.current || !skinUrl) return;

        try {
            containerRef.current.innerHTML = ''; // Костыль) для того чтобы не появлялся появлялся лишний канвас

            const scene = new THREE.Scene();
            sceneRef.current = scene;

            const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
            camera.position.set(0, 0, 45);

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            containerRef.current.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            scene.add(new THREE.AmbientLight(0xffffff, 0.8));
            const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
            keyLight.position.set(10, 10, 10);
            scene.add(keyLight);
            const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
            fillLight.position.set(-10, 5, 10);
            scene.add(fillLight);

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enablePan = false;
            controls.enableZoom = false;
            controls.minDistance = 20;
            controls.maxDistance = 80;
            controlsRef.current = controls;

            const modelGroup = new THREE.Group();
            modelGroupRef.current = modelGroup;

            const loader = new THREE.TextureLoader();
            loader.setCrossOrigin('anonymous');

            loader.load(skinUrl, (texture) => {
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;
                texture.colorSpace = THREE.SRGBColorSpace;

                const material = new THREE.MeshStandardMaterial({
                    map: texture,
                    transparent: true,
                    alphaTest: 0.5,
                    side: THREE.DoubleSide,
                    roughness: 1,
                    metalness: 0
                });
                materialRef.current = material;

                buildModel(scene, modelGroup);
                setIsLoading(false);
            });

            const resizeObserver = new ResizeObserver(() => {
                const width = containerRef.current?.clientWidth || 1;
                const height = containerRef.current?.clientHeight || 1;
                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            });
            resizeObserverRef.current = resizeObserver;
            resizeObserver.observe(containerRef.current);

            const animate = () => {
                animationIdRef.current = requestAnimationFrame(animate);

                controls.autoRotate = isRotatingRef.current;
                if (isRotatingRef.current) controls.autoRotateSpeed = 4;
                controls.update();

                if (modelGroup && partsRef.current.leftArm) {
                    if (isWalkingRef.current) {
                        const time = clockRef.current.getElapsedTime() * 3;
                        partsRef.current.leftArm.rotation.x = Math.sin(time) * 0.6;
                        partsRef.current.rightArm.rotation.x = -Math.sin(time) * 0.6;
                        partsRef.current.leftLeg.rotation.x = -Math.sin(time) * 0.4;
                        partsRef.current.rightLeg.rotation.x = Math.sin(time) * 0.4;
                        modelGroup.position.y = Math.sin(time * 2) * 0.2 - 2;
                    } else {
                        partsRef.current.leftArm.rotation.x = 0;
                        partsRef.current.rightArm.rotation.x = 0;
                        partsRef.current.leftLeg.rotation.x = 0;
                        partsRef.current.rightLeg.rotation.x = 0;
                        modelGroup.position.y = -2;
                    }
                }

                renderer.render(scene, camera);
            };

            animate();

            // Cleanup
            return () => {
                if (animationIdRef.current) {
                    cancelAnimationFrame(animationIdRef.current);
                }
                if (resizeObserver) {
                    resizeObserver.disconnect();
                }
                if (renderer) {
                    renderer.dispose();
                }
                if (materialRef.current) {
                    materialRef.current.dispose();
                }
                if (containerRef.current && renderer.domElement) {
                    containerRef.current.removeChild(renderer.domElement);
                }
            };
        } catch (error) {
            console.error('Ошибка инициализации скина:', error);
            setIsLoading(false);
        }
    }, [skinUrl]);

    // Обработчики кнопок
    const handleToggleWalk = () => {
        isWalkingRef.current = !isWalkingRef.current;
        setIsWalking(isWalkingRef.current);
    };

    const handleToggleRotate = () => {
        isRotatingRef.current = !isRotatingRef.current;
        setIsRotating(isRotatingRef.current);
    };

    return (
        <div className="skin-viewer-wrapper">
            <div 
                ref={containerRef}
                className="skin-viewer-container"
            />

            <div className="skin-viewer-controls">
                <button 
                    className="skin-viewer-btn"
                    onClick={handleToggleWalk}
                    title={isWalkingRef.current ? 'Отключить ходьбу' : 'Включить ходьбу'}
                >
                    <span className={`skin-viewer-indicator ${!isWalkingRef.current ? 'inactive' : ''}`} />
                    Ходьба
                </button>
                <button 
                    className="skin-viewer-btn"
                    onClick={handleToggleRotate}
                    title={isRotatingRef.current ? 'Отключить вращение' : 'Включить вращение'}
                >
                    <span className={`skin-viewer-indicator ${!isRotatingRef.current ? 'inactive' : ''}`} />
                    Вращение
                </button>
            </div>

            {isLoading && (
                <div className="skin-viewer-loading">
                    Загрузка скина...
                </div>
            )}

            <style jsx>{`
                .skin-viewer-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: 0.5rem;
                    overflow: hidden;
                    background-color: transparent;
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
                }

                .skin-viewer-container {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    background-color: transparent;
                }

                .skin-viewer-controls {
                    position: absolute;
                    bottom: 0.5rem;
                    left: 0;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0 0.5rem;
                    z-index: 10;
                }

                .skin-viewer-btn {
                    background-color: rgba(0, 0, 0, 0.5);
                    color: #ffffff;
                    font-size: 0.75rem;
                    font-weight: 500;
                    padding: 0.375rem 0.75rem;
                    border-radius: 9999px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    cursor: pointer;
                    transition: background-color 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    backdrop-filter: blur(0.5rem);
                }

                .skin-viewer-btn:hover {
                    background-color: rgba(0, 0, 0, 0.7);
                }

                .skin-viewer-indicator {
                    width: 0.5rem;
                    height: 0.5rem;
                    border-radius: 50%;
                    background-color: #22c55e;
                    transition: background-color 0.2s;
                }

                .skin-viewer-indicator.inactive {
                    background-color: #a3a3a3;
                }

                .skin-viewer-loading {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: rgba(0, 0, 0, 0.3);
                    color: #ffffff;
                    font-size: 0.875rem;
                    z-index: 5;
                }
            `}</style>
        </div>
    );
}
