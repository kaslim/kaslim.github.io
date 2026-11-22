"""Build standalone bilingual plates. Run build.py with a Noto Sans CJK SC font."""
import base64
import re
import math
import os
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.patches import Circle, FancyArrowPatch, FancyBboxPatch, Polygon

OUT = Path(__file__).resolve().parents[1]
CJK = os.environ.get("LSA_CJK_FONT")
if not CJK:
    CJK = font_manager.findfont("Noto Sans CJK SC", fallback_to_default=False)
font_manager.fontManager.addfont(CJK)
ZH = font_manager.FontProperties(fname=CJK)
matplotlib.rcParams.update({"font.family": "DejaVu Sans", "svg.fonttype": "path",
                            "svg.hashsalt": "lsa-visual-v2", "mathtext.fontset": "dejavusans"})
INK, SUB = "#173333", "#4b6161"
TEAL, JADE, PALE = "#006e69", "#85bdb2", "#e4f2ed"
AMBER, CREAM = "#a65120", "#fbecdf"
LINE, BLUE = "#bdceca", "#476777"
WHITE = "#ffffff"
STEMS = ["01-audit-overview", "02-training-and-crops", "03-reconstruction-versus-stability",
         "04-lsa-probe-two-loops", "05-raw-manifold-stability", "06-ms-chn-local-reference",
         "07-reference-calibration-evaluation", "08-results-summary"]

class Plate:
    def __init__(self, num, zh, mobile, height, title, source):
        self.num, self.zh, self.mobile = num, zh, mobile
        self.w, self.h = (400 if mobile else 1000), height
        self.fig = plt.figure(figsize=(self.w/72, height/72), facecolor=WHITE)
        self.ax = self.fig.add_axes((0, 0, 1, 1), xlim=(0,self.w), ylim=(height,0))
        self.ax.axis("off")
        self.m = m = 18 if mobile else 36
        self.box(m,22,28,22,TEAL,r=3)
        self.text(m+14,38,f"{num:02d}",12,WHITE,"center",True)
        self.text(m+40,38,self.tr(*source),14,SUB,limit=self.w-2*m-40)
        self.text(m,84 if not mobile else 79,self.tr(*title),32 if not mobile else 25,INK,bold=True,limit=self.w-m*2)
        self.line([(m,103),(self.w-m,103)],LINE,1)
    def tr(self,en,zh):
        return zh if self.zh else en
    def text(self,x,y,s,size=18,c=INK,align="left",bold=False,limit=None):
        artist=self.ax.text(x,y,s,ha=align,va="baseline",fontsize=size,color=c,
                            fontproperties=ZH if any(ord(k)>0x2fff and not 0xff00>ord(k)>0x9fff for k in s) else None,
                            weight="bold" if bold else "normal", clip_on=False,zorder=5)
        if limit:
            renderer=self.fig.canvas.get_renderer()
            width=artist.get_window_extent(renderer).width*72/self.fig.dpi
            if width>limit: artist.set_fontsize(size*limit/width)
        return artist
    def box(self,x,y,w,h,fill,edge="none",r=0,lw=1.4):
        patch=FancyBboxPatch((x,y),w,h,boxstyle=f"round,pad=0,rounding_size={r}",facecolor=fill,edgecolor=edge,linewidth=lw)
        self.ax.add_patch(patch)
    def line(self,pts,c=SUB,lw=2,dash=False):
        self.ax.plot(*zip(*pts),c=c,lw=lw,ls=(0,(3,4)) if dash else "-",solid_capstyle="round",solid_joinstyle="round",zorder=2)
    def arrow(self,pts,c=TEAL,lw=2):
        if len(pts)>2:self.line(pts[:-1],c,lw)
        self.ax.add_patch(FancyArrowPatch(pts[-2],pts[-1],arrowstyle="-|>",mutation_scale=13,
                          shrinkA=0,shrinkB=0,linewidth=lw,color=c,zorder=3))
    def dot(self,x,y,r,fill,edge="none"):
        self.ax.add_patch(Circle((x,y),r,facecolor=fill,edgecolor=edge,linewidth=1.7,zorder=3))
    def poly(self,pts,fill,edge=TEAL,lw=1.6):
        self.ax.add_patch(Polygon(pts,closed=True,facecolor=fill,edgecolor=edge,linewidth=lw,zorder=3))
    def wave(self,x,y,w,h,c=TEAL,estimate=False):
        # A schematic item glyph. No audio samples are represented.
        profile=(.15,.24,.46,.29,.65,.94,.53,.35,.64,.43,.22,.35,.81,.67,.43,.52,.29,.17,.34,.18)
        self.line([(x,y),(x+w,y)],c,1)
        for i,a in enumerate(profile):
            if estimate: a *= (0.70,1.16,0.81,1.08)[i%4]
            u=x+w*(i+.5)/len(profile)
            self.line([(u,y-h*a),(u,y+h*a)],c,max(1.4,w/65))
    def tensor(self,x,y,accent=TEAL):
        for d in [8,4,0]:
            self.poly([(x-19,y+d),(x-1,y-10+d),(x+20,y+d),(x+1,y+10+d)],PALE,accent)
        for o in [-7,0,7]:
            self.line([(x+o-5,y-4),(x+o+5,y+2)],accent,.9)
    def lock(self,x,y):
        from matplotlib.patches import Arc
        self.ax.add_patch(Arc((x,y-4),13,17,theta1=180,theta2=360,lw=2,edgecolor=TEAL))
        self.box(x-10,y-5,20,14,TEAL,r=2)
        self.dot(x,y+1,1.5,WHITE)
    def label(self,x,y,en,zh,*args,**kw):
        return self.text(x,y,self.tr(en,zh),*args,**kw)
    def save(self):
        name=STEMS[self.num-1]+("-mobile" if self.mobile else "")+("-zh" if self.zh else "-en")+".svg"
        self.fig.savefig(OUT/name,format="svg",metadata={"Date":None,"Title":STEMS[self.num-1]})
        if self.num == 1:
            file = OUT / name
            photo = base64.b64encode((OUT/"source"/"checkpoint-illustration.jpg").read_bytes()).decode("ascii")
            file.write_text(re.sub(r'data:image/png;base64,[^"]+', "data:image/jpeg;base64,"+photo, file.read_text().replace("image-rendering:crisp-edges;image-rendering:pixelated","image-rendering:auto")))
        file = OUT / name
        file.write_text("\n".join(line.rstrip() for line in file.read_text().splitlines())+"\n")
        plt.close(self.fig)

