from PIL import Image
from plates import *

def overview(zh,mob):
    p=Plate(1,zh,mob,633 if mob else 510,("Inside a music membership audit","怎样审计一段音乐的训练成员身份？"),
            ("Conceptual  /  White-box access","概念示意  /  白盒访问"))
    m,w=p.m,p.w
    illustration=Image.open(OUT/"source"/"checkpoint-illustration.jpg")
    if mob:
        left,top,width=10,119,w-20
    else:
        left,top,width=35,118,538
    height=width*illustration.height/illustration.width
    p.ax.imshow(illustration,extent=(left,left+width,top+height,top),aspect="auto",interpolation="none",zorder=0)
    x,y=(m,top+height+26) if mob else (610,161)
    rows=[("Candidate track","一段候选音乐","Query one item at a fixed crop.","固定裁剪，保留原曲标识。"),
          ("Specified checkpoint","指定模型 checkpoint","Read its internal denoising response.","读取内部去噪响应。"),
          ("Membership evidence","成员证据","Interpret the score against non-members.","用非成员参照解释候选分数。")]
    gap=83 if mob else 113
    for i,(en,cn,noteEn,noteCn) in enumerate(rows):
        yy=y+i*gap
        if i<2:p.line([(x+12,yy+5),(x+12,yy+gap-19)],JADE,1.7)
        p.dot(x+12,yy-6,7,TEAL if i<2 else AMBER)
        p.label(x+37,yy,en,cn,21,INK,bold=True,limit=w-x-37-m)
        p.label(x+37,yy+30,noteEn,noteCn,17,SUB,limit=w-x-37-m)
    p.save()

def crops(zh,mob):
    p=Plate(2,zh,mob,765 if mob else 532,("One track, two ways to crop it","同一首音乐的训练视图与审计片段"),
            ("Conceptual  /  AudioLDM-style training","概念示意  /  AudioLDM 类模型训练"))
    m,w=p.m,p.w
    p.label(m,143,"One source item  ·  same track ID","同一原始条目  ·  track ID 贯穿两条路径",20,TEAL,bold=True,limit=w-2*m)
    x=m+9; width=w-2*(m+9)
    p.box(x,162,width,61,"#f2f7f5",LINE,r=4)
    p.wave(x+8,192,width-16,22)
    for t in range(11):
        a=x+width*t/10;p.line([(a,228),(a,233+(t%5==0)*4)],SUB,1)
    p.label(w-m,254,"Track time →","音轨时间 →",15,SUB,"right")
    # Two independent views of the same time axis with identical item identity.
    def branch(x,y,wi,en,cn,windows,note,train):
        col=TEAL if train else AMBER
        p.label(x,y,en,cn,20,col,bold=True,limit=wi)
        yy=y+33
        for j,frac in enumerate(windows):
            pos=yy+j*31
            p.box(x,pos,wi,20,"#f5f8f6",LINE,r=3)
            p.wave(x+5,pos+10,wi-10,8,JADE)
            p.box(x+frac*wi,pos-2,wi*.24,24,"none",col,r=2,lw=2.6)
        p.label(x,y+120,*note,17,SUB,limit=wi)
    if mob:a,b,wi=m,m,w-2*m;ya,yb=294,459
    else:a,b,wi=m,535,429;ya=yb=298
    branch(a,ya,wi,"Training  ·  random crop","训练  ·  随机位置裁剪",[.15,.62],("Train the controlled target on these views.","随机改变窗口位置，训练受控目标。"),True)
    branch(b,yb,wi,"Audit  ·  fixed center crop","审计  ·  固定中间裁剪",[.38],("Query the checkpoint with this window.","用这个固定片段查询模型。"),False)
    if not mob:p.line([(500,276),(500,421)],LINE,1)
    yy=621 if mob else 456
    p.line([(m,yy-18),(w-m,yy-18)],LINE,1)
    p.label(m,yy+4,"Track ID in training manifest → member label","训练清单中的 track ID → 原始条目的成员标签",18,INK,bold=True,limit=w-2*m)
    if mob:
        p.label(m,yy+43,"Preprocess audio  /  Select crop views","音频预处理  /  裁剪选择视图",17,SUB)
        p.label(m,yy+76,"Diffusion adds noise  /  Audit applies δ","扩散正向加噪  /  审计施加 δ",17,SUB)
    else:
        p.label(m,yy+41,"Audio preprocessing   /   Crop selection   /   Diffusion noise   /   Audit perturbation δ","音频预处理    /    裁剪选择视图    /    扩散正向加噪    /    审计扰动 δ",18,SUB,limit=w-2*m)
    p.save()

