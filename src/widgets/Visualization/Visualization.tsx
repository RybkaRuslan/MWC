import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './Visualization.scss'

export const Visualization = () => {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f5f7fa')

    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 10000)
    camera.up.set(0, 0, 1)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    viewport.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08

    scene.add(new THREE.HemisphereLight(0xffffff, 0x637083, 2.2))
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
    keyLight.position.set(4, -6, 8)
    scene.add(keyLight)

    const grid = new THREE.GridHelper(10, 20, 0xb7c2ce, 0xd8dee5)
    grid.rotation.x = Math.PI / 2
    scene.add(grid)

    new GLTFLoader().load(
      '/models/column-base.glb',
      gltf => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const radius = Math.max(size.length() / 2, 0.1)

        model.position.sub(center)
        scene.add(model)

        grid.scale.setScalar(Math.max(radius / 4, 0.1))
        grid.position.z = -size.z / 2
        camera.near = radius / 100
        camera.far = radius * 100
        camera.position.set(radius * 1.5, -radius * 1.8, radius * 1.1)
        camera.updateProjectionMatrix()
        controls.target.set(0, 0, 0)
        controls.update()
        setStatus('ready')
      },
      undefined,
      () => setStatus('error'),
    )

    const resize = () => {
      const { clientWidth, clientHeight } = viewport
      camera.aspect = clientWidth / Math.max(clientHeight, 1)
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight, false)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(viewport)
    resize()

    let animationFrame = 0
    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      animationFrame = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className='visualization panel'>
      <header className='panel__header'>
        <h2 className='panel__title'>Визуализация</h2>
      </header>
      <div className='visualization__viewport' ref={viewportRef}>
        {status === 'loading' && (
          <div className='visualization__status'>Загрузка модели…</div>
        )}
        {status === 'error' && (
          <div className='visualization__status visualization__status--error'>
            Не удалось загрузить модель
          </div>
        )}
        {status === 'ready' && (
          <div className='visualization__hint'>
            ЛКМ — вращение · Колесо — масштаб
          </div>
        )}
      </div>
    </div>
  )
}