CONCEPT=("Conceptual  /  Measurement", "概念示意  /  测量对象")
PAPER=("Conceptual  /  ICASSP 2026", "概念示意  /  ICASSP 2026")
JOURNAL=("Conceptual  /  Journal method", "概念示意  /  期刊方法")

def comparison(zh,mob):
    p=Plate(3,zh,mob,606 if mob else 535,("Which two objects are compared?","两种测量各自比较什么？"),CONCEPT)
    m,w=p.m,p.w
    p.label(m,140,"A   Reconstruction error","A   重建误差",20,TEAL,bold=True)
    y=197
    xs=[63,200,337] if mob else [158,496,835]
    p.wave(xs[0]-26,y,52,19)
    p.wave(xs[2]-26,y,52,19,estimate=True)
    p.dot(xs[1],y,22,PALE,TEAL)
    p.text(xs[1],y+6,r"$x_t$",17,TEAL,"center")
    p.arrow([(xs[0]+33,y),(xs[1]-28,y)])
    p.arrow([(xs[1]+28,y),(xs[2]-34,y)])
    p.label(xs[0],y-35,"Input","原始输入",17,SUB,"center")
    p.label(xs[1],y-35,"Noisy state","加噪状态",17,SUB,"center")
    p.label(xs[2],y-35,"Estimate","去噪估计",17,SUB,"center")
    p.text(xs[0],234,r"$x_0$",21,INK,"center")
    p.text(xs[2],234,r"$\hat{x}_0$",21,INK,"center")
    p.line([(xs[0],244),(xs[0],256),(xs[2],256),(xs[2],244)],AMBER,2)
    p.dot(xs[0],244,3,AMBER);p.dot(xs[2],244,3,AMBER)
    p.text(w/2,287,r"$E_{\rm rec}=d(\hat{x}_0,x_0)$",22,AMBER,"center")
    p.line([(m,307),(w-m,307)],LINE,1)
    p.label(m,344,"B   Local stability","B   局部稳定性",20,TEAL,bold=True)
    a,b,c,d=(43,130,248,343) if mob else (122,339,603,848)
    y=425
    p.tensor(a,y)
    p.text(a,y+43,r"$z_t$",20,INK,"center")
    for dy,expr,out,col in [(-36,r"$z_t$",r"$R_t(z_t)$",TEAL),(36,r"$z_t+\delta_t$",r"$R_t(z_t+\delta_t)$",AMBER)]:
        p.arrow([(a+22,y),(a+33,y),(a+33,y+dy),(b-36,y+dy)],col)
        p.text(b,y+dy+6,expr,18,col,"center")
        p.arrow([(b+37,y+dy),(c-51,y+dy)],col)
        p.text(c,y+dy+6,out,18,col,"center")
        p.line([(c+52,y+dy),(d,y+dy),(d,y)],SUB,1.6)
        p.dot(c+52,y+dy,2.7,SUB)
    p.dot(d,y,15,WHITE,SUB);p.text(d,y+6,r"$d$",17,INK,"center")
    if mob:
        p.label(m,516,"Shared model, conditioning and randomness","共享模型、条件与配对随机性",16,TEAL,limit=w-2*m)
        p.label(m,549,"z is an internal diffusion state.","z 表示扩散模型的内部状态。",16,SUB)
        p.label(m,575,"R gives one response per branch.","R 给出两条分支各自的模型响应。",16,SUB)
    else:
        p.label(m,509,"Same model, conditioning and paired randomness","共享模型、条件与配对随机性",18,TEAL)
        p.label(w-m,509,"z = internal state    R = response","z = 内部状态    R = 模型响应",17,SUB,"right")
    p.save()

