"""Draw both panels from their versioned evidence files; all source rates are fractions."""
import json
from plates import Plate, OUT, LINE, TEAL, INK, SUB, BLUE, PALE

DATA = OUT.parents[2] / "data"

def results(zh,mob):
    conf = json.loads((DATA/"evidence.json").read_text())
    journal = json.loads((DATA/"journal-evidence.json").read_text())
    assert conf["source"]["unit"] == journal["protocol"]["unit"] == "proportion"
    assert conf["source"]["status"] == journal["protocol"]["source"]["status"] == "manuscript-reported"
    p=Plate(8,zh,mob,913 if mob else 542,("Member recall at low false-positive rates","低误报率下的成员召回率"),
            ("Reported data  /  manuscript-reported","论文报告数据  /  manuscript-reported"))
    m,w=p.m,p.w
    def bar(x,y,wi,rate,col,label):
        # Identical zero-based TPR scales within each panel. Explicit value labels.
        length=wi*(rate*100/25)
        p.ax.barh(y,length,height=12,left=x,color=col,zorder=2)
        p.text(x+length+6,y+5,label,15,col,bold=True)
    def ticks(x,y,wi,top):
        for val in range(0,26,5):
            xx=x+wi*val/25
            p.line([(xx,top),(xx,y)],LINE,.6)
            p.text(xx,y+19,str(val),13,SUB,"center")
    p.label(m,143,"A   ICASSP 2026  ·  Table 1","A   ICASSP 2026  ·  表 1",21,INK,bold=True)
    p.label(m,174,"TPR (%) at 1% FPR","FPR 为 1% 时的 TPR（%）",17,SUB)
    for x,col,lab in [(m,BLUE,("Best baseline","最佳基线")),(m+175,TEAL,("LSA-Probe","LSA-Probe"))]:
        p.box(x,193,16,10,col);p.label(x+22,204,*lab,16,col)
    # Each model/dataset receives a labeled group. Chart widths adapt independently.
    x=m+(126 if mob else 167);wi=207 if mob else 260;yy=242
    ticks(x,yy+3*57+24,wi,yy-15)
    for i,row in enumerate(conf["records"]):
        cy=yy+i*57
        p.text(m,cy-1,row["model"],16,INK,bold=True)
        p.text(m,cy+18,row["dataset"],14,SUB)
        for j,(method,col) in enumerate([("baseline",BLUE),("lsa_probe",TEAL)]):
            rate=row[method]["tpr"]
            bar(x,cy-7+j*19,wi,rate,col,f"{rate:.0%}")
    b=m if mob else 553
    h=516 if mob else 143
    if mob:p.line([(m,482),(w-m,482)],LINE,1)
    else:p.line([(510,121),(510,495)],LINE,1)
    p.label(b,h,"B   AudioLDM  ·  July 2026 draft","B   AudioLDM  ·  2026 年 7 月稿",21,INK,bold=True,limit=w-b-m)
    p.label(b,h+32,"Held-out M2/M4/M6  ·  1% calibration target","留出 M2/M4/M6  ·  目标校准 FPR 为 1%",16,SUB,limit=w-b-m)
    p.label(b,h+71,"TPR (%)","TPR（%）",17,TEAL,bold=True)
    bw=205 if mob else 252
    x=b+(115 if mob else 123)
    ticks(x,h+162,bw,h+85)
    methods=journal["methods"]
    for i,(key,label,col) in enumerate([("raw","Raw MS",BLUE),("mschn","MS-CHN",TEAL)]):
        y=h+104+40*i
        p.text(b,y+5,label,17,INK)
        rate=methods[key]["tpr"]
        bar(x,y,bw,rate,col,f"{rate:.2%}")
    delta=100*(methods["mschn"]["tpr"]-methods["raw"]["tpr"])
    p.label(b,h+224,f"TPR difference   +{delta:.2f} pp",f"TPR 差值   +{delta:.2f} 个百分点",18,TEAL,bold=True)
    p.label(b,h+263,"Empirical FPR","实际 FPR",17,SUB,bold=True)
    for i,(key,label) in enumerate([("raw","Raw MS"),("mschn","MS-CHN")]):
        p.text(b+i*175,h+296,f'{label}   {methods[key]["fpr"]:.2%}',17,INK)
    p.label(b,h+338,"Earlier calibration pool; original-label replay unresolved.","早期校准池；原始标签重放尚未对齐。",15,SUB,limit=w-b-m)
    p.save()
