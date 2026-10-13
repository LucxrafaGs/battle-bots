import sys, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from build123d import import_step, Plane, Location, Vector
import numpy as np
def plot_sections(paths, ys, out, title=''):
    fig,axs=plt.subplots(1,len(ys),figsize=(7*len(ys),7))
    if len(ys)==1: axs=[axs]
    cols=['k','tab:orange','tab:blue','tab:green','tab:red']
    for ax,y in zip(axs,ys):
        for ci,p in enumerate(paths):
            s=import_step(p)
            sec=s.intersect(Plane.XZ.offset(-y)) if False else None
            from build123d import Plane as P
            pl=P(origin=(0,y,0),x_dir=(1,0,0),z_dir=(0,1,0))
            try: sec=s & pl  # section
            except Exception: sec=None
            sec=s.section(pl) if hasattr(s,'section') else sec
            for e in sec.edges():
                pts=[e.position_at(t) for t in np.linspace(0,1,20)]
                ax.plot([q.X for q in pts],[q.Z for q in pts],color=cols[ci%5],lw=1)
        ax.set_aspect('equal'); ax.grid(True,alpha=.3); ax.set_title(f'{title} y={y}'); ax.invert_yaxis()
        ax.set_xticks(np.arange(-280,120,10),minor=True); 
    plt.tight_layout(); plt.savefig(out,dpi=80)
if __name__=='__main__':
    import json; a=json.loads(sys.argv[1]); plot_sections(a['paths'],a['ys'],a['out'],a.get('title',''))