def raw(zh,mob):
    p=Plate(5,zh,mob,747 if mob else 511,("From directional responses to Raw MS","多方向响应怎样形成 Raw MS 分数？"),JOURNAL)
    m,w=p.m,p.w
    p.label(m,143,"Probe selected diffusion times","选取多个中间扩散时间",20,TEAL,bold=True,limit=w-2*m)
    y=219
    p.arrow([(m+6,y),(w-m-6,y)],SUB,1.4)
    p.text(w-m-4,y+26,r"$t$",15,SUB,"right")
    xs=[m+(w-2*m)*u for u in [.11,.36,.61,.86]]
    for x in xs:
        for deg in [-155,-108,-59,-15]:
            a=deg*math.pi/180
            p.arrow([(x,y),(x+30*math.cos(a), y+30*math.sin(a))],TEAL,1.4)
        p.dot(x,y,5,TEAL)
    p.label(m,263,"Fixed-length probes at each time","各时间点均使用固定幅度多方向扰动",17,SUB)
    def pair(x,y,wi):
        p.label(x,y,"Measure each direction","逐方向测量",19,TEAL,bold=True)
        p.text(x,y+47,r"$R_t(z_t)$",23,INK)
        p.text(x+wi*.54,y+47,r"$R_t(z_t+\delta_t)$",23,AMBER)
        p.line([(x+29,y+60),(x+29,y+72),(x+wi*.7,y+72),(x+wi*.7,y+60)],SUB,1.7)
        p.label(x,y+108,"Paired distance / perturbation norm","成对响应距离 / 扰动范数",17,SUB,limit=wi)
    def score(x,y,wi):
        p.label(x,y,"Summarize sensitivity","汇总各方向敏感度",19,TEAL,bold=True)
        p.label(x,y+34,"Smaller response change","响应变化较小",18)
        p.label(x,y+63,"→  Lower directional sensitivity","→  方向敏感度较低",18)
        p.label(x,y+92,"→  Higher stability coordinate","→  稳定性坐标较高",18)
    if mob:pair(m,313,w-2*m);score(m,473,w-2*m);yy=633
    else:pair(m,324,415);score(544,324,414);p.arrow([(448,369),(507,369)]);yy=471
    p.box(m,yy-21,w-2*m,77 if mob else 47,PALE,r=5)
    if mob:
        p.label(m+10,yy+5,"Transform against reference non-members","按参考非成员转换各时间坐标",16,INK)
        p.label(m+10,yy+39,"Aggregate over time","跨时间聚合",17,INK)
    else:
        p.label(m+14,yy+10,"Transform each time coordinate against reference non-members, then aggregate","以参考非成员转换各时间坐标，再进行时间聚合",17,INK)
    p.text(w-m-13,yy+(40 if mob else 11),r"$\rightarrow\ S_{\rm MS}$",23,TEAL,"right")
    p.save()

def protocol(zh,mob):
    p=Plate(7,zh,mob,711 if mob else 512,("Fit, freeze, then evaluate","拟合、冻结，再评估"),
            ("Conceptual  /  September manuscript protocol","概念示意  /  9 月稿独立参考协议"))
    m,w=p.m,p.w
    def role(x,y,sym,en,cn):
        p.text(x,y,sym,26,TEAL)
        p.label(x,y+30,en,cn,17,SUB,limit=164 if mob else None)
    if mob:
        role(m,151,r"$C_{\rm ref}$","Reference non-members","参考非成员")
        p.arrow([(155,154),(191,154)])
        p.label(202,153,"Fit score map","拟合评分映射",17,INK,bold=True)
        p.label(202,183,"and local reference","建立局部参照",16,SUB)
        p.arrow([(272,198),(272,231)])
        p.lock(205,256);p.label(226,261,"Freeze scoring","冻结评分映射",16,TEAL)
        role(m,326,r"$C_{\rm thr}$","Calibration non-members","阈值校准非成员")
        p.arrow([(156,322),(188,322)]);p.arrow([(272,274),(272,299)])
        p.label(199,329,"Calibrate cutoff","校准判决阈值",17,INK,bold=True)
        p.arrow([(272,347),(272,383)])
        p.lock(204,407);p.label(225,412,"Freeze cutoff","冻结判决阈值",16,TEAL)
        p.arrow([(272,427),(272,447)])
        yy=487
    else:
        role(m,175,r"$C_{\rm ref}$","Reference non-members","参考非成员")
        p.arrow([(226,177),(275,177)])
        p.label(300,172,"Fit score map","拟合评分映射",20,INK,bold=True)
        p.label(300,204,"and local reference","建立局部参照",17,SUB)
        p.arrow([(486,179),(526,179)])
        p.lock(550,176);p.label(573,182,"Freeze scoring","冻结评分映射",18,TEAL)
        role(m,277,r"$C_{\rm thr}$","Calibration non-members","阈值校准非成员")
        p.arrow([(246,275),(284,275)])
        p.label(300,280,"Calibrate cutoff","校准判决阈值",20,INK,bold=True)
        p.arrow([(638,199),(638,239),(384,239),(384,254)])
        p.arrow([(490,274),(526,274)]);p.lock(550,271);p.label(573,278,"Freeze cutoff","冻结判决阈值",18,TEAL)
        p.arrow([(638,290),(638,329)])
        yy=369
    p.line([(m,yy-35),(w-m,yy-35)],LINE,1)
    p.label(m,yy,"Evaluate with the frozen rule","用冻结的评分与判决规则评估",20,TEAL,bold=True,limit=w-2*m)
    for i,(sym,en,cn,metric) in enumerate([(r"$E_0$","Held-out non-members","评估非成员","FPR"),(r"$E_1$","Held-out members","评估成员","TPR")]):
        x=m if mob else m+i*505;y=yy+51+(i*63 if mob else 0)
        p.text(x,y,sym,24,INK)
        p.label(x+49,y,en,cn,17,SUB)
        xx=x+(264 if mob else 288)
        p.arrow([(xx,y-6),(xx+33,y-6)])
        p.text(xx+44,y,metric,19,TEAL,bold=True)
    p.label(m,p.h-31,"Training-manifest labels are used to count evaluation outcomes.","用训练清单真值统计评估结果。",16,SUB,limit=w-2*m)
    p.save()
