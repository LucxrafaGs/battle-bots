from build123d import Shape, Solid, Compound, export_stl, export_step
def wrap(occ):
    s=Shape.cast(occ); return s
def info(s):
    bb=s.bounding_box()
    return dict(type=type(s).__name__, valid=s.is_valid, vol=round(s.volume,1),
                min=tuple(round(v,1) for v in bb.min), size=tuple(round(v,1) for v in bb.size))