def loops(zh,mob):
    p=Plate(4,zh,mob,693 if mob else 530,("LSA-Probe searches at two scales","LSA-Probe 的两层搜索"),PAPER)
    m,w=p.m,p.w
    p.box(m,123,w-2*m,423 if mob else 288,"#f4f9f6",JADE,r=16)
    p.label(m+16,155,"Outer loop  ·  bisect the budget","外层循环  ·  二分调整预算",21,TEAL,bold=True,limit=w-2*m-32)
    budget=(w/2,193) if mob else (162,257)
    inner=(42,226,316,145) if mob else (328,178,332,155)
    check=(200,420) if mob else (819,252)
    bx,by=budget
    p.text(bx,by+6,r"$\eta=(l+u)/2$",21,INK,"center")
    x,y,wi,h=inner
    p.box(x,y,wi,h,WHITE,TEAL,r=12,lw=2)
    p.label(x+16,y+32,"Inner loop  ·  PGD","内层循环  ·  PGD",20,TEAL,bold=True)
    cx,cy=x+57,y+87
    p.dot(cx,cy,30,PALE,JADE)
    p.arrow([(cx,cy),(cx+17,cy-17)],AMBER)
    p.dot(cx,cy,3,TEAL)
    p.label(x+104,y+73,"Update δ to raise D","更新 δ 以增大 D",17)
    p.label(x+104,y+101,"Project to budget η","投影回预算 η 内",17)
    p.arrow([(x+wi-38,y+110),(x+wi-38,y+126),(x+98,y+126),(x+98,y+111)],TEAL,1.4)
    dx,dy=check
    p.box(dx-67,dy-23,134,46,CREAM,AMBER,r=23)
    p.text(dx,dy+7,r"$D \geq \tau$ ?",21,AMBER,"center")
    if mob:
        p.arrow([(bx,by+12),(bx,y-3)])
        p.arrow([(200,y+h),(200,dy-26)])
        p.label(200,474,"Paired response distance D; fixed level τ","成对反向响应距离 D，固定感知阈值 τ",15,SUB,"center",limit=335)
        p.label(200,506,"Reached τ: lower u   /   Otherwise: raise l","达到 τ 则降低上界，否则提高下界",15,TEAL,"center",limit=335)
        p.arrow([(132,420),(31,420),(31,193),(bx-72,193)],TEAL,1.7)
        p.arrow([(200,547),(200,571)])
        o=601
    else:
        p.label(bx,by-36,"Trial budget","本轮预算",18,SUB,"center")
        p.arrow([(bx+73,by),(x-7,by)])
        p.arrow([(x+wi,by),(dx-73,by)])
        p.label(dx,dy-44,"Paired response distance D","成对反向响应距离 D",18,SUB,"center",limit=252)
        p.label(dx,dy+56,"Fixed perceptual level τ","固定感知退化阈值 τ",16,AMBER,"center")
        p.arrow([(dx,dy+71),(dx,375),(bx,375),(bx,by+28)],TEAL,1.9)
        p.arrow([(494,411),(494,427)],TEAL,1.7)
        p.label(494,366,"Reached τ: lower u   /   Otherwise: raise l","达到 τ 则降低上界，否则提高下界",17,TEAL,"center")
        o=455
    p.label(m,o,"At stopping tolerance","达到停止容差",18,SUB)
    p.text(w-m,o,r"$C_{\rm adv}\ \approx\ u$",25,TEAL,"right")
    p.label(m,o+35,"Compare the estimated cost to a separate membership cutoff.","用独立的成员判决阈值解释估计成本。",17,INK,limit=w-2*m)
    p.label(m,o+66,"Frozen checkpoint","模型参数冻结",16,SUB,limit=148 if mob else 320)
    p.text(w-m,o+66,r"$D=d_{\rm perc}(R_t(z_t),R_t(z_t+\delta_t))$",17,TEAL,"right",limit=195 if mob else 420)
    p.save()

