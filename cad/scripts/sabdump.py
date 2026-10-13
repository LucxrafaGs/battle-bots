import sys
from ezdxf.acis import sab, const
from collections import Counter
const.SIGNATURES = list(const.SIGNATURES)+[b'ASM BinaryFile4']
def load(path):
    d=open(path,'rb').read()
    dec=sab.Decoder(d)
    dec.index=len(b'ASM BinaryFile4')
    hdr=[dec.read_int() for _ in range(4)]
    s=[dec.read_str_tag() for _ in range(3)]
    dbl=[dec.read_double_tag() for _ in range(3)]
    recs=[]
    while dec.has_data:
        try: recs.append(dec.read_record())
        except Exception as e:
            print('stop',e, len(recs)); break
    return hdr,s,dbl,recs
if __name__=='__main__':
    hdr,s,dbl,recs=load(sys.argv[1])
    print(hdr,s,dbl,len(recs))
    c=Counter(r[0].value if r and r[0].tag==sab.Tags.ENTITY_TYPE else '?' for r in recs)
    print(c.most_common(50))
    for r in recs[:int(sys.argv[2]) if len(sys.argv)>2 else 15]:
        print([ (t.tag, t.value) for t in r][:30])
