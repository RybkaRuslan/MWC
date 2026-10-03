from pathlib import Path
import sys

import ifcopenshell
import ifcopenshell.geom
import numpy as np
import trimesh


def convert(source: Path, target: Path) -> None:
    model = ifcopenshell.open(source)
    settings = ifcopenshell.geom.settings()
    settings.set(settings.USE_WORLD_COORDS, True)

    scene = trimesh.Scene()
    iterator = ifcopenshell.geom.iterator(settings, model)

    if not iterator.initialize():
        raise RuntimeError(f"No renderable geometry found in {source}")

    count = 0
    while True:
        shape = iterator.get()
        geometry = shape.geometry
        vertices = np.asarray(geometry.verts, dtype=np.float64).reshape((-1, 3))
        faces = np.asarray(geometry.faces, dtype=np.int64).reshape((-1, 3))

        if len(vertices) and len(faces):
            color = [164, 181, 196, 255]
            if geometry.materials:
                diffuse = geometry.materials[0].diffuse
                color = [
                    round(diffuse.r() * 255),
                    round(diffuse.g() * 255),
                    round(diffuse.b() * 255),
                    255,
                ]

            mesh = trimesh.Trimesh(
                vertices=vertices,
                faces=faces,
                process=False,
                visual=trimesh.visual.ColorVisuals(
                    vertex_colors=np.tile(color, (len(vertices), 1))
                ),
            )
            product = model.by_id(shape.id)
            name = getattr(product, "Name", None) or product.is_a()
            scene.add_geometry(
                mesh,
                node_name=f"{name} [{product.GlobalId}]",
                geom_name=product.GlobalId,
            )
            count += 1

        if not iterator.next():
            break

    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(scene.export(file_type="glb"))
    print(f"Exported {count} IFC elements to {target}")


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parent.parent
    source_path = Path(sys.argv[1]) if len(sys.argv) > 1 else project_root / "docs" / "out.ifc"
    target_path = (
        Path(sys.argv[2])
        if len(sys.argv) > 2
        else project_root / "public" / "models" / "column-base.glb"
    )
    convert(source_path, target_path)