def neighborhood(zh,mob):
    p=Plate(6,zh,mob,749 if mob else 562,("When is high stability unusual?","高稳定性在何时才特殊？"),JOURNAL)
    m,w=p.m,p.w
    # The candidate score and the local quantile meet only in the residual.
    if mob: a,b,c,y=56,190,318,176
    else: a,b,c,y=97,284,488,192
    p.wave(a-23,y,46,18)
    p.label(a,y-34,"Candidate","候选音乐",16,INK,"center")
    p.arrow([(a+32,y),(b-34,y)])
    for dx,dy in [(-12,-8),(1,8),(13,-4)]:
        p.dot(b+dx,y+dy,5,JADE,TEAL)
    p.label(b,y+44,"Frozen features","冻结音乐表征",16,SUB,"center")
    p.arrow([(b+26,y),(c-29,y)])
    # A music-library icon with the retrieved subset accentuated.
    for i in range(4):
        p.box(c-19+i*10,y-16+(i%2)*4,7,31,JADE if i<2 else TEAL,r=2)
    p.label(c,y-34,"Retrieve","相似检索",16,INK,"center")
    if mob:
        p.label(w/2,257,"Reference non-members in "+r"$C_{\rm ref}$",r"$C_{\rm ref}$ 中的参考非成员",19,TEAL,"center")
        p.label(w/2,287,"Use the Raw MS scores of the music-matched set.","读取相似邻居的 Raw MS 分数。",16,SUB,"center",limit=w-2*m)
        p.arrow([(c,y+26),(c,231)])
        p.line([(m,313),(w-m,313)],LINE,1)
        qy=348
    else:
        p.arrow([(c+30,y),(c+90,y)])
        p.label(604,163,"Reference non-members in "+r"$C_{\rm ref}$",r"$C_{\rm ref}$ 中的参考非成员",20,TEAL)
        p.label(604,199,"Read their Raw MS scores","读取相似邻居的 Raw MS 分数",18)
        p.label(604,229,"Take the local upper quantile","取局部上分位数",17,SUB)
        qy=280
    p.label(m,qy,"Candidate Raw MS minus local upper quantile","候选 Raw MS 减去局部上分位数",19,TEAL,bold=True,limit=w-2*m)
    p.text(m,qy+43,r"$S_{\rm CHN}^{\rm ref}(x)=S_{\rm MS}(x)-Q_{\rm local}^{\rm ref}(x)$",24 if mob else 30,INK,limit=w-2*m)
    # The sketches have ordinal score position only. No sampled distributions.
    def example(x,y,wi,tag,title,detail,special):
        p.label(x,y,tag+"   "+title[0],tag+"   "+title[1],19,TEAL,bold=True,limit=wi)
        left=x+15;right=x+wi-16;mid=y+50
        p.arrow([(left,mid),(right,mid)],SUB,1.1)
        shift=-.12 if special else .18
        for frac,offset in [(.22,0),(.33,-4),(.39,3),(.44,-3),(.51,2),(.62,-4)]:
            p.dot(left+(right-left)*(frac+shift),mid+offset,5,JADE)
        q=left+(right-left)*(.60+shift)
        p.line([(q,mid-15),(q,mid+12)],TEAL,2)
        sx=left+(right-left)*.76
        p.poly([(sx,mid-7),(sx-6,mid-18),(sx+6,mid-18)],AMBER,AMBER)
        p.text(right,mid-12,"Raw MS",12,SUB,"right")
        p.label(x,y+87,*detail,16,SUB,limit=wi)
    start=qy+99
    example(m,start, w-2*m if mob else 431,"A",("Stable neighbors","邻居也稳定"),("High score near the local background","原始高分接近邻居背景"),False)
    if not mob:p.line([(500,start-11),(500,start+91)],LINE,1)
    example(m if mob else 540,start+122 if mob else start,w-2*m if mob else 424,"B",("Candidate exceeds neighbors","候选超过邻居背景"),("Excess stability is retained","保留较强的条件超额证据"),True)
    ly=start+(241 if mob else 128)
    for off,mark,en,cn in [(0,"dot","Neighbor","邻居"),(117 if mob else 193,"q","Local q95","局部 q95"),(250 if mob else 395,"tri","Candidate","候选")]:
        x=m+off+6
        if mark=="dot":p.dot(x,ly-4,5,JADE)
        if mark=="q":p.line([(x,ly-12),(x,ly+2)],TEAL,2)
        if mark=="tri":p.poly([(x,ly),(x-5,ly-10),(x+5,ly-10)],AMBER,AMBER)
        p.label(x+12,ly,en,cn,15,SUB)
    p.label(m,p.h-20,"The membership cutoff is calibrated separately.","成员判决阈值另行校准。",16,SUB,limit=w-2*m)
    p.save()
