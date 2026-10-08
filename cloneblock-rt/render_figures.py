"""Reproducible, standalone SVG illustrations. No browser-built diagrams.

Waveforms, heatmaps and gain traces are schematic, not measured model outputs.
Only the result bars use manuscript measurements (Table 1).
"""
from pathlib import Path
from html import escape
import math

OUT = Path(__file__).parent / 'assets' / 'figures'
OUT.mkdir(parents=True, exist_ok=True)
INK, MUTED, BLUE, TEAL, RED = '#172d40', '#667785', '#315cb0', '#16776b', '#ad644d'
BG, LINE = '#fbfaf6', '#dce3e5'

class Canvas:
    def __init__(self, title, h=820, w=1440):
        self.w, self.h = w, h
        self.s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>{escape(title)}</title>',
            '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse"><path d="M0 0L8 4L0 8" fill="#667785"/></marker></defs>',
            f'<rect width="{w}" height="{h}" fill="{BG}"/>']
    def rect(self,x,y,w,h,fill='white',stroke=LINE,r=14):
        self.s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}"/>')
    def text(self,x,y,txt,size=22,color=INK,weight=400,anchor='start'):
        self.s.append(f'<text x="{x}" y="{y}" fill="{color}" font-family="Arial, Helvetica, sans-serif" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}">{escape(txt)}</text>')
    def line(self,x1,y1,x2,y2,color=LINE,width=2,dash=''):
        self.s.append(f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{color}" stroke-width="{width}" stroke-dasharray="{dash}" fill="none"/>')
    def arrow(self,x1,y1,x2,y2,dash=''):
        self.s.append(f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{MUTED}" stroke-width="2" stroke-dasharray="{dash}" fill="none" marker-end="url(#arrow)"/>')
    def path(self,d,color=BLUE,width=3,dash=''):
        self.s.append(f'<path d="{d}" stroke="{color}" stroke-width="{width}" stroke-dasharray="{dash}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>')
    def circle(self,x,y,r,fill,stroke='none'):
        self.s.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}"/>')
    def wave(self,x,y,w,h,color=BLUE):
        self.line(x,y,x+w,y,LINE,1)
        pts=[]
        for i in range(361):
            t=i/360
            env=.15+.85*math.sin(math.pi*t)**2
            a=math.sin(t*math.pi*48)*math.sin(t*math.pi*5.5)*env
            pts.append(f'{x+w*t:.2f} {y+h*a/2:.2f}')
        self.path('M'+'L'.join(pts),color,2.2)
    def heat(self,x,y,w,h):
        for i in range(32):
            for j in range(15):
                v=(math.sin(i*.63+j*.8)+math.sin(j*1.6-i*.12)+2)/4
                c=f'rgb({int(229-190*v)},{int(240-117*v)},{int(244-89*v)})'
                self.rect(round(x+i*w/32,2),round(y+j*h/15,2),round(w/32+.2,2),round(h/15+.2,2),c,c,0)
    def header(self,number,title,sub):
        self.text(48,48,'CLONEBLOCK-RT   /   '+number,17,TEAL,700)
        self.text(48,96,title,34,INK,600)
        self.text(48,132,sub,20,MUTED)
    def footer(self,txt):
        self.line(48,self.h-52,self.w-48,self.h-52)
        self.text(48,self.h-23,txt,16,MUTED)
    def save(self,name):
        (OUT/(name+'.svg')).write_text('\n'.join(self.s+['</svg>']),encoding='utf-8')


def overview():
    c=Canvas('Protect the live call before it becomes a cloning reference',700)
    c.header('01 / THREAT MODEL','A conversation today. A cloning reference tomorrow.',
             'Protection must act before transmission; reference selection happens after the recording is captured.')
    for x,n,label in [(48,'01','LIVE SPEECH'),(412,'02','PRE-TRANSMISSION PROTECTION'),(914,'03','AFTER TRANSMISSION')]:
        c.text(x,195,n,18,TEAL,700); c.text(x+40,195,label,17,MUTED,700)
    c.rect(48,224,290,255)
    c.rect(79,253,53,94,'#f0f4f7',BLUE,10); c.line(94,264,117,264,BLUE);c.circle(105,335,3,BLUE)
    c.text(156,279,'Live caller',24,INK,600); c.text(156,311,'16-kHz mono',17,MUTED)
    c.wave(78,397,230,77)
    c.arrow(348,347,397,347)
    c.rect(412,224,405,255,'#edf5f1','#a8cdc1')
    c.text(442,270,'CloneBlock-RT',31,TEAL,700)
    c.text(442,304,'One causal forward pass',21,TEAL)
    c.heat(442,331,177,82)
    c.path('M652 358L675 338L701 372L727 347L750 356',TEAL,4)
    c.text(648,402,'bounded gains',16,TEAL)
    c.text(442,451,'Past + current context only',19,TEAL)
    c.arrow(828,300,899,300)
    c.rect(914,224,478,114,'#f1f4f8')
    c.text(942,263,'Telephone channel → Listener',24,INK,600)
    c.text(942,301,'Band-limit · resample · gain control · noise',18,MUTED)
    c.arrow(1153,349,1153,396,'6 6')
    c.rect(914,409,478,167,'#faf0ea','#e3cabb')
    c.text(942,447,'Recorded speech can be reused',23,RED,600)
    c.text(942,484,'Select multiple clips → Zero-shot cloning',20,RED)
    c.text(942,531,'Goal: lower cloned-speaker similarity',20,INK,600)
    c.text(48,541,'The design tension',18,TEAL,700)
    c.text(48,577,'Speak naturally now. Reduce identity reuse later.',27,INK,500)
    c.footer('Conceptual illustration · No synthetic impersonation audio · Similarity reduction is not a guarantee of prevention.')
    c.save('01-overview')


def online():
    c=Canvas('Single-pass causal spectral protection',900)
    c.header('02 / ONLINE INFERENCE','The protector learns how to reshape each arriving spectrum.',
             'Only analysis, a causal predictor, bounded gains and waveform reconstruction run during the call.')
    c.rect(48,194,246,151);c.text(72,230,'Incoming speech',23,INK,600);c.wave(72,286,197,62)
    c.arrow(306,269,349,269)
    c.rect(362,194,255,151);c.text(387,230,'Non-centered STFT',22,INK,600)
    c.heat(387,250,204,62)
    c.text(387,333,'Complex spectrum X',17,MUTED)
    c.arrow(630,269,676,269)
    c.rect(690,194,323,151,'#edf5f1','#a8cdc1');c.text(714,230,'Multiply by positive gains',22,TEAL,600)
    c.text(851,286,'X̃[j,t] = G[b(j),t] · X[j,t]',23,TEAL,500,'middle')
    c.text(714,327,'STFT coefficient phase preserved',17,TEAL)
    c.arrow(1025,269,1070,269)
    c.rect(1083,194,309,151);c.text(1106,230,'iSTFT + overlap-add',22,INK,600)
    c.wave(1106,282,258,57,TEAL);c.text(1106,331,'Protected stream → Telephone',17,MUTED)
    c.arrow(489,357,489,412)
    c.rect(362,426,255,145,'#eff3fb','#b9cbe8');c.text(386,463,'Causal GRU',24,BLUE,600)
    c.text(386,502,'2 layers × 64 units',20,BLUE);c.text(386,540,'Current frame + past state',17,MUTED)
    c.path('M362 496H332V600H486V582',BLUE,2)
    c.arrow(486,600,486,578)
    c.text(48,477,'No future frames',22,INK,600)
    c.text(48,512,'Hidden state is carried',18,MUTED);c.text(48,541,'across arriving chunks.',18,MUTED)
    c.arrow(630,497,676,497)
    c.rect(690,426,323,145,'#edf5f1','#a8cdc1')
    c.text(715,463,'32 mel-spaced bands',23,TEAL,600)
    c.text(715,505,'G = 1 + 0.18 tanh(Ĝ)',24,TEAL)
    c.text(715,543,'Map gains to frequency bins',19,TEAL)
    c.arrow(851,414,851,357)
    c.rect(1083,397,309,204,'#f4f6f7')
    for y,t in [(432,'1.18'),(483,'1.00'),(534,'0.82')]:
        c.line(1148,y,1361,y,LINE,1,'4 5');c.text(1100,y+5,t,16,MUTED)
    c.path('M1150 480C1170 402 1190 537 1220 479S1260 415 1290 487S1330 520 1358 479',TEAL,3)
    c.text(1104,578,'Illustrative gain trace · not data',16,MUTED)
    c.line(48,638,1392,638)
    c.text(48,680,'TIMING & STATE',17,TEAL,700)
    c.text(48,723,'20 ms window',26,INK,600);c.text(48,757,'320 samples · Hann · FFT 512',18,MUTED)
    c.text(503,723,'10 ms frame hop',26,INK,600);c.text(503,757,'160 new samples per analysis step',18,MUTED)
    c.text(974,723,'0 future-frame look-ahead',25,INK,600);c.text(974,757,'20 ms initial analysis buffering',18,MUTED)
    c.text(48,808,'Persistent streaming state: analysis buffer + GRU hidden state + synthesis overlap buffer',21,BLUE)
    c.footer('Methods §2.2 / implementation §3.2 · Spectral features are left unspecified in the manuscript · Gain bounds ≠ perceptual guarantee.')
    c.save('02-online-pipeline')


def training():
    c=Canvas('Matched-channel training with a frozen speaker encoder',820)
    c.header('03 / OFFLINE TRAINING','Learn against the voice that survives the telephone channel.',
             'Both branches share the sampled channel settings and noise. Only the protector parameters are updated.')
    c.rect(48,310,190,160);c.text(72,348,'Training speech',21,INK,600);c.wave(69,410,145,56)
    c.path('M238 390H276V248H321',MUTED,2);c.arrow(276,248,320,248)
    c.path('M276 390V533H321',MUTED,2);c.arrow(276,533,320,533)
    c.rect(334,203,246,91,'#edf5f1','#a8cdc1');c.text(359,241,'Protector Dφ',24,TEAL,600);c.text(359,275,'TRAINABLE',16,TEAL,700)
    c.text(354,522,'Unprotected branch',21,MUTED);c.text(354,554,'No protection applied',18,MUTED)
    c.arrow(594,248,636,248);c.arrow(594,533,636,533)
    c.rect(650,203,300,91,'#eff3fb','#b9cbe8');c.text(678,241,'Telephone transform',23,BLUE,600);c.text(678,275,'T(protected speech; θ)',18,BLUE)
    c.rect(650,489,300,91,'#eff3fb','#b9cbe8');c.text(678,527,'Telephone transform',23,BLUE,600);c.text(678,561,'T(original speech; θ)',18,BLUE)
    c.line(799,306,799,359,BLUE,2,'5 5');c.line(799,425,799,477,BLUE,2,'5 5')
    c.rect(649,364,302,57,'#e7edf8','#b9cbe8');c.text(800,400,'SAME sampled θ + noise',20,BLUE,600,'middle')
    c.arrow(963,248,1005,248);c.arrow(963,533,1005,533)
    c.rect(1019,203,373,91);c.text(1043,241,'Frozen ECAPA-TDNN',23,INK,600);c.text(1043,275,'Speaker embedding → L2 normalize',18,MUTED)
    c.rect(1019,489,373,91);c.text(1043,527,'Frozen ECAPA-TDNN',23,INK,600);c.text(1043,561,'Speaker embedding → L2 normalize',18,MUTED)
    c.arrow(1207,307,1207,340);c.arrow(1207,477,1207,443)
    c.rect(1019,352,373,79,'#faf0ea','#e3cabb');c.text(1045,383,'Minimize post-channel cosine',21,RED,600);c.text(1045,413,'Average over sampled conditions',18,RED)
    c.path('M1392 392H1414V173H457V192',RED,2,'6 6')
    c.arrow(457,181,457,199)
    c.text(563,167,'Gradient update to protector only',17,RED)
    c.rect(48,630,1344,124,'#f1f4f3')
    c.text(74,669,'Speech preservation',22,TEAL,600)
    c.text(74,706,'Constrain pre-channel modification with spectral reconstruction and energy penalties (Eq. 2).',21,INK)
    c.text(74,734,'Training transforms: filtering, resampling, smooth AGC, Gaussian noise. Codecs are evaluation-only.',18,MUTED)
    c.footer('Methods §2.1 / Eq. 1–2 · Channel simulation and speaker encoder are absent at deployment · Average-case, not worst-case training.')
    c.save('03-matched-training')


def evaluation():
    c=Canvas('Session-level reference collection and measured XTTS results',840)
    c.header('04 / RETROSPECTIVE EVALUATION','Test what an attacker can assemble after the call.',
             'Reference pooling and actual voice cloning are separate tests. Neither is part of the training loss.')
    c.rect(48,184,1344,198)
    c.text(76,224,'Captured recording',23,INK,600);c.wave(76,289,249,78,TEAL)
    c.arrow(343,279,385,279)
    c.text(403,224,'Candidate clips',23,INK,600)
    for i in range(3):
        c.rect(403+i*57,257,48,49,'#e7f2ee','#bed8d0',5);c.wave(408+i*57,282,38,24,TEAL)
    c.text(403,344,'1 s windows · 0.25 s hop',17,MUTED)
    c.arrow(600,279,643,279)
    c.text(661,224,'Greedy selection',23,INK,600)
    c.text(661,273,'Target = observed centroid',18,TEAL)
    c.text(661,309,'Select K windows',21,INK)
    c.text(661,344,'Protected audio guides selection',16,MUTED)
    c.arrow(941,279,984,279)
    c.text(1003,224,'Two evaluation paths',23,INK,600)
    c.text(1003,275,'A  Pool embeddings → score',20,BLUE)
    c.text(1003,314,'B  Clip files → XTTS-v2 → score',20,TEAL)
    c.text(48,434,'CLONED-SPEECH COSINE SIMILARITY ↓',17,TEAL,700)
    c.text(48,468,'Table 1 · lower is better for protection',19,MUTED)
    # Paired bars: exact published values; common zero-based axis.
    start, end, y0, ymax = 48, 909, 706, 188
    for v in [0,.5,1.0]:
        y=y0-v*ymax;c.line(start,y,end,y,LINE,1);c.text(928,y+6,f'{v:.1f}',16,MUTED)
    for x,k,base,ours in [(147,1,.70,.58),(407,16,.88,.72),(667,64,.92,.78)]:
        c.rect(x,y0-base*ymax,66,base*ymax,'#a6b3c4','#a6b3c4',3)
        c.rect(x+78,y0-ours*ymax,66,ours*ymax,TEAL,TEAL,3)
        c.text(x+33,y0-base*ymax-11,f'{base:.2f}',20,MUTED,600,'middle')
        c.text(x+111,y0-ours*ymax-11,f'{ours:.2f}',20,TEAL,600,'middle')
        c.text(x+71,740,f'K = {k}',19,INK,600,'middle')
    c.rect(48,758,14,14,'#a6b3c4','#a6b3c4',2);c.text(72,771,'No defense',17,MUTED)
    c.rect(247,758,14,14,TEAL,TEAL,2);c.text(271,771,'CloneBlock-RT',17,TEAL)
    c.rect(1003,430,389,343,'#edf5f1','#bed8d0')
    c.text(1032,476,'What this establishes',22,TEAL,600)
    c.text(1032,520,'0.12–0.16 lower similarity',23,INK,600)
    c.text(1032,558,'in synthesized speech, across',19,MUTED)
    c.text(1032,587,'the three tested clip counts.',19,MUTED)
    c.text(1032,636,'What it does not establish',21,RED,600)
    c.text(1032,674,'An impersonation failure rate,',19,MUTED)
    c.text(1032,703,'or protection against every',19,MUTED)
    c.text(1032,732,'encoder and cloning backend.',19,MUTED)
    c.footer('Methods §2.3 / §3.3 · Windows may overlap: K is not unique speech duration · Unprotected centroid is used for scoring only.')
    c.save('04-session-evaluation')


def cover():
    c=Canvas('CloneBlock-RT: causal protection before telephone transmission',800,1280)
    c.text(70,76,'TRUSTWORTHY SPEECH  /  RESEARCH MANUSCRIPT',19,TEAL,700)
    c.text(70,163,'CloneBlock-RT',76,INK,600)
    c.text(73,215,'Protect the call. Reduce voice reuse.',30,MUTED)
    c.rect(70,287,1140,320,'#edf5f1','#a8cdc1',26)
    c.wave(112,444,256,128,BLUE)
    c.arrow(393,444,461,444)
    c.path('M545 365L653 365L684 390V470Q675 522 599 550Q523 522 514 470V390Z',TEAL,4)
    c.heat(543,399,112,72);c.text(599,510,'CAUSAL',19,TEAL,700,'middle')
    c.arrow(722,444,788,444)
    c.wave(817,444,342,111,TEAL)
    c.text(72,685,'Single pass',28,INK,600);c.text(72,724,'No iterative online optimization',18,MUTED)
    c.text(501,685,'32-band gains',28,INK,600);c.text(501,724,'Input-dependent spectral protection',18,MUTED)
    c.text(931,685,'Telephone-aware',28,INK,600);c.text(931,724,'Trained after matched channels',18,MUTED)
    c.save('cover')


if __name__ == '__main__':
    overview(); online(); training(); evaluation(); cover()
    print('Rendered 5 standalone SVG figures:', OUT)
